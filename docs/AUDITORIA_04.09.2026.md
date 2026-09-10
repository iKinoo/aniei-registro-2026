# AUDITORÍA DE CAPACIDAD DE CAMBIO DE INFRAESTRUCTURA — Supabase → PostgreSQL local

> **Nombre:** `AUDITORIA_04.09.2026.md`
> **Fecha:** 2026-09-04
> **Alcance:** Capacidad de cambiar la infraestructura actual (Supabase Cloud: Postgres + Storage + Auth helpers) a PostgreSQL local / VPS propio, sin romper el sistema.
> **Stack auditado:** Next.js 16 · React 19 · Prisma 7 (`@prisma/adapter-pg` + `pg`) · PostgreSQL en Supabase · Auth.js v5 (Credentials + `accesos`) · Supabase Storage (`comprobantes`, `constancias`) vía `@supabase/supabase-js` + `@supabase/ssr` · Nodemailer · `@react-pdf/renderer`
> **Metodología:** Inspección estática de código con evidencia `archivo:línea`. Contraste con `docs/DESIGN.md`, `docs/AUDITORIA.md` (2026-08-21), `docs/PLAN_CORRECION.md` y `docs/PROGRESS.md`. Sin ejecución dinámica ni pentest. Valores de secretos **no reproducidos** (redactados como `[REDACTED]`).

---

## Resumen Ejecutivo

| Dimensión | Capacidad de cambio | Comentario |
|-----------|---------------------|------------|
| **Base de datos (Postgres Supabase → Postgres local)** | 🟢 **Alta — cambio trivial** | Prisma con `provider = "postgresql"` puro, sin RLS, sin PostgREST, sin Edge Functions, sin triggers `auth.*`. Solo cambiar `DATABASE_URL` / `DIRECT_URL`. |
| **Autenticación / sesiones** | 🟢 **Alta — sin migración** | Auth real es Auth.js + tabla `accesos` + bcrypt (`src/auth.ts:16`). Los helpers Supabase Auth (`@supabase/ssr`) son **código muerto** (0 imports desde `src/`). |
| **Almacenamiento de archivos** | 🟡 **Media — único acoplamiento real** | `IStorageService` abstrae bien, pero la única implementación es `SupabaseStorageService.ts:4`. Hay que escribir `LocalFilesystemStorageService` o S3/MinIO + migrar objetos. Esfuerzo 1–2 días. |
| **Configuración / despliegue** | 🟡 **Media — falta tooling local** | No hay `docker-compose.yml`, ni `.env.example`, ni `README` de despliegue (el actual es el template de `create-next-app`). Nombres de env acoplados a Supabase. Bug de nombre de env en helpers muertos. |
| **Migraciones / datos** | 🟡 **Media — dualidad peligrosa** | Dos historiales divergentes: `prisma/migrations/` (canónico, 10 migraciones) vs `supabase/migrations/` (legado, 7 migraciones, esquema viejo). Sin runbook de `pg_dump`/`restore` ni de secuencias. |
| **Deuda que NO bloquea este cambio** | ⚪ Informativo | `app/` importa `prisma` directo en ~14 archivos (viola RNF-02 para cambio de ORM, pero **no** para cambio de proveedor Postgres → Postgres). |

**Veredicto:** el sistema **sí es portable de Supabase a PostgreSQL local**. La capa de datos está desacoplada por diseño (Clean Architecture + Prisma). El único trabajo real es **Storage + tooling local + runbook de datos**. Estimación total: **2–4 días-persona** (1 dev senior; 1 día para BD+Auth+Compose, 1–2 días para Storage, 0.5–1 día para verificación end-to-end).

**Riesgo residual si se ejecuta el plan §4:** bajo.

---

## 1. Inventario de acoplamiento a Supabase (evidencia)

