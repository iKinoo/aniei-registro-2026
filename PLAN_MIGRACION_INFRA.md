# PLAN DE MIGRACIÓN DE INFRAESTRUCTURA — PostgreSQL local + Almacenamiento en filesystem

> **Fecha:** 2026-09-04 (rev. 2 — sin Docker, filesystem puro)
> **Base:** `AUDITORIA_04.09.2026.md` (veredicto: portable en 2–4 días; único bloqueante real: Storage)
> **Objetivo:** operar el sistema sin Supabase Cloud: base de datos en PostgreSQL 17 instalado nativo en Ubuntu 24.04 y archivos (comprobantes / constancias) en el sistema de archivos, dentro de la misma carpeta del proyecto (`./storage`), servidos por la propia app Next.js.
> **Aclaración explícita:** PostgreSQL se usa **solo para datos relacionales** (tablas Prisma). Los archivos **no** se guardan en Postgres (`bytea`, Large Objects ni similares); van al filesystem y la BD solo guarda la ruta `bucket/path`.
> **Restricciones:** **prohibido Docker** (nada de `docker-compose.yml`, imágenes ni volúmenes). **Filesystem puro** (sin S3/MinIO ni variantes).
> **No objetivos:** cambio de ORM (sigue Prisma), cambio de Auth (sigue Auth.js + `accesos`), cambio de correo (sigue Nodemailer).

---

## 1. Alcance y principios

### 1.1 Dentro del alcance
- Instalación nativa de PostgreSQL 17 en Ubuntu 24.04 (APT, repositorio oficial PGDG) + rol/BD `aniei`.
- `.env.example` + `src/shared/env.ts` (validación fail-fast con Zod).
- `prisma migrate deploy` sobre PG local + `pg_dump` / `pg_restore` de datos + verificación de secuencias e índices.
- Nueva implementación `LocalFilesystemStorageService implements IStorageService` + ruta `GET /api/archivos/[...path]` con URLs firmadas HMAC (TTL 5 min, paridad con `createSignedUrl(300)` actual).
- Factory conmutada `getStorageService()` por `STORAGE_PROVIDER=supabase|filesystem` (transición; destino final `filesystem`).
- Script de migración de objetos Supabase → `./storage` + verificación por conteo/bytes.
- Corte con doble-lectura de 7 días + rollback en <5 min (solo env).
- Limpieza posterior (helpers Supabase muertos, archivar `supabase/migrations`).

### 1.2 Fuera del alcance
- Reescribir casos de uso o entidades (`RegistrarUsuario`, `RegistrarGrupoRapido`, `GenerarConstancia*`, `ObtenerAccesoArchivo` **no se tocan**: solo reciben otro `IStorageService`).
- Cambiar el formato de `archivo_url` en BD: se preserva `bucket/path` (`comprobantes/...`, `constancias/...`) para no migrar datos.
- Alta disponibilidad / réplicas / backups automáticos (se deja cron mínimo documentado como P2, no se implementa aquí).
- Definir el supervisor de proceso en producción (systemd/pm2): pendiente de decisión; el plan deja la app corriendo con `npm run build && npm start` y documenta una unidad systemd **opcional** como ejemplo.

### 1.3 Principios
1. **Contrato primero:** `IStorageService` (`src/application/ports/IStorageService.ts:14-19`) no cambia.
2. **Postgres = datos, disco = archivos.** Ningún binario va a la BD.
3. **Rutas preservadas:** `comprobantes/<uuid>.<ext>`, `comprobantes/constancias/<uuid>.<ext>`, `constancias/<folio>.pdf` (ver `RegistrarUsuario.ts:51,59,205`) siguen válidas en `./storage/...`.
4. **Sin Docker:** todo con paquetes del SO (`apt`, `systemctl`, `psql`).
5. **Reversibilidad:** cada fase tiene criterio de aceptación y rollback propio.
6. **Supabase en lectura 7 días** tras el corte como red de seguridad.

---

## 2. Punto de partida (inventario verificado)

