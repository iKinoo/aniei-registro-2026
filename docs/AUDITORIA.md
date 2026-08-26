# AUDITORÍA — Sistema de Registro ANIEI 2026

> **Fecha:** 2026-08-21  
> **Alcance:** Diseño documentado en `docs/DESIGN.md` vs. implementación real en `src/`, `prisma/`, `supabase/`  
> **Stack auditado:** Next.js 16 · React 19 · Prisma 7 + `@prisma/adapter-pg` · PostgreSQL (Supabase) · Auth.js v5 · Nodemailer · `@react-pdf/renderer` · `qrcode` · `bcryptjs` · Zod 4  
> **Metodología:** Inspección estática de código (evidencia `file:línea`), contraste con `DESIGN.md` §1–17 + Apéndices, análisis de seguridad, BD, arquitectura hexagonal y calidad. Sin ejecución dinámica ni pentest.

---

## Resumen Ejecutivo

| Dimensión | Calificación | Comentario |
|-----------|--------------|------------|
| **Arquitectura hexagonal (§4–§6 DESIGN.md)** | 🟡 Bueno con desvíos críticos | Dominio puro y ports bien definidos, pero `app/` accede directo a `prisma` (~12 ocurrencias) rompe RNF-02. |
| **Modelo de dominio (§7)** | 🟡 Adecuado | VOs puros; `Usuario` anémico y `GrupoRegistro` no usado en flujo real. |
| **Ports & Adapters (§8)** | 🟢 Bueno | 14 ports segregados; fugas menores (`token`/`passwordHash` en `IUsuarioRepository`). |
| **Casos de uso (§9–§11)** | 🟡 Medio | `RegistrarUsuario` god-use-case sin transacción; `RegistrarGrupoRapido` correcto pero con hash reutilizado. |
| **Módulo grupal (§12)** | 🟢 Funcional | Grupo Rápido con token/QR bien resuelto; divergencia con flag documentado. |
| **Módulo actividades (§13)** | 🟢 Bueno | `SELECT FOR UPDATE` correcto; falta doc de `cupo=0 → ilimitado`. |
| **Auth & CPanel (§14)** | 🔴 Crítico | Faltan guards RBAC en Server Actions `cpanel/*`, `authorized:()=>true`, PRNG débil. |
| **Infra interchangeable (§15)** | 🟡 Medio | Container factory ok; cambio de BD requiere tocar `app/` por acoplamiento. |
| **Data Mapper (§16)** | 🟢 Bueno | Mappers aislados, pero `Number(Decimal)` pierde precisión. |
| **Persistencia (Prisma/Schema)** | 🔴 Crítico | `folio_registro` nullable en hijos, sin índices, `onDelete Cascade` peligroso, sin migraciones. |
| **Seguridad** | 🔴 Crítico | 4 hallazgos ALTO (password `Math.random`, RBAC faltante, rate-limit ausente, `api` matcher). |
| **Calidad / Mantenibilidad** | 🟡 Medio | Duplicación `validarArchivo`/`RFC regex`, `bcrypt` en Application. |
| **Testing / Observabilidad** | 🔴 Crítico | Sin suite de tests, sin logs estructurados, sin `prisma` error mapping. |
| **Despliegue** | 🟡 Medio | `DATABASE_URL` pooler correcto pero `Pool` sin límites y leak en prod. |

**Conclusión global:** Proyecto **funcional y desplegable**, arquitectura base sólida y alineada con `DESIGN.md`, pero **no listo para producción sin correcciones críticas** de seguridad, atomicidad de transacciones y endurecimiento de BD. Tras bloqueantes (4 altos) el riesgo residual es medio.

---

## 1. Cumplimiento de `DESIGN.md` por Capítulo

### §4 Arquitectura Limpia y §6 Diagrama de Capas — *Cumple parcialmente*

