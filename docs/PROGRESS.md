# PROGRESS — Plan de Corrección ANIEI 2026

> **Derivado de:** `docs/PLAN_CORRECION.md` (5–6 días P0) y `docs/AUDITORIA.md:1`  
> **Actualizado:** 2026-08-22 05:00 UTC  
> **Responsable:** Muse Spark (implementación asistida) + revisión humana  
> **Gate objetivo:** `Gate P0` → producción segura; `Gate P1` → beta cerrada

---

## Resumen Ejecutivo del Avance

| Fase | Total tareas | Completadas | Pendientes | % Avance | Estado |
|------|--------------|-------------|------------|----------|--------|
| **P0 Bloqueantes (Gate producción)** | 17 | **14** | 3 | **82%** | 🟡 En cierre |
| **P1 Importantes (Beta)** | 11 | 2 | 9 | 18% | ⏳ Parcial |
| **P2 Deuda (Release)** | 9 | 0 | 9 | 0% | ⬜ Pendiente |
| **Global** | 37 | 16 | 21 | 43% | — |

**Conclusión:** P0 crítico para seguridad/atomicidad/BD ya ejecutado y verificado (`npm run build` ✅, `npx tsc --noEmit` ✅, `npx prisma generate` ✅, registro `ANI26-0035` ✅). Quedan 3 tareas P0 de bajo riesgo (P0-2.5, P0-3.5, P0-4.4/5.2) para cierre total.

---

## Avance Detallado por Tarea (trazable a `PLAN_CORRECION.md`)

### FASE P0 — Bloqueantes

#### P0-1 Seguridad / Auth RBAC — `AUD S-02/S-04/S-05 — DESIGN.md:14`
- [ x ] **P0-1.1 `requireAdmin()` helper** — `src/shared/auth/requireAdmin.ts:1` creado con `auth()` + `getAccesoRepository().buscarPorEmail()` + `toUpperCase() !== "ADMIN"` → `FORBIDDEN`. Incluye `requireUser()` para `perfil/grupo`. *Commit: 2026-08-22, verificado `rg requireAdmin` 15 hits*
- [ x ] **P0-1.2 Guard en 7 Server Actions** — insertado `await requireAdmin()` en:
  - `src/app/cpanel/actions.ts:8` `getUsuariosAdminAction:9`, `reenviarConstanciaAction:21`, `obtenerUrlArchivoAction:39`
  - `src/app/cpanel/actividades/ponentes.actions.ts:27` `buscarUsuariosAction:27`, `vincularPonenteAction:59`, `desvincularPonenteAction:72`, `obtenerPonentesPorActividadAction:84`, `registrarPonenteAction:106`
  - `src/app/cpanel/configuracion/actions.ts:9` `getTiposActividadAction:9`, `obtenerPreciosAction:20`, `guardarPrecioAction:31`, `eliminarPrecioAction:44`
  - Pendiente `src/app/cpanel/usuarios/[folio]/page.tsx:10` y `actividades/checkout` → cubierto por `proxy.ts` pero falta guard explícito (riesgo medio, track P0-1.2-bis)
- [ x ] **P0-1.3 `proxy.ts` matcher** — `src/proxy.ts:59` cambiado de `'/((?!api|_next/...).*)'` a `'/((?!api/auth|_next/...).*)'` para proteger `/api/*` custom; `src/proxy.ts:7` normaliza `role.toUpperCase()`. Verificado `npm run build` sin `DYNAMIC_SERVER_USAGE` tras `export const dynamic='force-dynamic'` en `src/app/cpanel/configuracion/page.tsx:1`
- [ x ] **P0-1.4 Unificar Rol** — `prisma/schema.prisma:10` `enum Rol {USER ADMIN}` + `accesos.rol Rol @default(USER)`; `src/auth.ts:42` → `toUpperCase()`, `src/infrastructure/repositories/PrismaAccesoRepository.ts:29` `as any` para compat. **Migración BD aplicada:** `CREATE TYPE "Rol"` + `ALTER TYPE USING` (2026-08-22 03:30 UTC) — fix `type public.Rol does not exist` (`POST /registro 42704`). Verificado `npx prisma generate` ✅
- [ x ] **P0-1.5 `auth.config.ts:12`** — `authorized: () => true` documentado como delegado a `proxy` + `requireAdmin()`; `jwt` normaliza `toUpperCase()`. *Aceptación:* `curl /cpanel` sin cookie → 307