| Componente | Estado actual | Evidencia |
|------------|---------------|-----------|
| BD | Postgres Supabase vía `DATABASE_URL` (pooler `:6543`) + `DIRECT_URL` (`:5432`); cliente `pg.Pool` genérico | `src/infrastructure/database/client.ts:1-33`, `prisma.config.ts:11` |
| SO destino | Ubuntu 24.04, **sin PostgreSQL instalado**, sin Docker (prohibido) | Decisión 2026-09-04 |
| Esquema | `prisma/schema.prisma` (`postgresql`), 10 migraciones canónicas en `prisma/migrations/` (Rol, NOT NULL, índices, `pg_trgm`, `usuarios_folio_seq`) | `prisma/migrations/20260821_harden_schema/migration.sql:6-63` |
| Migraciones legacy | `supabase/migrations/` (7 archivos, esquema viejo `id_usuario`) — **no ejecutar** | `supabase/migrations/20260328190006_add_depositos_comprobante.sql:6-15` |
| Storage | Solo `SupabaseStorageService.ts:1-75` (buckets `comprobantes`, `constancias`, firmadas 5 min) inyectado en 8 use-cases vía `container.ts:85-92` | `src/infrastructure/config/container.ts:85-92` |
| Destino archivos | `./storage/` dentro del proyecto (misma carpeta) | Decisión 2026-09-04 |
| Auth | Auth.js + `accesos` + bcrypt; helpers `supabase/{client,server,middleware}.ts` con 0 imports (muertos) | `src/auth.ts:9-46`, `src/proxy.ts:1-59` |
| Archivos sensibles | Firmadas consumidas en `obtenerUrlComprobanteAction` (propietario o ADMIN) y `ObtenerAccesoArchivo` (solo ADMIN) + `/api/constancia/[folio]` pública (regenera PDF, no sirve archivos) | `src/app/perfil/actions.ts:8-48`, `src/application/use-cases/ObtenerAccesoArchivo.ts:12-25` |
| Tooling | Sin `.env.example`, `README` = template, sin ruta `/api/archivos` | `README.md:1-36`, `.gitignore:1-43` |

---

## 3. Arquitectura objetivo (sin Docker, filesystem en proyecto)

```
┌─ App Next.js (sin cambios en application/core) ───────────────────┐
│ Server Actions → Use-Cases → IStorageService (contrato igual)      │
│   ├─ STORAGE_PROVIDER=supabase   → SupabaseStorageService          │  (solo transición)
│   └─ STORAGE_PROVIDER=filesystem → LocalFilesystemStorageService ──► ./storage/
│        subir(ruta,buffer,mime) → writeFile(./storage/<ruta>)        │
│        descargar(ruta)          → readFile(...)                     │
│        eliminar(ruta)           → rm(...)                           │
│        getAccess({bucket,path}) → /api/archivos/<bucket>/<path>?exp=&sig= (HMAC 5 min)
│ GET /api/archivos/[...path] → verifica HMAC + sesión + ownership → stream
└────────────────────────────────────────────────────────────────────┘
┌─ PostgreSQL 17 nativo (apt, Ubuntu 24.04, servicio postgresql) ◄── DATABASE_URL/DIRECT_URL
│   SOLO datos relacionales · esquema: prisma migrate deploy · datos: pg_restore
│   Secuencia usuarios_folio_seq · ext pg_trgm · NADA de archivos binarios
└────────────────────────────────────────────────────────────────────┘
```

---

## 4. Pre-requisitos

- [ ] Ubuntu 24.04 con `sudo`, Node 20+, acceso a internet (para APT PGDG y npm).
- [ ] Acceso de lectura a Supabase actual (`DIRECT_URL_SUPABASE` + `SERVICE_ROLE` solo para el script de extracción; no se commitean).
- [ ] Rama `feat/local-postgres` creada desde `main` limpio + tag `antes-supabase-2026-09-04`.
- [ ] Espacio en disco: `du` de buckets Supabase + 2× para dump + copia en `./storage`. Verificar con inventario (§6.3).

```bash
git tag antes-supabase-2026-09-04 && git push --tags
git checkout -b feat/local-postgres
```

---

## 5. FASE 0 — Congelar y proteger (0.25 d)

| # | Tarea | Evidencia / comando | Aceptación |
|---|-------|---------------------|------------|
| 0.1 | Archivar migraciones legacy | `mkdir -p supabase/migrations_legacy && git mv supabase/migrations/*.sql supabase/migrations_legacy/ && printf "# LEGACY — obsoleto desde 2026-09-04. Fuente canónica: prisma/migrations/. No ejecutar supabase db push.\n" > supabase/migrations_legacy/README.md` | `ls supabase/migrations/` vacío o solo README; `prisma migrate status` sigue verde contra Supabase |
| 0.2 | Backup lógico Supabase | `pg_dump "$DIRECT_URL_SUPABASE" --no-owner --no-acl -Fc -f /tmp/aniei-20260904.dump` + `ls -lh /tmp/aniei-*.dump` | Dump >0 bytes, restaurable |
| 0.3 | Inventario Storage | Ejecutar script §7.6 en modo `--inventario` (conteo + bytes por bucket) y guardar salida en `/tmp/inventario-supabase.txt` | 2 buckets (`comprobantes`, `constancias`) inventariados |