**Conforme:**
- Separación `core` (puro TS), `application` (ports/DTOs/use-cases), `infrastructure` (Prisma/mappers/services), `app` (presentation) verificada — `DESIGN.md:87-121` refleja código real `src/core`, `src/application`, `src/infrastructure`, `src/app` (`DESIGN.md:144-322` actualizado).
- Server Actions como controllers (`DESIGN.md:124-138`) — `src/app/registro/actions/registrar-usuario.action.ts:1` y `src/app/cpanel/actions.ts:1` validan Zod y delegan a use-cases.

**Desvío crítico — RNF-02 violado:**
- `DESIGN.md:69 RNF-02` exige que cambiar BD no afecte casos de uso. **12 Server Components/Actions importan `prisma` directo**, ej.:
  - `src/app/perfil/page.tsx:3` `import { prisma } …`; `src/app/perfil/page.tsx:17,36,52` queries directas
  - `src/app/grupo-completar/[token]/page.tsx:2`; `src/app/cpanel/usuarios/[folio]/page.tsx:14`; `src/app/actividades/checkout/actions.ts:24`  
  → Cambiar Prisma→Drizzle exige tocar `app/`. Debe migrar a `IUsuarioQuery`/`IGrupoRepository` + use-cases (`ObtenerPerfilUseCase`).

> **Ref DESIGN.md:** §4 diagrama `Presentation → Application → Domain ← Infrastructure`; §15.3 tabla `Supabase → VPS` “qué NO cambia”. **Evidencia** invalida la tabla.

### §5 Estructura de Directorios — *Ahora conforme tras actualización*

`DESIGN.md:144-322` actualizado coincide con árbol real. Hallazgo menor: `DESIGN.md:318` lista `titulos` pero no menciona `cargos` (tabla huérfana existente en `prisma/schema.prisma:62`).

### §7 Modelo de Dominio — *Conforme con ajustes*

**Conforme:**
- `DESIGN.md:385-543` diagrama actualizado ( `Usuario.idTitulo` no `idCargo` ) coincide con `src/core/entities/Usuario.ts:7-22`.
- VOs inmutables con factory (`DESIGN.md:463-498`) — `src/core/value-objects/Email.ts:1`, `ArchivoComprobante.ts:1`, `Monto.ts:1` puros.

**Observaciones:**
- **MEDIO — Entidad anémica:** `Usuario.create` solo valida `nombre/apellido` (`src/core/entities/Usuario.ts:57`), `idTitulo/idInstitucion` sin VO → permite `0` que `UsuarioMapper.ts:20-22` `??0` enmascara. `Acceso.ts:2` anémico, `isAdmin()` debería ser `Rol` VO (`DESIGN.md:503` actualizado menciona deuda).
- **BAJO — GrupoRegistro duplicado:** `GrupoRegistro.obtenerTodos()` y `obtenerNuevosRegistros()` idénticos (`src/core/entities/GrupoRegistro.ts:77-89`) y no usado por `RegistrarGrupoRapido` que crea miembros dummy directo — `DESIGN.md:560` lo documenta como “no se usa en flujo rápido”.

> **Ref DESIGN.md:** §7.1 nota “Usuario usa `idTitulo`” y §7.2 catálogos `Titulo` — alineado. Recomendación: introducir `IdTitulo` VO y `Rol` enum.

### §8 Puertos y Adaptadores — *Conforme con fugas*

**Conforme:** 14 ports (`DESIGN.md:584-694`) segregados, DIP correcto (`src/application/ports/IUsuarioRepository.ts:1`, `src/infrastructure/repositories/PrismaUsuarioRepository.ts:8`).

**Fugas (MEDIO):**
- `IUsuarioRepository.crearGrupoTransaccional` (`DESIGN.md:628-634`, `src/application/ports/IUsuarioRepository.ts:13`) expone `token`, `correoDummy`, `passwordHash` (detalle infra `bcrypt` filtrado a Application). Debería ser `HashedPassword` VO + `GrupoId`.
- `IStorageService.parseFileReference` en mismo archivo que interfaz (`src/application/ports/IStorageService.ts:6`) mezcla util+port; `SupabaseStorageService.ts:12` decide bucket por `startsWith('constancias/')` hardcode — nuevo bucket `comprobantes_grupo/` (`src/application/use-cases/RegistrarGrupoRapido.ts:37`) funciona por accidente.
- `IAdminQueryService` retorna `UsuarioForAdminDTO` con `monto:number` (`DESIGN.md:682`) fuga `Decimal→Number`.