| # | Punto de acoplamiento | Evidencia | ¿Bloquea cambio a PG local? | Severidad |
|---|----------------------|-----------|------------------------------|-----------|
| A-01 | Cliente BD genérico (`pg` Pool + `PrismaPg`) | `src/infrastructure/database/client.ts:1-30` — `connectionString: process.env.DATABASE_URL`, `max:10`, `pool.on("error")` | **No.** Funciona idéntico contra PG local. Solo cambiar la URL. | 🟢 Ninguna |
| A-02 | Datasource Prisma genérico | `prisma/schema.prisma:6-8` — `provider = "postgresql"`, sin `directUrl` hardcodeado; `prisma.config.ts:11` usa `DIRECT_URL` | **No.** | 🟢 Ninguna |
| A-03 | Única implementación de Storage acoplada a Supabase | `src/infrastructure/services/storage/SupabaseStorageService.ts:1-75` — `createClient(supabaseUrl, serviceRoleKey)`, `.from(bucket).upload/download/createSignedUrl/remove` | **Sí, único bloqueante funcional.** Hay que implementar alternativa. | 🔴 Alto (pero acotado a 1 archivo + factory) |
| A-04 | Factory de Storage con env Supabase | `src/infrastructure/config/container.ts:85-92` — exige `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | **Sí, derivado de A-03.** Cambiar a factory conmutada por env (`STORAGE_PROVIDER`). | 🟡 Medio |
| A-05 | Helpers Supabase Auth/SSR muertos | `src/infrastructure/config/supabase/client.ts:1-8`, `server.ts:1-29`, `middleware.ts:1-53` — usan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | **No.** `grep "config/supabase" src` = 0 imports. `src/proxy.ts:1-59` usa NextAuth, no `updateSession`. Se pueden borrar. | 🟡 Medio (confusión + bug latente, ver A-06) |
| A-06 | Bug de nombre de env en helpers muertos | Helpers piden `..._PUBLISHABLE_DEFAULT_KEY`; `.env.local` provee `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sin `DEFAULT`). Si alguien los invocara, crashean con `!` non-null | **No hoy, sí si se reutilizan.** Unificar o eliminar. | 🟡 Medio |
| A-07 | Columna legado `accesos.auth_id` | `prisma/schema.prisma:21` `auth_id String? @unique @db.Uuid`; origen `supabase/migrations/20260328233536_cpanel_auth.sql:11`; leída en `PrismaAccesoRepository.ts:19,45` y `core/entities/Acceso.ts:8`, pero **nunca escrita** en `crear()` (`PrismaAccesoRepository.ts:30-38`) | **No.** Es nullable y opcional. Se puede mantener (inocua) o dropear en ventana de mantenimiento. | 🟢 Baja |
| A-08 | Buckets sin definición como código | `SupabaseStorageService.ts:12,44,59` hardcodea `constancias` vs `comprobantes` por `startsWith`; `IStorageService.ts:6-12` `parseFileReference`; **ningún** `.sql` ni script crea los buckets; `supabase/config.toml:109-120` solo habilita Storage genérico | **Sí parcial.** En PG local hay que decidir destino (filesystem/S3) y migrar objetos existentes. | 🟡 Medio |
| A-09 | URLs firmadas Supabase-específicas | `SupabaseStorageService.ts:31-41` `createSignedUrl(path, 300)` consumido por `ObtenerAccesoArchivo` → `src/app/cpanel/actions.ts:56`, `src/app/perfil/actions.ts:40` | **Sí parcial.** La interfaz `getAccess(file): Promise<string>` ya abstrae; la impl. local debe devolver URL local firmada o ruta servida por Next/API. | 🟡 Medio |
| A-10 | Doble historial de migraciones | `prisma/migrations/` (10 archivos, ej. `20260821_harden_schema/migration.sql:6-63` con `Rol`, índices, `pg_trgm`, `usuarios_folio_seq`) vs `supabase/migrations/` (7 archivos con esquema viejo: `depositos.id_usuario` en `20260328190006:6-15`, `referencia UNIQUE` ya dropeada en `20260329000851`, etc.) | **Riesgo operativo, no funcional.** Si alguien corre `supabase db push` pisa/driftea. | 🟡 Medio |
| A-11 | Versión PG fijada solo en Supabase CLI | `supabase/config.toml:36` `major_version = 17`; sin `docker-compose.yml` que fije `postgres:17` local | **No bloquea, pero exige alinear.** Usar PG 17 local para evitar drift de sintaxis. | 🟢 Baja |
| A-12 | Extensiones | Solo `pg_trgm` (`prisma/migrations/20260821_harden_schema/migration.sql:51-52` + índice GIN). Sin RLS/`POLICY`, sin `auth.*`, sin `storage.objects` triggers, sin `realtime` usado | **No.** `pg_trgm` existe en PG vanilla. | 🟢 Ninguna |
| A-13 | Env / secretos | `.env.local:1-14` contiene `DATABASE_URL`/`DIRECT_URL` (pooler `:6543` + directa `:5432`), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY=[REDACTED]`, `GMAIL_*=[REDACTED]`, `AUTH_SECRET=[REDACTED]`. `.gitignore:34` ignora `.env*` y `git ls-files` confirma que **no está trackeado** (bien). Sin `.env.example`. | **No bloquea, pero hay que rotar `service_role` si el archivo salió del equipo** y crear `.env.example` + `docker-compose.yml`. | 🟡 Medio (higiene) |
| A-14 | Dependencias Supabase | `package.json:16-17` `@supabase/ssr ^0.9.0`, `@supabase/supabase-js ^2.99.1` | **No bloquean PG local**, pero tras migrar Storage se pueden mover a `optional` o eliminar si se borran helpers muertos. | 🟢 Baja |
| A-15 | `supabase/config.toml` servicios innecesarios | `[realtime] enabled=true:81`, `[storage.s3_protocol] enabled=true:122` (útil para migrar objetos fuera), `[auth]` completo pero no usado por la app | **No bloquea.** Dejar solo `[db]` si se usa Supabase CLI como PG local, o ignorar el archivo si se usa Docker. | 🟢 Baja |

**Lectura clave:** el acoplamiento real cabe en **2 archivos productivos** (`SupabaseStorageService.ts`, `container.ts:getStorageService`) + env. Todo lo demás es portable o es código muerto.

---

## 2. Evaluación por dimensión

### 2.1 Base de datos — 🟢 Portable sin cambios de código

**A favor:**
- `src/infrastructure/database/client.ts:10-30` valida `DATABASE_URL`, crea `pg.Pool` genérico y `PrismaPg(pool)`. Ninguna opción es específica de Supabase (no hay `ssl` condicional ni `pgbouncer` hacks; el pooler de Supabase se usa solo vía URL `:6543`).
- `prisma/schema.prisma` usa tipos estándar (`VarChar`, `Timestamp(6)`, `Decimal(10,2)`, `Text`, `Uuid`). La única extensión es `pg_trgm`, disponible en cualquier PG 13+.
- No hay `RLS`, `POLICY`, `auth.uid()`, `storage.objects`, funciones `pg-functions://`, ni consumo de PostgREST/Realtime/Edge Functions en `src/`.
- `P0-4` ya endureció esquema (FK `NOT NULL`, índices `idx_*`, secuencia `usuarios_folio_seq`) en `prisma/migrations/20260821_harden_schema/migration.sql:17-63` — todo SQL portable.
- `PrismaTransactionManager.ts:11` usa `prisma.$transaction` estándar; `FOR UPDATE` en inscripciones es SQL estándar.