Rollback F0: borrar tag/rama, nada productivo tocado.

---

## 6. FASE 1 — PostgreSQL 17 nativo en Ubuntu 24.04 (0.5–1 d)

> Ubuntu 24.04 trae PostgreSQL 16 en sus repos por defecto; como el proyecto fija PG 17 (`supabase/config.toml:36`), se instala desde el repositorio oficial PGDG. Sin Docker.

### 6.1 Instalar PostgreSQL 17 (nativo)
```bash
sudo apt update && sudo apt install -y curl ca-certificates gnupg
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt update && sudo apt install -y postgresql-17 postgresql-client-17
sudo systemctl enable --now postgresql
pg_lsclusters                       # el clúster 17/main debe estar "online"
sudo -u postgres psql -c "SHOW server_version;"   # → 17.x
pg_isready -h localhost -p 5432
```

### 6.2 Crear rol, BD y extensión
```bash
sudo -u postgres psql <<'SQL'
DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='aniei') THEN CREATE ROLE aniei LOGIN PASSWORD 'cambia-esta-clave'; END IF; END $$;
SELECT 'role ok';
SQL
sudo -u postgres psql -c "SELECT 1 FROM pg_database WHERE datname='aniei'" | grep -q 1 || sudo -u postgres createdb -O aniei aniei
sudo -u postgres psql -d aniei -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
sudo -u postgres psql -d aniei -c "SELECT * FROM pg_extension WHERE extname='pg_trgm';"
```

### 6.3 Crear `.env.example` (nuevo, sin secretos) y `.env.local` local
```bash
# .env.example
DATABASE_URL="postgresql://aniei:cambia-esta-clave@localhost:5432/aniei"
DIRECT_URL="postgresql://aniei:cambia-esta-clave@localhost:5432/aniei"
STORAGE_PROVIDER="filesystem"
STORAGE_LOCAL_DIR="./storage"
STORAGE_URL_SECRET="cambia-esto-32-chars-minimo"
FILE_URL_TTL_SECONDS="300"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
AUTH_SECRET="genera-con-openssl-rand-base64-32"
GMAIL_USER=""
GMAIL_APP_PASSWORD=""
EMAIL_FROM=""
# Legacy Supabase (solo transición / script extracción, no requerido en local):
# NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
# SUPABASE_SERVICE_ROLE_KEY="[REDACTED]"
```
```bash
cp .env.example .env.local   # luego rellenar AUTH_SECRET + Gmail + clave real de BD
openssl rand -base64 32      # para gerar AUTH_SECRET y STORAGE_URL_SECRET
```

### 6.4 Nuevo `src/shared/env.ts` (fail-fast, cierra P0-5.2)
```ts
import { z } from "zod";
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1),
  STORAGE_PROVIDER: z.enum(["supabase","filesystem"]).default("filesystem"),
  STORAGE_LOCAL_DIR: z.string().default("./storage"),
  STORAGE_URL_SECRET: z.string().min(32),
  AUTH_SECRET: z.string().min(16),
});
export const env = envSchema.parse(process.env);
```
Importarlo al inicio de `src/infrastructure/config/container.ts:1`.

### 6.5 Aplicar esquema + migrar datos (sin Docker)
```bash
sudo systemctl is-active postgresql   # → active
npx prisma migrate deploy             # usa DIRECT_URL del .env.local (PG local)
npx prisma generate
# Datos desde Supabase:
pg_restore -d "$DATABASE_URL" --no-owner --no-acl /tmp/aniei-20260904.dump
# (Si pg_restore pide superusuario por la extensión, ejecutar solo esa parte como postgres;
# el resto como usuario aniei.)
```