> **Ref DESIGN.md:** §8.2 container `getPrecioInscripcionRepository()` ahora incluido (`DESIGN.md:763`) — conforme tras parche.

### §9 Casos de Uso — *Riesgo alto por falta de atomicidad*

**Conforme:** Diagrama `DESIGN.md:878-945` lista 14 use-cases; implementación `src/application/use-cases/*.ts` coincide en dependencias.

**Bloqueante CRÍTICO — Sin transacción end-to-end:**
- `DESIGN.md:907-922` UC-01 describe 16 pasos como flujo atómico. **Código** `src/application/use-cases/RegistrarUsuario.ts:35-167` ejecuta `storage.subir (49)` fuera de tx, luego 4 writes no transaccionales (`usuarioRepo.crear 66`, `accesoRepo.crear 72`, `depositoRepo.crear 97`, `inscripcionRepo.crearMuchasConValidacion 118`). Si `depósito` falla queda `usuarios` huérfano y archivo huérfano en Supabase sin compensación.
- `DESIGN.md:926-941` UC-02 Grupo Rápido: `src/application/use-cases/RegistrarGrupoRapido.ts:40-75` `depositoRepo.crear (55)` fuera de `crearGrupoTransaccional (68)` → depósito huérfano si tx falla. `src/app/registro/actions/registrar-usuario.action.ts:228-261` orquesta `RegistrarUsuario` + `RegistrarGrupoRapido` secuencial con `catch { console.error }` sin rollback.
- **Evidencia DB** `prisma/schema.prisma:171` `folio_registro` PK generado por `nextval` atómico ok, pero secuencia no declarada en `prisma/migrations/` (drift).

> **Ref DESIGN.md:** §9.2 tabla “Postcondición: Usuario creado…” asume atomicidad — no garantizada.

### §10 Diagramas de Secuencia — *Ahora alineados*

`DESIGN.md:954-1074` actualizados reflejan código real (password `bcrypt`, `proposito GRUPO_RAPIDO`, QR). Sin desvío tras parche.

### §11 Diagramas de Flujo — *Alineados*

`DESIGN.md:1078-1100` 3 flujos reflejan `RegistroForm.tsx:82` `total = costoBase + costoMiembro*n`.

### §12 Módulo de Registro Grupal — *Divergencia documentada*

**Antes:** `DESIGN.md` §12 histórico refería `ENABLE_GROUP_REGISTRATION` flag. **Ahora** `DESIGN.md:1102-1190` documenta Grupo Rápido autenticado con tabla `grupos_registro` — alineado con `prisma/schema.prisma:205` y `src/application/use-cases/RegistrarGrupoRapido.ts:13`. Hallazgo **MEDIO**: reuse de `passwordHash` único para N miembros (`src/application/use-cases/RegistrarGrupoRapido.ts:58-63`) correlaciona hashes.

### §13 Módulo de Actividades — *Conforme, matiz*

`DESIGN.md:1208-1234` correcto; implementación `src/infrastructure/repositories/PrismaInscripcionActividadRepository.ts:72-98` `SELECT … FOR UPDATE` serializa bien. **MEDIO:** `cupo_maximo=0` tratado como ilimitado (`DESIGN.md:1280`) choca con `schema.prisma:35 @default(0)` — admin no puede distinguir “sin cupo” vs “ilimitado”. Falta doc.

### §14 Autenticación y CPanel — *Bloqueante*

**Conforme:** `DESIGN.md:1260-1309` describe Auth.js Credentials + `proxy.ts` — `src/auth.ts:16`, `src/auth.config.ts:5`, `src/proxy.ts:7` coinciden.