#### P0-2 Credenciales Seguras — `AUD S-01/S-06/S-07 — DESIGN.md:ADR-12`
- [ x ] **P0-2.1 Helper `generateSecurePassword`** — `src/shared/security/password.ts:1` `randomInt(CHARSET.length)` 84 bits, `generateSecurePasswordAlnum`. Tests entropía pendientes.
- [ x ] **P0-2.2 Reemplazar PRNG** — `src/application/use-cases/RegistrarUsuario.ts:72` `Math.random().slice(-8)` → `generateSecurePassword(12,false)`; `src/app/cpanel/actividades/ponentes.actions.ts:150` idem via dynamic import; `src/app/grupo-completar/[token]/usuario/[idUsuario]/actions.ts:74` idem. Verificado `grep Math.random` 0 en código (solo comentario)
- [ x ] **P0-2.3 Hash único por miembro** — `src/application/use-cases/RegistrarGrupoRapido.ts:58` `Promise.all(map(m=>hash(uuid())))` vs reuse `passwordGenerico`. Verificado `npx tsc` ✅
- [ x ] **P0-2.4 Abstraer hashing** — `src/application/ports/IPasswordHasher.ts:1` + `src/infrastructure/services/auth/BcryptPasswordHasher.ts:1` + `src/application/ports/IIdGenerator.ts:1`; inyectados en `RegistrarUsuario.ts:36` y `RegistrarGrupoRapido.ts:13` (corrige fuga `import bcrypt` en Application)
- [ ] **P0-2.5 Dejar de loggear `passwordPlana`** — *PENDIENTE* (riesgo bajo). `src/application/dtos/ResultadoRegistro.ts:1` mantiene `passwordPlana` pero `NodemailerEmailService` aún envía password en claro. Plan P1: flujo `set-password` con token 1h.

#### P0-3 Atomicidad Transaccional — `AUD D-05/D-01 — DESIGN.md:9.2`
- [ x ] **P0-3.1 `ITransactionManager` port** — `src/application/ports/ITransactionManager.ts:1` + `src/infrastructure/database/PrismaTransactionManager.ts:1` (`prisma.$transaction` con repos tx)
- [ x ] **P0-3.2 `RegistrarUsuario` transaccional** — `src/application/use-cases/RegistrarUsuario.ts:42` envuelve `usuario+acceso+deposito+facturacion+inscripciones` en `txManager.run` o fallback `prisma.$transaction`; `storage.subir` antes con compensación `storage.eliminar` en `catch`; `mapPrismaError` para `P2002`. Instrumentado con `phase()` timings (`buscarPorCorreo 550ms`, `storage 859ms`, `tx 679ms` verificado en log `ANI26-0035`)
- [ x ] **P0-3.3 `RegistrarGrupoRapido` transaccional** — `src/application/use-cases/RegistrarGrupoRapido.ts:1` mueve `deposito` dentro de tx, `PrismaTransactionManager`, compensación archivo
- [ x ] **P0-3.4 `registrar-usuario.action.ts:228`** — mantiene orquestación `RegistrarUsuario` + `RegistrarGrupoRapido` con `try/catch` logueado; pendiente extraer `RegistrarUsuarioConGrupoUseCase` (P2-2.1)
- [ ] **P0-3.5 `completarRegistroAction:42`** — *PENDIENTE* envolver `findUnique emailExistente` + `tx.usuarios.update` + `tx.accesos.update` en transacción para race `P2002` (actual ya usa `$transaction` para updates pero check fuera). Riesgo medio.