### 6.6 Verificación BD (criterios de aceptación F1)
```bash
psql "$DATABASE_URL" -c "SELECT count(*) FROM usuarios; SELECT count(*) FROM depositos; SELECT count(*) FROM accesos; SELECT count(*) FROM inscripcion_actividades;"
# Comparar con los mismos count(*) en Supabase → deben coincidir.
psql "$DATABASE_URL" -c "SELECT last_value FROM usuarios_folio_seq;"
psql "$DATABASE_URL" -c "SELECT folio_registro FROM depositos WHERE folio_registro IS NULL LIMIT 1;"  # 0 filas
psql "$DATABASE_URL" -c "SELECT * FROM pg_extension WHERE extname='pg_trgm';"  # 1 fila
psql "$DATABASE_URL" -c "EXPLAIN SELECT * FROM depositos WHERE folio_registro='ANI26-0001';"  # Index Scan
npx prisma migrate status   # "Database schema is up to date"
npm run dev  # login + /perfil cargan contra PG local (verificar folio propio visible)
```
Rollback F1: revertir `DATABASE_URL`/`DIRECT_URL` a Supabase en `.env.local` y reiniciar (`npm run dev`). El PG local queda intacto para reintentar.

---

## 7. FASE 2 — Almacenamiento en filesystem del proyecto (1–2 d, único código nuevo)

> Archivos en `./storage/` (misma carpeta del proyecto). Postgres no almacena binarios.

### 7.1 Contrato a respetar (no cambiar)
`src/application/ports/IStorageService.ts:14-19`: `subir(ruta,buffer,mime):Promise<string>`, `getAccess({bucket,path}):Promise<string>`, `eliminar(ruta)`, `descargar(ruta)`. Las rutas que llegan son `comprobantes/<uuid>.<ext>`, `comprobantes/constancias/<uuid>.<ext>`, `constancias/<folio>.pdf`.

### 7.2 Nuevo `src/infrastructure/services/storage/LocalFilesystemStorageService.ts`
Responsabilidades:
- `baseDir = path.resolve(process.env.STORAGE_LOCAL_DIR ?? "./storage")`. Normalizar `ruta`, **rechazar `..` / rutas absolutas / nulos** (path traversal) y verificar que el path final quede dentro de `baseDir`.
- `subir`: `mkdir -p dirname`, `writeFile`, devolver `ruta` tal cual (mismo formato `bucket/path` que Supabase) para no tocar BD.
- `descargar/eliminar`: `readFile` / `rm` sobre `join(baseDir, ruta)`.
- `getAccess({bucket,path})`: construir `/api/archivos/<bucket>/<path>?exp=<unix>&sig=<hmac>` con `STORAGE_URL_SECRET`, TTL `FILE_URL_TTL_SECONDS` (300). HMAC = `sha256(secret, bucket/path + exp)`.
- Validar MIME/tamaño delegando al VO existente `ArchivoComprobante` (no duplicar reglas).

### 7.3 Nueva ruta `src/app/api/archivos/[...path]/route.ts`
- `GET`: parsea `path[]` → `ruta = path.join('/')`; exige `exp` futuro + `sig` válida (timing-safe); exige sesión (`auth()`): si `ADMIN` permite todo; si `USER` solo permite su propio `archivo_url` (`prisma.depositos.findFirst({where:{folio_registro: sessionFolio, archivo_url: ruta}})`) o su `constancia` (`constancias/<su-folio>.pdf`). Reutilizar la lógica ya probada en `src/app/perfil/actions.ts:16-38`.
- Responde `stream` con `Content-Type` por extensión + `Cache-Control: private, max-age=60`.
- Tests manuales: sin `sig` → 401; `exp` pasado → 410; otro usuario → 403; propio → 200.

### 7.4 Factory conmutada en `src/infrastructure/config/container.ts:85-92`
```ts
export function getStorageService(): IStorageService {
  const provider = process.env.STORAGE_PROVIDER ?? "filesystem";
  if (provider === "filesystem") {
    const dir = process.env.STORAGE_LOCAL_DIR ?? "./storage";
    const secret = process.env.STORAGE_URL_SECRET;
    if (!secret || secret.length < 32) throw new Error("STORAGE_URL_SECRET inválida (min 32 chars)");
    return new LocalFilesystemStorageService(dir, secret);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;      // solo transición
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Falta config Supabase (legacy) o STORAGE_PROVIDER=filesystem");
  return new SupabaseStorageService(url, key);
}
```
Destino final: `STORAGE_PROVIDER=filesystem` siempre; el branch `supabase` se elimina en Fase 4.