**Bloqueantes (ver §5 Seguridad):**
- `DESIGN.md:1272` “`proxy.ts` protege /cpanel” cierto, pero `DESIGN.md` omite que `src/app/cpanel/actions.ts:8,21`, `src/app/cpanel/actividades/ponentes.actions.ts:27`, `src/app/cpanel/configuracion/actions.ts:9` **no tienen guard `auth()+isAdmin()`** — solo `proxy` (bypass si matcher excluye `api`).
- `DESIGN.md:1292` limita `IAdminQueryService` a `page/limit/search` — correcto; `src/infrastructure/services/PrismaAdminQueryService.ts:16 whereClause:any` sin validación `page/limit` NaN.

### §15 Infra Intercambiable — *Parcial*

`DESIGN.md:1313-1366` container y mapa ok. **Roto por §4 desvío:** no es “solo adaptador” si `app/` importa `prisma`.

### §16 Data Mapper — *Conforme con deuda*

`DESIGN.md:1370-1445` diagrama y ejemplo `UsuarioMapper` alineados con `src/infrastructure/mappers/UsuarioMapper.ts:8`. **MEDIO:** `Number(Decimal)` en `DepositoMapper:13`, `PrismaAdminQueryService:58` pierde precisión (`Decimal(10,2)` → float).

### §17 ADRs — *Actualizados*

`DESIGN.md:1450-1565` 15 ADRs; ADR-03,07,08 reescritos a Grupo Rápido, ADR-14 Precios, ADR-15 Proxy. **BAJO:** ADR-02 menciona `DIRECT_URL` no usado en `client.ts`.

### Apéndices A/B/C — *Alineados tras parche*

`DESIGN.md:1569-1840` mapeo y env vars reflejan `prisma/schema.prisma:1-221` y `src/infrastructure/config/container.ts:63-84`.

---

## 2. Hallazgos Transversales

### 2.1 Seguridad — *4 ALTO, 3 MEDIO*

| # | Hallazgo | Severidad | Ref | Mitigación `DESIGN.md` |
|---|----------|-----------|-----|------------------------|
| S-01 | **PRNG débil:** `Math.random().toString(36).slice(-8)` 41 bits, predecible | 🔴 ALTO | `src/application/use-cases/RegistrarUsuario.ts:70`; `src/app/cpanel/actividades/ponentes.actions.ts:150` | §17 ADR-12 migrar a `crypto.randomInt`/`nanoid` |
| S-02 | **RBAC faltante en Server Actions** `cpanel/*` sin `auth()` guard | 🔴 ALTO | `src/app/cpanel/actions.ts:8,21`; `src/app/cpanel/actividades/ponentes.actions.ts:27,59,72` | §14 y §10.3 – añadir `requireAdmin()` helper |
| S-03 | **Sin rate-limit login** `bcrypt.compare` sin lockout | 🔴 ALTO | `src/auth.ts:16,32`; `src/app/login/actions.ts:7` | §14.1 – `upstash/ratelimit` + `authorized` real (`src/auth.config.ts:12` es `()=>true`) |
| S-04 | **`proxy matcher excluye api`** `/api/*` sin proxy | 🔴 ALTO | `src/proxy.ts:59` `!api`; `src/auth.config.ts:12` | §14.1 – proteger handlers o incluir `api` |
| S-05 | **RBAC inconsistente** `Acceso.isAdmin()` `toLowerCase` vs `proxy ==='ADMIN'` | 🟡 MEDIO | `src/core/entities/Acceso.ts:27` vs `src/proxy.ts:20,41` | §14.1 – enum `Rol` + `toUpperCase()` |
| S-06 | **Password en claro por email + `passwordPlana`** | 🟡 MEDIO | `src/infrastructure/services/email/templates/confirmacion.ts:58` | §17 ADR-09 – flujo `set-password` con token 1h |
| S-07 | **Hash reutilizado grupo** mismo `passwordHash` para N | 🟡 MEDIO | `src/application/use-cases/RegistrarGrupoRapido.ts:58` | §12.1 – hash único por miembro |

### 2.2 Base de Datos — *1 CRÍTICO, 4 HIGH*