**En contra / matices:**
- Dualidad `prisma/migrations` vs `supabase/migrations` (§1 A-10). La fuente canónica debe ser **solo** `prisma/migrations`. Las de `supabase/` están obsoletas (ej. crean `depositos(id_usuario)` cuando el modelo actual usa `folio_registro`; crean `auth_id` que ya existe en Prisma).
- `supabase/config.toml:36` fija PG 17. El PG local debe ser 17.x para que `migration_lock.toml` + sintaxis no drifteen.
- `DIRECT_URL` (`prisma.config.ts:11`) hoy apunta al puerto directo de Supabase (`:5432`). En local será la misma URL que `DATABASE_URL` o el contenedor sin pooler. Documentarlo (ver §4).

**Conclusión BD:** cambiar `DATABASE_URL`/`DIRECT_URL` a `postgresql://postgres:postgres@localhost:5432/aniei` + `prisma migrate deploy` es suficiente. Esfuerzo: **0.5 día** incluyendo `pg_dump`/`restore` y verificación de secuencias.

### 2.2 Storage — 🟡 Único trabajo real (1–2 días)

**Estado actual (bien diseñado, mal provisionado):**
- Puerto `IStorageService.ts:14-19` (`subir/getAccess/eliminar/descargar`) + `parseFileReference` + `FileReference{bucket,path}`. Los 8 use-cases (`RegistrarUsuario`, `RegistrarGrupoRapido`, `GenerarConstancia*`, `EnviarConfirmacion`, `ObtenerAccesoArchivo`) dependen **solo del puerto** — verificado por grep (8 implementaciones inyectadas vía `container.ts`). Esto es exactamente lo que exige `DESIGN.md §15 / RNF-04`.
- Implementación única `SupabaseStorageService.ts` con routing frágil pero funcional: `ruta.startsWith('constancias/') ? 'constancias' : 'comprobantes'`. `P1-5.2` (pendiente) ya propone `resolveBucket()` con mapa explícito incluyendo `comprobantes_grupo/` — hacerlo al migrar.
- Buckets creados **a mano en dashboard** (no hay SQL ni script). Riesgo: en local no existen; hay que crearlos (carpetas o buckets MinIO) y migrar objetos vía S3 protocol (ya habilitado en `supabase/config.toml:122-123`) o descarga/subida.