### 7.5 Carpeta `./storage` + `.gitignore`
```bash
mkdir -p storage/comprobantes storage/constancias && touch storage/.gitkeep
```
```
# .gitignore — storage local dentro del proyecto (solo estructura)
/storage/*
!/storage/.gitkeep
/tmp/*.dump
```

### 7.6 Script de migración de objetos (nuevo `scripts/migrar-storage-supabase-a-local.mjs`)
- Usa `SUPABASE_URL` + `SERVICE_ROLE` (solo entorno local del operador, nunca commiteado) para `list` recursivo de `comprobantes` y `constancias`, `download` cada objeto y `writeFile` en `./storage/<bucket>/<path>` preservando nombre exacto (para que `archivo_url` siga válido).
- Modos: `--inventario` (solo cuenta), `--migrar` (descarga), `--verificar` (compara conteo + bytes + muestreo hash).
- Reintentos 3× por objeto; log de fallidos a `/tmp/storage-fallidos.txt`.

### 7.7 Ejecución
```bash
STORAGE_PROVIDER=filesystem npm run dev
node scripts/migrar-storage-supabase-a-local.mjs --inventario   # guardar /tmp/inventario-supabase.txt
node scripts/migrar-storage-supabase-a-local.mjs --migrar       # destino: ./storage/
node scripts/migrar-storage-supabase-a-local.mjs --verificar    # conteo origen == destino, bytes iguales
```

### 7.8 Criterios de aceptación F2
- [ ] `npx tsc --noEmit` + `npm run build` verdes con `STORAGE_PROVIDER=filesystem`.
- [ ] Registro individual E2E con comprobante JPG/PDF → archivo existe en `./storage/comprobantes/<uuid>.<ext>` y `depositos.archivo_url` lo referencia.
- [ ] Constancia generada en `./storage/constancias/<folio>.pdf`.
- [ ] `obtenerUrlComprobanteAction` devuelve `/api/archivos/...?exp=&sig=`; abrirla logueado → 200; anónimo → 401; expirada → 410; otro folio → 403.
- [ ] Flujo cpanel ADMIN (`ObtenerAccesoArchivo`) abre cualquier comprobante.
- [ ] Conteo `find ./storage -type f | wc -l` == inventario Supabase (± archivos creados en pruebas locales, documentados).
- [ ] `RegistrarUsuario` con fallo de BD posterior a `subir` deja **cero** huérfanos en disco (compensación `eliminar` ya existe en `RegistrarUsuario.ts:171-179`).
- [ ] `grep -ri "minio\|s3" src scripts PLAN_MIGRACION_INFRA.md` → 0 resultados fuera de este historial (filesystem puro).

Rollback F2: `STORAGE_PROVIDER=supabase` en `.env.local` y reiniciar (los objetos Supabase se conservan 7 días).

---

## 8. FASE 3 — Corte y estabilización (0.5 d)

| # | Paso | Comando / evidencia | Aceptación |
|---|------|---------------------|------------|
| 3.1 | Congelar escritura Supabase (aviso + solo-lectura si aplica) | Anuncio + `REVOKE INSERT,UPDATE,DELETE` temporal o ventana de mantenimiento | Sin escrituras concurrentes durante el corte |
| 3.2 | Re-dump + re-restore diferencial | Repetir §6.5 y §7.7 (`--migrar` incremental de objetos nuevos) | Conteos y bytes origen=destino |
| 3.3 | Apuntar definitivo a local | `.env.local`: `DATABASE_URL`/`DIRECT_URL` locales + `STORAGE_PROVIDER=filesystem` + `STORAGE_LOCAL_DIR=./storage`; `npm run build && npm start` (prod) o `npm run dev` (pruebas) | Build verde |
| 3.4 | E2E | Registro individual + grupo rápido + checkout actividad + constancia + login ADMIN/USER | 5/5 verdes, URLs `/api/archivos/...` 200 |
| 3.5 | Doble-lectura 7 días | Supabase conservado, sin escrituras; `find ./storage -type f` diario | 0 pérdidas reportadas |
| 3.6 | Rollback (si falla 3.4) | Revertir `.env.local` a Supabase + reiniciar | <5 min, documentado en bitácora |

Puesta en producción (supervisor pendiente): por defecto `npm run build && npm start`. Ejemplo **opcional** de unidad systemd (decidir después; no es parte del corte):
```ini
# /etc/systemd/system/aniei.service (EJEMPLO, opcional)
[Service]
WorkingDirectory=/opt/aniei-registro-2026
ExecStart=/usr/bin/npm start -- --port 3000
Restart=always
EnvironmentFile=/opt/aniei-registro-2026/.env.local
```