| # | Hallazgo | Sev | Ref | Relación con `DESIGN.md` |
|---|----------|-----|-----|---------------------------|
| D-01 | **Folio nullable en hijos** permite huérfanos, viola invariante `Deposito.folioRegistro: string` | 🔴 HIGH | `prisma/schema.prisma:75,120,53,136,12` `src/core/entities/Deposito.ts:6` | §16.1 “dominio nunca importa Prisma” – pero permite dato sucio |
| D-02 | **Sin índices FK** `depositos(folio)`, `usuarios(id_institucion)` → seq-scan, `contains mode:insensitive` sin `pg_trgm` | 🔴 HIGH | `prisma/schema.prisma` sin `@@index`; `src/infrastructure/services/PrismaAdminQueryService.ts:19` | Apéndice A – falta doc índices |
| D-03 | **`onDelete` inconsistente** `Cascade` en `usuarios` borra trazabilidad financiera; `NoAction` en `equipo_integrantes` bloquea | 🔴 HIGH | `prisma/schema.prisma:18,88,131,210` vs `97,107` | §15 no define política retención |
| D-04 | **Decimal→Number** pérdida escala | 🔴 HIGH | `src/infrastructure/mappers/DepositoMapper.ts:13`; `src/infrastructure/services/PrismaAdminQueryService.ts:58` | §16.3 ejemplo usa `Number()` |
| D-05 | **Sin transacciones** `RegistrarUsuario` no atómico, huérfano `accesos` | 🔴 CRÍTICO | `src/application/use-cases/RegistrarUsuario.ts:35` | §9.2 postcondición atómica falsa |
| D-06 | **Secuencia `ANI26` hardcode año + sin migración** `prisma/migrations` vacío | 🟡 MEDIUM | `prisma/schema.prisma:171`; `prisma/` solo `schema.prisma` | §17 ADR-11 – prefijo debe parametrizar |
| D-07 | **Pool sin límites, leak en prod** `globalForPrisma` solo en dev | 🟡 MEDIUM | `src/infrastructure/database/client.ts:11-24` | §15 container |

### 2.3 Calidad / Mantenibilidad

| # | Hallazgo | Sev | Ref |
|---|----------|-----|-----|
| C-01 | **God Use-Case** `RegistrarUsuario` 8 deps, 167 líneas, 11 pasos | MEDIO | `src/application/use-cases/RegistrarUsuario.ts:22` |
| C-02 | **Duplicación** `validarArchivo`×3, `MIMES`×2, `RFC regex`×2, bucket routing×4 | MEDIO | `src/shared/validation/registro.schema.ts:46`; `src/core/value-objects/ArchivoComprobante.ts:1`; `src/app/perfil/grupo/registro/actions.ts:36` |
| C-03 | **Infra en Application** `import bcrypt`, `crypto.randomUUID()` directo | MEDIO | `src/application/use-cases/RegistrarUsuario.ts:3,48` → debe ser `IPasswordHasher`/`IIdGenerator` |
| C-04 | **Lógica negocio en UI** `RegistroForm.tsx:82 total = costoBase + …` replica `GestionarPrecios` | BAJO | `src/app/registro/components/RegistroForm.tsx:82` |

### 2.4 Testing & Observabilidad — *Crítico*

- **Sin tests:** `package.json:5` scripts `dev/build/start/lint` sin `test`; repo sin `*.test.ts`, `__tests__/`, `vitest/jest`. `DESIGN.md` no exige, pero RNF de confiabilidad implícito. Use-cases puros (`RegistrarUsuario`) son testeables — oportunidad.
- **Sin error mapping:** `Prisma P2002/P2003/P2025` no capturado, burbujea a `_form` genérico (`src/app/registro/actions/registrar-usuario.action.ts:310` solo `code==='CORREO_DUPLICADO'`).
- **Sin logs estructurados:** `console.error`/`console.warn` dispersos (`src/application/use-cases/…`); sin `pino`/`sentry`.

### 2.5 Despliegue & Configuración

- **Env validación tardía:** `getEmailService():63` y `getStorageService():77` lanzan en runtime, no en boot (`src/infrastructure/config/container.ts:63-84`). Falta `zod` env schema + fail-fast.
- **Supabase Storage:** buckets `comprobantes`/`constancias` con `SupabaseStorageService.ts:12` routing frágil; `comprobantes_grupo/` cae a `comprobantes` por fallback.
- **Next config:** sin `headers CSP/HSTS`, `trustHost` no explicit.