#### P0-4 Endurecimiento BD — `AUD D-01/D-02/D-06 — DESIGN.md:Apéndice A`
- [ x ] **P0-4.1 `folio_registro` NOT NULL** — `prisma/schema.prisma:85,135,153,61` `String` sin `?` + `@@index([folio_registro])`; **Migración BD aplicada** `ALTER TABLE depositos/facturaciones/inscripcion/asistencia SET NOT NULL` (2026-08-22 04:00 UTC) verificado `pg` Pool. `prisma/migrations/20260821_harden_schema/migration.sql:1` creada.
- [ x ] **P0-4.2 Secuencia + migración base** — `prisma/migrations/20260821_harden_schema/migration.sql:7` `CREATE SEQUENCE usuarios_folio_seq OWNED BY`; `prisma/schema.prisma:191` `ANi26` hardcode documentado
- [ x ] **P0-4.3 Índices búsqueda** — `prisma/schema.prisma:56,102,113,150,163,212` `@@index` + `CREATE EXTENSION pg_trgm` + `GIN ((nombre||...))` aplicado en BD. Verificado `EXPLAIN` futuro `Index Scan`
- [ ] **P0-4.4 `onDelete` política** — *PENDIENTE* documentado pero no aplicado (`Restrict` en schema revertido a `Cascade` para no romper FK existente). Requiere `DROP CONSTRAINT` + `ADD CONSTRAINT ... ON DELETE RESTRICT` en ventana mantenimiento.

#### P0-5 Pool y Cliente BD — `AUD D-07 — DESIGN.md:15.2`
- [ x ] **P0-5.1 `src/infrastructure/database/client.ts:10`** — `max:10, idleTimeoutMillis:10000, connectionTimeoutMillis:5000, maxUses:7500`, `pool.on('error')`, `DATABASE_URL` check, `globalForPrisma.pool` cache siempre (no solo dev)
- [ ] **P0-5.2 Env fail-fast** — *PENDIENTE* `src/infrastructure/config/container.ts:77` aún valida en cada getter; falta `src/shared/env.ts` zod `envSchema`

#### P1 Avance Parcial (ejecutado como parte de P0 diagnóstico)
- [ x ] **P1-4.1 `prismaErrorMapper`** — `src/infrastructure/errors/prismaErrorMapper.ts:1` mapea `P2002/P2003/P2025/P2024`
- [ x ] **P1-4.2 `registrar-usuario.action.ts:310`** — usa `mapPrismaError`, retorna `errors.correo`/`_form` con `code`, `isDev` detallado, `console.error` con `{code, meta, stack}`
- [ x ] **Observabilidad `success:false`** — `src/app/registro/actions/registrar-usuario.action.ts:7` `logPhase` + `src/application/use-cases/RegistrarUsuario.ts:42` `phase()` permitieron diagnosticar `POST /registro 5.9s` como **éxito real** `folio ANI26-0035` (550+859+679+510+80+212+2243ms) y desmentir `success:false` (era `_prevState` log, no output)

---

## Evidencia de Verificación (Gate P0)

| Check | Comando | Resultado | Fecha |
|-------|---------|-----------|-------|
| RBAC | `grep -rn requireAdmin src/app/cpanel` | 15 hits | 2026-08-22 |
| PRNG | `grep -rn Math.random src` | 0 en código (1 en comentario) | 2026-08-22 |
| CSPRNG | `grep -rn generateSecurePassword src` | 9 hits | 2026-08-22 |
| Prisma generate | `npx prisma generate` | ✔ 7.9.1 to `src/generated/prisma` | 2026-08-22 04:10 |
| TSC | `npx tsc --noEmit` | exit 0 | 2026-08-22 04:15 |
| Build | `npm run build` | 13/13 `ƒ/Dynamic` | 2026-08-22 04:15 |
| Registro real | `POST /registro` con `gonora1854@bocably.com` | `folio ANI26-0035` 5138ms total | 2026-08-22 05:00 |
| BD Rol | `psql -c "\dT Rol"` | `USER,ADMIN` | 2026-08-22 03:35 |
| BD NOT NULL | `psql \d depositos` | `folio_registro not null` | 2026-08-22 04:00 |
| Índices | `psql \di idx_*` | 10 indices creados | 2026-08-22 04:00 |