**Lo que hay que construir:**
1. `LocalFilesystemStorageService implements IStorageService` (o `S3StorageService` con MinIO si se quiere paridad de URLs firmadas). ~120 líneas. Mantener el contrato `bucket/path` para no tocar use-cases: mapear `comprobantes/*` → `./storage/comprobantes/*`, `constancias/*` → `./storage/constancias/*`.
2. `getAccess()`: en filesystem devolver URL firmada HMAC de corta duración servida por `src/app/api/archivos/[...path]/route.ts` (nuevo, protegido con `requireUser()`/`requireAdmin()`), o URL estática si los archivos no son sensibles. Hoy son 5 min (`:34`); replicar TTL.
3. `container.ts:getStorageService()` conmutada: `STORAGE_PROVIDER=supabase|filesystem|s3` + validación fail-fast (cierra también `P0-5.2`).
4. Migración de objetos existentes + reescritura de `archivo_url`/`url_constancia` si cambia el prefijo (idealmente mantener `bucket/path` idéntico para no tocar BD).

**Conclusión Storage:** abstracción correcta, implementación intercambiable. Es el único código que se escribe. Esfuerzo: **1–2 días** (filesystem simple 1 día; S3/MinIO con firmadas 2 días).

### 2.3 Auth / sesiones — 🟢 Sin trabajo

- Flujo real: `src/auth.ts:9-46` Credentials → `prisma.accesos.findFirst({folio_registro})` → `bcrypt.compare` → JWT (`auth.config.ts:15-30`). `src/proxy.ts:7-53` protege `/cpanel`, `/perfil`, `/actividades`, `/registro`. Nada toca `supabase.auth`.
- `src/infrastructure/config/supabase/{client,server,middleware}.ts` + `updateSession` **nunca se importan**. `LoginCpanelUseCase`, `AuthJsAuthService.ts:53`, `requireAdmin.ts:1-28` confirman Auth.js como única fuente.
- `auth_id` (UUID, nullable, unique) es vestigio del experimento `cpanel_auth` (`supabase/migrations/20260328233536:11`). No se escribe ni se lee para autorizar. Mantenerlo en PG local cuesta cero; dropearlo es opcional y requiere migración `DROP COLUMN` + quitar `authId` de `Acceso.ts:8`, `PrismaAccesoRepository.ts:19,45`, `AuthSessionDTO.ts:3`.

**Conclusión Auth:** nada que migrar. Recomendado: borrar helpers muertos y el bug A-06 en el mismo sprint (0.5 día, bajo riesgo).

### 2.4 Configuración y despliegue — 🟡 Falta tooling local