---

## 3. Matriz de Riesgos Priorizada

| Prior | Riesgo | Impacto | Probabilidad | Esfuerzo | Owner |
|-------|--------|---------|--------------|----------|-------|
| **P0** | S-02 RBAC Server Actions + S-04 `api` matcher | Fuga PII / escalada | Alta | 1 d | Backend/Auth |
| **P0** | S-01 PRNG + S-07 hash reuse | Compromiso credenciales | Media | 0.5 d | Backend |
| **P0** | D-05 Transacción no atómica + D-01 nullable FK | Huérfano financiero, pérdida trazabilidad | Alta | 2 d | Backend/BD |
| **P1** | S-03 Rate-limit login | Brute force | Alta | 1 d | Backend |
| **P1** | D-02 Índices + D-03 onDelete | Perf seq-scan, borrado accidental | Media | 1 d | BD |
| **P1** | D-04 Decimal, D-07 pool | Cálculo monto, leak conexiones | Media | 0.5 d | Backend |
| **P2** | §4 acoplamiento `prisma` en `app/` | Deuda arquitectónica RNF-02 | Alta | 3 d | Arquitectura |
| **P2** | C-01/C-02 duplicación + god use-case | Mantenibilidad | Alta | 2 d | Backend |
| **P3** | Testing/observabilidad | Regresiones silenciosas | Alta | 5 d | QA |

---

## 4. Recomendaciones Accionables (referenciando `DESIGN.md`)

### Bloqueantes (hacer antes de producción)

**1. Endurecer Auth (`DESIGN.md:14`):**
- Crear `src/shared/auth/requireAdmin.ts` que haga `auth()` + `accesoRepo.buscarPorEmail` + `isAdmin()` y usar en **todas** las Server Actions `cpanel/*` (`src/app/cpanel/actions.ts:8`, `src/app/cpanel/actividades/ponentes.actions.ts:27`, `src/app/cpanel/configuracion/actions.ts:9`). Corregir `src/proxy.ts:59` matcher para incluir `api` o proteger cada `route.ts` con `auth()`. Unificar `Rol` a `enum` (`prisma/schema.prisma:14 @default("USER")` → `enum Rol`) y `toUpperCase()` en `src/auth.ts:42`.

**2. Generación segura de credenciales (`DESIGN.md:17 ADR-12`):**
- Reemplazar `Math.random().toString(36).slice(-8)` (`src/application/use-cases/RegistrarUsuario.ts:70`) por `crypto.randomInt` + charset 62, 12-16 chars, o `generateSecurePassword()` helper con `crypto.getRandomValues`. Generar hash único por miembro (`src/application/use-cases/RegistrarGrupoRapido.ts:58` no reutilizar).

**3. Atomicidad (`DESIGN.md:9.2`, `§16`):**
- Envolver `RegistrarUsuario.execute` en `prisma.$transaction(async tx => { … })` inyectando `TransactionClient` a repos (abstraer `ITransactionManager`). Incluir `storage.subir` con compensación `storage.eliminar` en `catch`. Hacer lo mismo para `RegistrarGrupoRapido` (mover `depositoRepo.crear` dentro de `crearGrupoTransaccional`). `src/app/registro/actions/registrar-usuario.action.ts:228` debe ser `RegistrarUsuarioConGrupoUseCase` transaccional.

**4. BD (`DESIGN.md:Apéndice A`):**
- Migración: `ALTER TABLE depositos ALTER COLUMN folio_registro SET NOT NULL` (igual `facturaciones`, `inscripcion_actividades`, `asistencia_actividades`; `accesos.folio_registro` NOT NULL tras corregir flujo transitorio `PrismaUsuarioRepository.ts:87-112` que crea acceso huérfano). Añadir `@@index([folio_registro])` en 6 tablas, `@@index([id_institucion])`, `pg_trgm` GIN para `nombre/apellido/correo`. Crear `prisma/migrations/*` con `CREATE SEQUENCE usuarios_folio_seq OWNED BY usuarios.folio_registro` y parametrizar prefijo año.