---

## 9. FASE 4 — Limpieza post-corte (0.5 d)

- [ ] Eliminar branch `supabase` de `getStorageService()` → retornar siempre `LocalFilesystemStorageService`; borrar `SupabaseStorageService.ts` solo cuando no queden referencias (`grep -rn SupabaseStorageService src` vacío).
- [ ] Borrar helpers muertos `src/infrastructure/config/supabase/{client,server,middleware}.ts` + deps `@supabase/ssr`, `@supabase/supabase-js` (`npm un ... && npm run build`).
- [ ] Opcional: migración `DROP COLUMN accesos.auth_id` + limpieza de `authId` en `Acceso.ts`, `PrismaAccesoRepository.ts`, `AuthSessionDTO.ts`.
- [ ] Respaldo mínimo documentado (P2): `pg_dump -Fc` por cron + `rsync -a ./storage/` a disco externo. Ejemplo:
```bash
pg_dump -Fc -f /var/backups/aniei/aniei-$(date +%F).dump "postgresql://aniei@localhost:5432/aniei"
rsync -a --delete ./storage/ /var/backups/aniei/storage/
```

---

## 10. Riesgos y mitigaciones (actualizado sin Docker)

| Riesgo | Prob. | Impacto | Mitigación |
|--------|-------|---------|------------|
| Ubuntu 24.04 trae PG 16 y se instala el equivocado | Media | Medio (drift vs PG 17) | Instalar desde PGDG y verificar `SHOW server_version` → 17.x (§6.1) |
| Permisos de `./storage` (usuario app vs dueño de archivos migrados) | Media | Alto (subidas 500) | Misma carpeta del proyecto + mismo usuario que corre `npm`; `chmod 750`, `chown` al usuario de la app; verificar E2E §7.8 |
| `auth_id`/`PUBLISHABLE_*` confunden y alguien restaura dependencia Supabase | Baja | Medio | Borrar helpers en F4 + CI `grep config/supabase src` → 0 |
| Pérdida de archivos (buckets manuales sin inventario) | Media | Alto | Inventario + `--verificar` + doble-lectura 7 días (§7.6–§8) |
| Firmadas con semántica distinta exponen PII | Baja | Alto | API autenticada + HMAC con expiración; tests 401/403/410 (§7.3) |
| Secretos en `.env.local` rotan tarde | Baja | Alto | Rotar `SERVICE_ROLE`/`AUTH_SECRET` si hubo exposición; `.env.example` sin secretos |

---

## 11. Estimación y gates

| Fase | Esfuerzo | Gate (no avanzar sin esto en verde) |
|------|----------|--------------------------------------|
| F0 proteger | 0.25 d | Dump + inventario guardados |
| F1 PG nativo | 0.5–1 d | `migrate status` limpio + conteos iguales + `Index Scan` + login OK |
| F2 filesystem `./storage` | 1–2 d | E2E + 401/403/410 + conteo igual + build verde |
| F3 corte | 0.5 d | 5/5 E2E + doble-lectura activa |
| F4 limpieza | 0.5 d | `grep supabase src` → 0 productivo + build verde |
| **Total** | **2.5–4 d** | — |

---

## 12. Checklist final de aceptación

- [ ] `sudo -u postgres psql -c "SHOW server_version;"` → 17.x; `systemctl is-active postgresql` → active.
- [ ] `npx prisma migrate status` → up to date contra PG local; `pg_trgm` instalada.
- [ ] Conteos `usuarios/depositos/accesos/inscripciones` origen = destino; `usuarios_folio_seq` continua (crear 1 registro de prueba sin huecos anómalos).
- [ ] `STORAGE_PROVIDER=filesystem`, archivos nuevos aparecen en `./storage/...`; firmadas `/api/archivos/...` 200/401/403/410 según caso.
- [ ] `npm run build` + `npx tsc --noEmit` verdes.
- [ ] Rollback probado una vez (cambio de env <5 min).
- [ ] Sin referencias Docker en el plan ni en los comandos; sin referencias S3/MinIO en el código nuevo.

---

*Plan revisado 2026-09-04 rev.2: Ubuntu 24.04 + PostgreSQL 17 nativo (APT PGDG), storage en `./storage` del proyecto, filesystem puro, Postgres exclusivamente relacional. Supervisor de proceso en producción pendiente de decisión.*