**Gaps:**
- Sin `docker-compose.yml` (PG + opcional MinIO), sin `.env.example`, sin sección de despliegue en `README.md` (es el template de Next). `docs/DESIGN.md:1799-1800` y `docs/archived/PLAN.md:1021-1140` documentan env Supabase pero no el modo local.
- Nombres de env acoplados a proveedor (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`). Tras el cambio quedarán como legacy si no se renombran a `STORAGE_*`. Propuesta en §4: introducir `DATABASE_URL`, `DIRECT_URL` (ya existen), `STORAGE_PROVIDER`, `STORAGE_LOCAL_DIR` / `S3_*`, y deprecar `NEXT_PUBLIC_SUPABASE_*` con periodo de gracia.
- Validación de env tardía (`container.ts:71-92` lanza en cada getter). `P0-5.2`/`P1-5.1` ya piden `src/shared/env.ts` con Zod fail-fast — aprovechar el cambio para hacerlo.
- `.env.local` no trackeado (correcto), pero contiene `SERVICE_ROLE`, `GMAIL_APP_PASSWORD`, `AUTH_SECRET` en claro en disco local. Si este archivo se compartió por chat/ticket, **rotar** esas credenciales en Supabase/Gmail tras la auditoría.

### 2.5 Datos y migraciones — 🟡 Procedimiento definido, falta runbook

- Fuente canónica: `prisma/migrations/` + `migration_lock.toml` (provider `postgresql`). Destino local: `prisma migrate deploy` desde cero + `pg_restore` de datos, o `prisma migrate resolve --applied` si se clona el historial. Secuencia `usuarios_folio_seq` incluida en `20260821_harden_schema:56` — verificar `last_value` tras restore (ver §4 paso 5).
- `supabase/migrations/` debe archivarse (`supabase/migrations_legacy/README.md` con nota "obsoleto desde 2026-08-21, no ejecutar") para evitar `db push` accidental.
- Objetos Storage fuera de la BD: inventariar con `list` por bucket antes del corte; el protocolo S3 de Supabase (`config.toml:122`) permite `aws s3 sync` sin escribir código ad-hoc.
- Sin RLS que migrar. Sin cron/Edge/Triggers Supabase que replicar. `docs/db/seed_aniei2026.sql` + `docs/db/aniei2026.sql` son seeds antiguos (esquema `id_usuario`, no `folio_registro`) — no usar como base del PG local; usar `prisma migrate deploy` + `seed` actual si existe.

---

## 3. Matriz de riesgos del cambio (Supabase → PG local)

| Riesgo | Prob. | Impacto | Mitigación | Esfuerzo |
|--------|-------|---------|------------|----------|
| Divergencia de historiales (`prisma` vs `supabase` migrations) lleva a aplicar SQL viejo en local | Media | Alto (esquema roto) | Congelar `supabase/migrations` como legacy; solo `prisma migrate deploy` en local; CI que falla si `supabase/migrations` cambia | 0.5 d |
| Pérdida de archivos (buckets manuales sin inventario) | Media | Alto (comprobantes/constancias irrecuperables) | Inventario + `s3 sync` + verificación por conteo/bytes antes del corte; mantener Supabase en lectura 7 días | 0.5 d |
| `getAccess` con semántica distinta (firmada 5 min vs estática) expone documentos | Baja | Alto (PII) | Servir archivos solo vía API autenticada + HMAC con expiración; tests de acceso anónimo → 401 | 0.5 d |
| `auth_id`/`PUBLISHABLE_*` confunden al equipo y alguien "restaura" dependencia Supabase Auth | Baja | Medio | Borrar helpers muertos + columna opcional; grep en CI `supabase` → solo `SupabaseStorageService` tras el corte | 0.25 d |
| Versión PG distinta (17 vs 15/16) rompe `pg_trgm` GIN o `ENUM Rol` | Baja | Medio | Fijar `postgres:17-alpine` en Compose; `SHOW server_version` en runbook | 0.1 d |
| Pool/SSL: `client.ts` sin `ssl` funciona en local pero fallaría si se vuelve a Supabase pooler sin ajuste | Baja | Medio | Añadir `ssl` condicional por URL (`includes("supabase")`) como ya propone `PLAN_CORRECION.md:P0-5.1` | 0.1 d |
| Secretos en `.env.local` rotan tarde | Baja | Alto | Rotar `SERVICE_ROLE` + `AUTH_SECRET` + `GMAIL_APP_PASSWORD` si hubo exposición; introducir `.env.example` + gestor de secretos | 0.25 d |

---

## 4. Plan de migración a PostgreSQL local (pasos ejecutables)

> Objetivo: PG 17 en Docker + app apuntando a local + Storage en filesystem (fase 1) con opción S3/MinIO (fase 2). Sin cambios en `application/` ni `core/`.

### Paso 0 — Congelar y etiquetar (0.25 d)
1. `git tag antes-supabase-2026-09-04 && git push --tags` (punto de retorno).
2. Mover `supabase/migrations/` a `supabase/migrations_legacy/` + `README.md` ("Obsoleto. Fuente canónica: `prisma/migrations/`. No ejecutar `supabase db push`").
3. Crear rama `feat/local-postgres`.

### Paso 1 — PostgreSQL local con Docker (0.25 d)
Crear `docker-compose.yml` (nuevo):
```yaml
services:
  db:
    image: postgres:17-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: aniei
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s; timeout: 3s; retries: 20
volumes: { pgdata: {} }
```
Verificar: `docker compose up -d && docker compose exec db psql -U postgres -c "SHOW server_version;"` → `17.x`.

### Paso 2 — Variables de entorno (0.25 d)
Crear `.env.example` (nuevo, sin secretos):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aniei"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/aniei"
STORAGE_PROVIDER="filesystem" # supabase | filesystem | s3
STORAGE_LOCAL_DIR="./storage"
# Solo si STORAGE_PROVIDER=supabase (legacy):
# NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
# SUPABASE_SERVICE_ROLE_KEY="[REDACTED]"
AUTH_SECRET="[REDACTED]"
GMAIL_USER="" / GMAIL_APP_PASSWORD="" / EMAIL_FROM=""
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```
`.env.local` apunta a local. Añadir `src/shared/env.ts` (Zod fail-fast, cierra `P0-5.2`).

### Paso 3 — Esquema en local (0.25 d)
```bash
npx prisma migrate deploy        # aplica prisma/migrations sobre PG local vacío
npx prisma generate
npx prisma db pull --print | head -5  # sanity: sin drift
docker compose exec db psql -U postgres -d aniei -c "\d usuarios" # folio_registro PK + default ANI26-
docker compose exec db psql -U postgres -d aniei -c "SELECT * FROM pg_extension WHERE extname='pg_trgm';"
```

### Paso 4 — Datos (0.5 d)
```bash
# Origen Supabase (DIRECT_URL antigua, redactada aquí):
pg_dump "$DIRECT_URL_SUPABASE" --no-owner --no-acl -Fc -f /tmp/aniei.dump
pg_restore -d "postgresql://postgres:postgres@localhost:5432/aniei" --no-owner --no-acl /tmp/aniei.dump
# Verificar secuencias e integridad:
psql "$DATABASE_URL_LOCAL" -c "SELECT last_value FROM usuarios_folio_seq;"
psql "$DATABASE_URL_LOCAL" -c "SELECT count(*) FROM usuarios; SELECT count(*) FROM depositos; SELECT count(*) FROM accesos;"
psql "$DATABASE_URL_LOCAL" -c "SELECT folio_registro FROM depositos WHERE folio_registro IS NULL LIMIT 1;" # debe dar 0 filas
```

### Paso 5 — Storage filesystem (1 d, el único código nuevo)
1. Nuevo `src/infrastructure/services/storage/LocalFilesystemStorageService.ts` con el mismo contrato `IStorageService` (mapea `comprobantes/*`, `constancias/*` a `STORAGE_LOCAL_DIR/*`; `getAccess` devuelve URL HMAC `/api/archivos/...?exp=&sig=`).
2. Nuevo `src/app/api/archivos/[...path]/route.ts` que valida HMAC + `requireUser()` y hace `stream` del archivo (tests: anónimo → 401, expirado → 410).
3. `container.ts:getStorageService()`:
```ts
const provider = process.env.STORAGE_PROVIDER ?? 'supabase';
if (provider === 'filesystem') return new LocalFilesystemStorageService(process.env.STORAGE_LOCAL_DIR!);
if (provider === 's3') return new S3StorageService(...); // fase 2 opcional con MinIO
return new SupabaseStorageService(url, key); // legacy durante transición
```
4. Migrar objetos (manteniendo `bucket/path` para no tocar BD):
```bash
# vía S3 protocol de Supabase (config.toml:122 ya habilitado):
aws s3 sync s3://comprobantes ./storage/comprobantes --endpoint-url "$SUPABASE_S3_URL"
aws s3 sync s3://constancias ./storage/constancias --endpoint-url "$SUPABASE_S3_URL"
# verificación:
diff <(listado supabase) <(find ./storage -type f) ; du -sh ./storage/*
```
5. `STORAGE_PROVIDER=filesystem npm run dev` → registrar usuario de prueba con comprobante → constancia PDF → `obtenerUrlArchivoAction` → descarga OK.

### Paso 6 — Limpieza (0.5 d)
- Borrar `src/infrastructure/config/supabase/{client,server,middleware}.ts` (verificado 0 imports) y dependencias `@supabase/*` si ya nada las usa (`npm un @supabase/ssr @supabase/supabase-js` + `npm run build`).
- Opcional: migración `DROP COLUMN accesos.auth_id` + limpieza de `authId` en entidad/repos/DTO.
- `npm run build && npx tsc --noEmit && npm run lint` verdes; checklist `rg -i supabase src` → solo referencias históricas/docs.

### Paso 7 — Corte y rollback
- Mantener Supabase en **solo-lectura 7 días** tras el corte (fuente de re-sync si algo falta).
- Criterios de corte: `prisma migrate status` sin pendientes, conteos BD origen=destino, `usuarios_folio_seq` continua (crear 1 registro de prueba `ANI26-XXXX` sin huecos anómalos), 3 flujos E2E verdes (registro individual, grupo rápido, constancia), `EXPLAIN` usa índices.
- Rollback: revertir `DATABASE_URL`/`STORAGE_PROVIDER` a Supabase (1 línea de env, <5 min).

---

## 5. Recomendaciones priorizadas

| Prior. | Acción | Cierra | Esfuerzo |
|--------|--------|--------|----------|
| **P0** | Ejecutar §4 pasos 0–4 (Compose + env + `migrate deploy` + `pg_dump/restore` + verificación secuencias) | Riesgo datos/esquema | 1 d |
| **P0** | Implementar `LocalFilesystemStorageService` + `/api/archivos` + factory conmutada + migración de objetos | A-03/A-04/A-08/A-09 | 1–2 d |
| **P1** | `src/shared/env.ts` Zod fail-fast + `.env.example` + `README` despliegue local (cierra `P0-5.2`/`P1-5.1`) | A-13 | 0.5 d |
| **P1** | `resolveBucket()` explícito + test de buckets (`comprobantes`, `constancias`, `comprobantes_grupo/`) (cierra `P1-5.2`) | A-08 | 0.25 d |
| **P1** | Archivar `supabase/migrations` como legacy + CI guard (`rg supabase/migrations` o `migrate diff`) | A-10 | 0.25 d |
| **P2** | Borrar helpers `supabase/{client,server,middleware}` + `auth_id` + deps `@supabase/*` (tras corte estable) | A-05/A-06/A-07/A-14 | 0.5 d |
| **P2** | `ssl` condicional en `client.ts` + `README` rollback + backup cron `pg_dump` en VPS | A-01/A-13 | 0.5 d |

**Total:** 3.5–5 días con holgura; **2–4 días** en camino crítico (P0).

---

## 6. Veredicto final

- **¿Se puede cambiar de Supabase a PostgreSQL local?** **Sí.** La decisión arquitectónica (Prisma + Postgres estándar + Auth.js propio + `IStorageService`) hace que la BD y Auth sean portables por configuración, no por reescritura.
- **¿Qué impide hacerlo hoy mismo?** Solo la ausencia de (a) implementación alternativa de Storage, (b) `docker-compose.yml` + `.env.example`, y (c) runbook de datos. Nada estructural.
- **¿Qué NO hay que hacer?** No hay que cambiar ORM, ni reescribir casos de uso, ni migrar usuarios/sesiones, ni replicar RLS/Realtime/Edge (no se usan). El acoplamiento `app/ → prisma` documentado en `docs/AUDITORIA.md §1` **no afecta** a este cambio (solo afectaría a un cambio de ORM tipo Drizzle).
- **Siguiente paso recomendado:** aprobar §4 en rama `feat/local-postgres`, ejecutar pasos 0–4 esta semana (1 día, riesgo bajo, reversible), y dejar Storage filesystem para el siguiente sprint con ventana de doble-lectura de 7 días.

---

## 7. Referencias cruzadas

| Afirmación | Evidencia | Documento previo |
|------------|-----------|------------------|
| Cliente BD genérico `pg` Pool | `src/infrastructure/database/client.ts:1-33` | `AUDITORIA.md:2.5`, `PLAN_CORRECION.md:P0-5` |
| Datasource `postgresql` + `DIRECT_URL` | `prisma/schema.prisma:6-8`, `prisma.config.ts:6-13` | `DESIGN.md:Apéndice A` |
| Storage abstraído, 1 impl. Supabase | `src/application/ports/IStorageService.ts:1-19`, `src/infrastructure/services/storage/SupabaseStorageService.ts:1-75`, `src/infrastructure/config/container.ts:85-92` | `DESIGN.md:§15 RNF-04`, `AUDITORIA.md:2.5` |
| Auth real Auth.js, no Supabase | `src/auth.ts:1-47`, `src/auth.config.ts:1-32`, `src/proxy.ts:1-59` | `DESIGN.md:§14`, `AUDITORIA.md:§13` |
| Helpers Supabase muertos, 0 imports | `src/infrastructure/config/supabase/client.ts:1-8`, `server.ts:1-29`, `middleware.ts:1-53`; `grep config/supabase src` vacío | `DESIGN.md:314` (helpers SSR listados pero no usados) |
| `auth_id` legado nullable no escrito | `prisma/schema.prisma:21`, `supabase/migrations/20260328233536_cpanel_auth.sql:11`, `PrismaAccesoRepository.ts:19-46` | `AUDITORIA.md:§7` |
| Buckets hardcodeados sin IaC | `SupabaseStorageService.ts:12,44,59`, sin SQL de buckets | `PLAN_CORRECION.md:P1-5.2` |
| Firmadas 5 min | `SupabaseStorageService.ts:31-41` | `DESIGN.md:1369` |
| 10 migraciones Prisma canónicas | `prisma/migrations/*/migration.sql`, `migration_lock.toml` | `PROGRESS.md:P0-4` |
| 7 migraciones Supabase obsoletas | `supabase/migrations/*.sql` (esquema `id_usuario`, `referencia UNIQUE`) | `AUDITORIA.md:D-06` |
| PG 17 + `pg_trgm` portable | `supabase/config.toml:36`, `prisma/migrations/20260821_harden_schema/migration.sql:51-52` | `PLAN_CORRECION.md:P0-4.3` |
| Env no trackeado, sin `.env.example`, sin Compose | `.gitignore:34`, `git ls-files` (sin `.env*`), `package.json:5-11`, `README.md:1-36` (template) | `AUDITORIA.md:2.5` |
| `app/` importa `prisma` (~14 archivos) — no bloquea PG→PG | `src/app/perfil/page.tsx:3`, `src/app/cpanel/actions.ts:8`, `src/app/actividades/checkout/actions.ts:5`, +11 más | `AUDITORIA.md:§1`, `PLAN_CORRECION.md:P2-1` |

---

*Auditoría generada por inspección estática sin ejecución. Secretos redactados. Para cierre: ejecutar §4 pasos 0–4 en staging, adjuntar `prisma migrate status`, conteos origen/destino y `npm run build` verde como anexos.*