### Importantes (siguiente sprint)

**5. Rate-limit (`DESIGN.md:14.1`):** `upstash/ratelimit` o `next-rate-limit` en `src/auth.ts:16 authorize` + `src/app/login/actions.ts:7`, lockout 5 intentos/IP+email, captcha; fijar `session.maxAge=8h` en `src/auth.config.ts:5`.

**6. Pool (`DESIGN.md:15.2`):** `src/infrastructure/database/client.ts:11` `new Pool({ max:10, idleTimeoutMillis:10000, connectionTimeoutMillis:5000, maxUses: 7500 })`, cachear `globalForPrisma` siempre (no solo dev), `pool.on('error')`, check `if(!process.env.DATABASE_URL) throw`.

**7. Decimal (`DESIGN.md:16.3`):** `src/infrastructure/mappers/DepositoMapper.ts:13` `new Prisma.Decimal(monto.toFixed(2))` y `Number(row.costo)` → `row.costo.toNumber()` con `toFixed`, o mantener `Decimal` en dominio (`Monto` con `Decimal`).

**8. Desacoplar `app/` (`DESIGN.md:4`):** Extraer `src/application/use-cases/ObtenerPerfilUseCase`, `ListarGrupoPendienteUseCase` e inyectar en `src/app/perfil/page.tsx:10`, `src/app/grupo-completar/[token]/page.tsx:10`. Eliminar 12 `prisma` imports.

### Mejoras (deuda)

**9. Validación única:** Exponer `ArchivoComprobante.Constraints` (`MIMES`, `MAX 5MB`) y derivar Zod `registro.schema.ts:46`; unificar `RFC regex` en `shared/validation`; `Telefono` VO regex vs Zod `max(20)` alinear.

**10. Abstraer infra de dominio:** `IPasswordHasher`, `IIdGenerator` ports, `SupabaseStorageService.resolveBucket()`.

**11. Observabilidad & tests:** Añadir `vitest` con tests `RegistrarUsuario`, `Monto`, `Email`, `ArchivoComprobante`; `prisma` error mapper (`P2002→RegistroError.CORREO_DUPLICADO`); `pino` logger + Sentry.

---

## 5. Veredicto

- **Con `DESIGN.md`:** Tras actualización, el documento **refleja fielmente** la implementación (15 ADRs, 14 ports, Grupo Rápido, `proxy.ts`). Mantener sincronía exige CI que falle si `schema.prisma` cambia sin actualizar Apéndice A.
- **Con proyecto:** Base hexagonal sólida, flujos críticos funcionales (registro, grupo QR, actividades con `FOR UPDATE`, constancias PDF). **No promover a producción** sin P0 (RBAC, PRNG, transacciones, índices). Con P0 corregidos, **apto para beta cerrada**; con P1 para producción general.

---

## 6. Referencias Cruzadas

| Afirmación | Evidencia | DESIGN.md |
|------------|-----------|-----------|
| Wizard 3 pasos | `src/app/registro/components/RegistroForm.tsx:38` `STEPS 3` | §5 `RegistroForm` 3 pasos |
| `idTitulo` no `idCargo` | `src/core/entities/Usuario.ts:20` `idTitulo` | §7.1 nota `idTitulo` |
| 14 ports | `src/application/ports/*.ts` 14 archivos | §8.1 14 puertos |
| `FOR UPDATE` | `src/infrastructure/repositories/PrismaInscripcionActividadRepository.ts:72` | §13.6 |
| `proxy` protege | `src/proxy.ts:12-54` | §14.1 |
| Sin `prisma` en dominio | `grep core` cero | §4 RNF-01 |
| `prisma` en `app/` | `src/app/perfil/page.tsx:3` | Violación §4 RNF-02 |

---

*Auditoría generada por inspección estática sin ejecución. Para cierre de P0 se recomienda `npm run build`, `prisma migrate dev --create-only` review y revisión manual de RBAC con pruebas de penetración ligera.*