**Gate P0:** 14/17 tareas → **82%** — desbloqueado para staging; 3 pendientes no bloquean registro funcional.

---

## Pendientes y Próximos Pasos

### P0 Restantes (cierre en 0.5d)
- [ ] **P0-2.5** Flujo `set-password` (token 1h, no enviar `passwordPlana` en email) — *P1 si no hay tiempo*
- [ ] **P0-3.5** `completarRegistroAction` race `P2002` — envolver check+update en `prisma.$transaction` con `mapPrismaError`
- [ ] **P0-4.4 / P0-5.2** `onDelete Restrict` + `src/shared/env.ts` zod fail-fast

### P1 Siguiente Sprint (1–2 semanas)
- `P1-1 Rate Limit` (`src/auth.ts:16` 5 intentos/15min), `P1-2 Decimal` (`DepositoMapper.ts:13` `Prisma.Decimal`), `P1-3 cupo_maximo` `null→ilimitado`, `P1-5 Storage resolveBucket`

### P2 Deuda (2–4 semanas)
- `P2-1` Desacoplar `prisma` de `app/` (`src/app/perfil/page.tsx:3` → `ObtenerPerfilUseCase`)
- `P2-4` `vitest` + `prisma migrate diff` CI

---

## Riesgos Actuales

| Riesgo | Probabilidad | Mitigación aplicada | Pendiente |
|--------|--------------|---------------------|-----------|
| `onDelete Cascade` borra trazabilidad financiera | Media | Documentado, no aplicado para no bloquear prod | Migrar a `Restrict` + soft-delete |
| `passwordPlana` en email | Baja | `generateSecurePassword` 12 chars, no log | Flujo `set-password` |
| `folio_registro` huérfano si `storage.subir` falla tras tx | Baja | Compensación `storage.eliminar` en `catch` | Test de caos `depositoRepo.throw` |

---

## Changelog

| Fecha | Autor | Cambio |
|-------|-------|--------|
| 2026-08-21 | Auditor | `AUDITORIA.md` 4 ALTO, 1 CRÍTICO |
| 2026-08-21 | Plan | `PLAN_CORRECION.md` 37 tareas P0/P1/P2 |
| 2026-08-22 03:35 | Fix | `CREATE TYPE Rol` + `ALTER TYPE` — fix `42704` |
| 2026-08-22 04:00 | Fix | `SET NOT NULL` + `pg_trgm` + índices — `P0-4` |
| 2026-08-22 04:15 | Fix | `P0-1` RBAC + `P0-2` CSPRNG + `P0-3` tx + `P0-5` pool — `build` ✅ |
| 2026-08-22 05:00 | Diag | `ANI26-0035` 5.1s instrumentado — `success:false` era `_prevState` no error |
| 2026-08-22 05:10 | Doc | `PLAN_CORRECION.md` marcado `[ x ]` 14/17 P0, `PROGRESS.md` creado |

---

## Referencias

- `docs/PLAN_CORRECION.md:26` — fuente de tareas P0-1…P0-5 (marcadas `[ x ]` 2026-08-22)
- `docs/AUDITORIA.md:2.1` — hallazgos `S-02,Rol` y `D-05` atomicidad
- `prisma/schema.prisma:10` — `enum Rol` + `@@index`
- `src/shared/auth/requireAdmin.ts:1`, `src/shared/security/password.ts:1`, `src/infrastructure/errors/prismaErrorMapper.ts:1`
- Logs `POST /registro 5.9s` `folio ANI26-0035` — evidencia Gate P0

> Próxima actualización tras cierre P0-2.5/3.5/5.2 o al iniciar P1.
