# PLAN DE MIGRACIÓN DE INFRAESTRUCTURA — PostgreSQL → MySQL (base limpia, sin migración de datos)

> **Fecha:** 2026-09-10
> **Objetivo:** que el sistema ANIEI 2026 opere sobre **MySQL 8.x** en lugar de PostgreSQL, partiendo de una **base de datos nueva y vacía** (no se migran filas).
> **Alcance real:** cambiar provider/driver/esquema, reiniciar el historial de migraciones, sustituir la generación de folios (secuencia PG → mecanismo MySQL), corregir los acoples de código a PostgreSQL y re-sembrar catálogos.
> **No objetivos:** migrar datos existentes (se descarta explícitamente), cambiar ORM (sigue Prisma 7), cambiar Auth.js + tabla `accesos`, cambiar el almacenamiento de archivos (sigue filesystem `./storage`), cambiar correo (Nodemailer) ni PDF (`@react-pdf/renderer`).
> **Restricciones heredadas:** prohibido Docker; archivos en filesystem puro (`PLAN_MIGRACION_INFRA.md`).
> **Duración estimada:** 3–4 días de trabajo efectivo (ver §15).

---

## 1. Alcance y principios

### 1.1 Dentro del alcance
- `prisma/schema.prisma` → `provider = "mysql"` y tipos nativos válidos para MySQL.
- Driver: `pg` + `@prisma/adapter-pg` → **`@prisma/adapter-mariadb`** (adaptador oficial de Prisma para MySQL/MariaDB).
- Reinicio del historial de migraciones (`prisma/migrations/` actual es 100 % SQL de PostgreSQL) → baseline `init_mysql`.
- Generación de `usuarios.folio_registro`: hoy la hace una **secuencia PG** vía `dbgenerated(...)`; en MySQL pasa a generarse en la app.
- Corrección de SQL crudo (`COUNT(*)::bigint`, casts PG) y de `mode: 'insensitive'` (no existe en el cliente MySQL).
- Semilla de catálogos y precios en sintaxis/flujo MySQL, y primer usuario ADMIN.
- Variables de entorno, `prisma.config.ts`, docs de despliegue y `AGENTS.md`.

### 1.2 Fuera del alcance
- Volcado/traslado de filas desde la BD PostgreSQL actual (decisión: **BD limpia**).
- Los archivos ya existentes en `./storage` quedan **huérfanos** si se arranca con BD vacía: o se limpia `./storage`, o se acepta que las rutas históricas no resuelvan. Decidir en Fase 0 (§5).
- Reescribir `src/core/*` y `src/application/*`: **no se tocan** (salvo un puerto nuevo, §3 D-3).
- Búsqueda con relevancia/índices avanzados (se mantiene `LIKE '%…%'`; FULLTEXT ngram queda como P2 opcional).
- Alta disponibilidad, réplicas, backups automáticos avanzados (se deja cron `mysqldump` documentado).

### 1.3 Principios
1. **Contratos primero:** los puertos (`IUsuarioRepository`, `IStorageService`, …) no cambian de firma. La BD es un detalle de `infrastructure/`.
2. **El compilador como detector:** al regenerar el cliente con `provider = "mysql"`, TypeScript señala los acoples incompatibles (`mode: 'insensitive'`, tipos nativos). Orden de trabajo: esquema → `prisma generate` → `npx tsc --noEmit` → corregir.
3. **Una sola fuente de verdad:** `prisma/schema.prisma`. Nada de DDL manual fuera de migraciones, salvo lo declarado en §3 D-5 (collations).
4. **Reversibilidad:** todo el trabajo en rama `feat/mysql`; PostgreSQL actual intacto hasta el corte.
5. **Cero datos ⇒ cero riesgo de pérdida, pero cero red de seguridad:** los flujos deben verificarse funcionales de punta a punta en Fase 6.

---

## 2. Inventario verificado de acoples a PostgreSQL

| # | Componente | Evidencia | Impacto en MySQL |
|---|------------|-----------|------------------|
| 1 | Provider del datasource | `prisma/schema.prisma:7` `provider = "postgresql"` | Cambiar a `"mysql"` |
| 2 | **Secuencia de folios** (bloqueante) | `prisma/schema.prisma:197` `@default(dbgenerated("('ANI26-'::text \|\| lpad((nextval('usuarios_folio_seq'::regclass))::text, 4, '0'::text))"))` | MySQL **no tiene secuencias** y Prisma **no puede devolver la fila** si el PK lo asigna un trigger → generador en app (§3 D-3) |
| 3 | Tipo UUID nativo | `prisma/schema.prisma:21` `auth_id String? @unique @db.Uuid` | `@db.Uuid` es exclusivo de PG → `@db.VarChar(36)` |
| 4 | Timestamps con precisión 6 | `prisma/schema.prisma:43,44,65,93,94,123,162,216,243,261,276` `@db.Timestamp(6)` | `TIMESTAMP` MySQL está limitado a 1970–2038 y convierte por zona horaria de sesión → `@db.DateTime(6)` |
| 5 | Enum | `prisma/schema.prisma:10-13` `enum Rol { USER ADMIN }` | Soportado (genera `ENUM('USER','ADMIN')`); verificar con `prisma validate` |
| 6 | `TEXT` | `prisma/schema.prisma:273-274` | Soportado; sin índices sobre esas columnas (ya es así) |
| 7 | Historial de migraciones PG | `prisma/migrations/20260821_harden_schema/migration.sql:5-13` (`DO $$`, `::text::"Rol"`), `:56` (`CREATE SEQUENCE`), `:60-61` (`pg_trgm` + GIN); `20260831_add_nombre_usuario/migration.sql:29` (PL/pgSQL + `RANDOM()`) | **Inejecutable** en MySQL → archivar y crear baseline (§7) |
| 8 | Datos semilla dentro de una migración | `prisma/migrations/20260830_add_tipo_participante/migration.sql:10-13` (`tipo_participante`) y `:40-70` (`precios_inscripcion`) | Deben reproducirse en la nueva semilla (§10) |
| 9 | Cliente/Pool | `src/infrastructure/database/client.ts:1-33` (`pg.Pool`, `PrismaPg`, `maxUses`, `pool.on('error')`) | Reescribir con `PrismaMariaDb` (§8.2) |
| 10 | Dependencias | `package.json:13` `@prisma/adapter-pg`, `:22` `pg`, `:33` `@types/pg` | Quitar; añadir `@prisma/adapter-mariadb` |
| 11 | SQL crudo con cast PG | `src/infrastructure/repositories/PrismaInscripcionActividadRepository.ts:94-98` `SELECT COUNT(*)::bigint as count` | `::bigint` no existe → `COUNT(*) AS total` (§9.3) |
| 12 | `SELECT … FOR UPDATE` | `PrismaInscripcionActividadRepository.ts:72-79` | Válido en InnoDB; **pero** el aislamiento por defecto MySQL es `REPEATABLE READ` (PG usa `READ COMMITTED`) → fijar `ReadCommitted` (§9.3) |
| 13 | `mode: 'insensitive'` (10 usos) | `src/infrastructure/services/PrismaAdminQueryService.ts:22-24`; `src/infrastructure/repositories/PrismaEquipoRepository.ts:126-129`; `src/app/cpanel/actividades/ponentes.actions.ts:35-37` | Propiedad **inexistente** en el cliente MySQL (error de tipos + `Unknown arg mode` en runtime) → eliminar; la collation `_ci` ya da el comportamiento (§3 D-6) |
| 14 | Índice GIN trigram para búsquedas | `prisma/migrations/20260821_harden_schema/migration.sql:60-61` | Sin equivalente directo; `LIKE '%x%'` sin índice (aceptable por volumen) |
| 15 | Semilla de catálogos PG | `docs/db/seed_aniei2026.sql:328-333` (`setval(pg_get_serial_sequence(...))`) | Reescribir: `ALTER TABLE … AUTO_INCREMENT = n` (§10) |
| 16 | Config Prisma CLI | `prisma.config.ts:12` `url: process.env["DIRECT_URL"]` | URL `mysql://…`; añadir `shadowDatabaseUrl` y `migrations.seed` (§7.3) |
| 17 | Env | `.env.example:5-6` `postgresql://…`; `src/shared/env.ts:4-5` (solo `min(1)`, no valida esquema) | Nuevas URLs; opcional validar prefijo `mysql://` (§6.3) |
| 18 | Docs de operación | `PLAN_DESPLIEGUE.md` §3.3 (APT PGDG), §4 (`psql`, `pg_trgm`), §6 (`pg_restore`), §12 (`pg_dump`), §14 (troubleshooting PG) | Reescribir esas secciones (§13) |
| 19 | Script de storage legacy | `scripts/migrar-storage-supabase-a-local.mjs` | **Sin acople a BD** (solo Supabase Storage) → no cambia |
| 20 | Auth | `src/auth.ts:24-32` (`accesos.findFirst` por `folio_registro` + `bcrypt.compare`) | Sin cambios; ver nota de collation §3 D-5 |

**Conclusión del inventario:** el 90 % del cambio vive en `prisma/`, `src/infrastructure/database/client.ts` y 4 archivos con acoples puntuales. `src/core/` y `src/application/` quedan intactos salvo un puerto nuevo.

---

## 3. Decisiones de diseño

### D-1 — Servidor: MySQL 8.4 LTS (no MariaDB)
- **Decisión:** MySQL 8.4 LTS. Ubuntu 24.04 trae 8.0 en APT; para 8.4 usar el repositorio oficial de MySQL (`mysql-apt-config`).
- **Motivo:** el usuario pidió MySQL; 8.4 es LTS (soporte hasta 2032) y su collation por defecto `utf8mb4_0900_ai_ci` es **case- y accent-insensitive**, lo que sustituye gratis al `mode: 'insensitive'` que perdemos.
- **Alternativa descartada:** MariaDB 11.x (funciona con el mismo provider `mysql`, pero su collation por defecto es `utf8mb4_general_ci` y el versionado/soporte difiere).
- **Configuración obligatoria de la BD:** `CHARACTER SET utf8mb4`, `COLLATE utf8mb4_0900_ai_ci`, motor **InnoDB**, `default-time-zone = '+00:00'`.

### D-2 — Driver adapter: `@prisma/adapter-mariadb`
- Prisma **no** publica `@prisma/adapter-mysql`; el adaptador oficial para MySQL/MariaDB self-hosted es `@prisma/adapter-mariadb` (driver `mariadb`, incluido como dependencia del paquete). En Prisma 7 el adapter es **obligatorio** con el generador `prisma-client`.
- Constructor verificado (`@prisma/adapter-mariadb@7.x`): `new PrismaMariaDb(poolOrConfig: mariadb.Pool | mariadb.PoolConfig | string, options?)`. Acepta URL o objeto de configuración; se usará **objeto** para controlar pool y zona horaria (§9.1).
- Nota del propio adaptador: cuando crea su pool fija `prepareCacheLength: 0` (sin caché de prepared statements); si se pasa un pool propio, no aplica ese default.

### D-3 — Generación de `folio_registro` (el cambio estructural más importante)
Hoy: la BD lo genera con una secuencia (`nextval('usuarios_folio_seq')`) y Prisma lo recupera con `RETURNING`. El código depende de eso en `PrismaUsuarioRepository.crear()` (`:11-15`) y `crearGrupoTransaccional()` (`:84-96`), y lo consume en `RegistrarUsuario.ts:105-106` y `ponentes.actions.ts:147-148`.

| Opción | Descripción | Veredicto |
|--------|-------------|-----------|
| **A. Tabla contadora + Prisma (elegida)** | Modelo `folios_contador { id Int @id @default(autoincrement()) }`; cada alta hace `create({data:{}})` y formatea `ANI26-` + `id` con `padStart(4,'0')` | ✅ Sin SQL crudo, atómico (AUTO_INCREMENT de InnoDB), portable, y `create()` **sí** devuelve el id. Coste: una fila por registro (miles, irrelevante) |
| B. `GET_LOCK()` + `MAX(folio)+1` | Lock asesor de MySQL alrededor de `SELECT MAX(...)` | ⚠️ Funciona, pero añade SQL crudo, timeout de lock y un punto de fallo silencioso |
| C. Trigger `BEFORE INSERT` en `usuarios` | La BD asigna el folio desde una tabla contadora | ❌ **Rechazada:** el PK no es `AUTO_INCREMENT`, Prisma no puede recuperar la fila tras el `INSERT` en MySQL (no hay `RETURNING`) y `create()` fallaría o devolvería datos incompletos |
| D. `MAX(folio)+1` sin lock | Leer el máximo y sumar 1 | ❌ Racy: duplicados bajo concurrencia (`P2002` en el PK) |

**Implementación de A (sin tocar `core/` ni los use cases):**
- Puerto nuevo `src/application/ports/IFolioGenerator.ts` (coherente con `IIdGenerator`).
- Implementación `src/infrastructure/database/PrismaFolioGenerator.ts`.
- Se inyecta en `PrismaUsuarioRepository` y se usa en `crear()` y dentro de la transacción de `crearGrupoTransaccional()` (ahí con `tx.folios_contador.create(...)` para que el contador participe de la misma transacción).
- **Efecto colateral positivo:** desaparece el `dbgenerated()` del esquema (Prisma deja de tratar `folio_registro` como valor opaco) y `UsuarioMapper.toPersistence()` (`:31`) ya contempla el folio explícito.
- **Huecos:** si la transacción hace rollback, el `AUTO_INCREMENT` no se recupera (igual que con la secuencia PG). Aceptado y documentado: los folios no necesitan ser contiguos, sí únicos y crecientes.
- **Formato:** `ANI26-0001`. Con `padStart(4,'0')` el desborde a 5 dígitos (`ANI26-10000`) sigue cabiendo en `VarChar(15)`.

### D-4 — Tipos de fecha: `@db.DateTime(6)` en lugar de `@db.Timestamp(6)`
- `TIMESTAMP` en MySQL está acotado a `1970-01-01 … 2038-01-19` y **se convierte según la zona horaria de la sesión**; `DATETIME(6)` guarda el valor literal sin conversión.
- Prisma trabaja en UTC, por lo que `DATETIME(6)` + conexión en UTC (`timezone: 'Z'`) es la combinación predecible.
- Riesgo de no hacerlo: fechas de depósito/registro desplazadas ±horas al cambiar la TZ del servidor, y fallo duro con `precios_inscripcion.fecha_limite` o `actividades.fecha_inicio` más allá de 2038.

### D-5 — Collations sensibles a mayúsculas en columnas de seguridad
MySQL con `utf8mb4_0900_ai_ci` compara `'a' = 'A'`. Esto es deseable para búsquedas de nombre/correo, pero **no** para identificadores de seguridad:
- `grupos_registro.token` (`schema.prisma:241`) — token de completado de registro grupal, hoy UUID (`crypto.randomUUID()`).
- `accesos.auth_id` (`schema.prisma:21`) — UUID.
- `usuarios.codigo_barras` (`schema.prisma:199`) — identificador único.

**Decisión:** aplicar `COLLATE utf8mb4_bin` **solo** a esas tres columnas, con SQL manual añadido al final de la migración baseline (Prisma no modela collations → habrá *drift* declarado y aceptado).

> ⚠️ **Trampa crítica:** en MySQL las columnas de una FK deben tener **charset/collation idénticos**. `usuarios.folio_registro` es PK y referencia de 8 tablas: **no** tocar su collation, o `ALTER TABLE ... ADD FOREIGN KEY` fallará con `errno 150`. Las tres columnas de arriba no participan en ninguna FK, por eso son seguras.

Nota adicional: `src/auth.ts:25-27` busca el acceso por `folio_registro` y la contraseña se valida con `bcrypt.compare` en JS (nunca en SQL). Con collation `_ci` en `folio_registro`, escribir `ani26-0001` en el login funcionará: es una mejora de UX y **no** debilita la autenticación (el secreto sigue siendo el hash bcrypt).

### D-6 — Búsquedas insensibles sin `mode: 'insensitive'`
- Eliminar las 10 apariciones (§2 #13). MySQL con `_ai_ci` ya devuelve `contains: 'maria'` → `María`.
- **Pérdida real:** el índice GIN trigram (`pg_trgm`) que aceleraba `LIKE '%…%'`. Sin él, las búsquedas del cpanel hacen *full scan* de `usuarios`.
- **Mitigación:** volumen esperado de miles de filas → decenas de ms. Se añade `@@index([apellido, nombre])` para ordenaciones y se deja como **P2 opcional** un índice `FULLTEXT ... WITH PARSER ngram` (ojo: FULLTEXT no sirve para subcadenas arbitrarias ni para acentos de forma predecible; exige revalidar el UX de búsqueda).
- Criterio de aceptación: búsqueda en `/cpanel` por nombre parcial, apellido, correo y folio devuelve los mismos resultados que hoy (probado con datos semilla que incluyan acentos y mayúsculas).

### D-7 — Aislamiento transaccional para el cupo de actividades
- PG usa `READ COMMITTED` por defecto; MySQL usa `REPEATABLE READ`. El conteo de inscritos (`PrismaInscripcionActividadRepository.ts:94-98`) es una lectura **no bloqueante** que bajo `REPEATABLE READ` puede leer una instantánea anterior y **sobrevender cupo**.
- **Decisión:** ejecutar esa transacción con `isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted`, manteniendo el `SELECT … FOR UPDATE` sobre `actividades` (PK ⇒ lock de fila, no de tabla) y el `@@unique([folio_registro, id_actividad])` como red final.
- Añadir al mapeador de errores (`src/infrastructure/errors/prismaErrorMapper.ts`) los casos de deadlock MySQL: `P2034` ya está mapeado (`:23-25`); verificar que el driver envuelva `ER_LOCK_DEADLOCK (1213)` / `ER_LOCK_WAIT_TIMEOUT (1205)` en `P2034`/`P2024` y, si no, mapear el `errno` explícitamente.

### D-8 — Historial de migraciones: baseline nuevo
- Las 10 migraciones actuales son SQL de PostgreSQL y **no** se pueden aplicar ni convertir de forma fiable (contienen PL/pgSQL, `setval`, `pg_trgm`).
- **Decisión:** mover `prisma/migrations/` → `docs/db/migrations_pg_legacy/` (archivo histórico, fuera del radar de Prisma) y generar un único baseline `init_mysql` con `prisma migrate dev --name init_mysql`.
- Como la BD de producción será **nueva**, no hace falta `migrate resolve --applied`: `prisma migrate deploy` aplica el baseline desde cero.

### D-9 — Semilla
- Nueva semilla versionada: `prisma/seed.ts` (catálogos + `tipo_participante` + `precios_inscripcion` + ADMIN opcional), declarada en `prisma.config.ts` (`migrations.seed`).
- Requiere un runner TS: añadir `tsx` a `devDependencies` (`migrations.seed: "tsx prisma/seed.ts"`) **o** escribir `prisma/seed.mjs` usando el cliente generado (`node prisma/seed.mjs`), que evita una dependencia nueva. Decisión por defecto: `seed.mjs` (cero dependencias).
- Idempotencia obligatoria (`upsert` por PK natural): poder re-ejecutarla en cualquier entorno.

### D-10 — Pool y zona horaria de la conexión
- `connectionLimit: 10` (paridad con el `max: 10` de `pg`), `acquireTimeout: 5000` (**ms**), `idleTimeout: 30` (**segundos**, no ms — diferencia real frente a `pg`), `connectTimeout: 5000`.
- `timezone: 'Z'` (UTC) para que `DATETIME` no se desplace; respaldado por `default-time-zone='+00:00'` en el servidor y verificable con `SELECT @@session.time_zone, NOW(), UTC_TIMESTAMP();`.
- `bigIntAsNumber: false` (default) ⇒ `COUNT(*)` llega como `BigInt`: el código ya hace `Number(count)`, mantenerlo.
- Caché en `globalThis` (como hoy) para no recrear el pool en HMR de `next dev`.

---

## 4. Arquitectura objetivo

```
┌─ App Next.js (core/ y application/ intactos) ───────────────────────────┐
│ Server Actions → Use Cases → Puertos (IUsuarioRepository, …)            │
│                                    ▲                                    │
│ infrastructure/                     │ implementa                        │
│  ├─ database/client.ts        PrismaClient + PrismaMariaDb (adapter)    │
│  ├─ database/PrismaFolioGenerator.ts   ← NUEVO (sustituye secuencia PG) │
│  ├─ repositories/Prisma*      (SQL vía Prisma; 1 archivo con raw SQL)   │
│  └─ config/container.ts       (inyecta el generador de folios)          │
└──────────────────────────────────────────────────────────────────────────┘
                                     │ mysql:// (InnoDB, utf8mb4_0900_ai_ci)
                            MySQL 8.4 LTS nativo (sin Docker)
                                     +
                     ./storage (filesystem, sin cambios)
```

Lo que **no** cambia: `src/core/**`, `src/application/use-cases/**` (solo se añade un puerto), `src/shared/**`, storage, email, PDF, `src/proxy.ts`, `src/auth.ts`.

---

## 5. FASE 0 — Preparación y decisiones previas (0.25 d)

```bash
git switch -c feat/mysql
npx prisma migrate status          # foto del estado PG actual (referencia)
npm run build && npx tsc --noEmit  # línea base en verde ANTES de tocar nada
```

**Decisiones a cerrar en esta fase:**
1. ¿Se limpia `./storage/{comprobantes,constancias}` al arrancar con BD vacía? (recomendado: sí, a una carpeta `storage_legacy/` fuera del proyecto, para que `/api/archivos` no sirva huérfanos).
2. ¿Se conservan los folios ya emitidos? Si los asistentes de pruebas conservan su credencial, sembrar `folios_contador` con `AUTO_INCREMENT = <número siguiente>` (§10.3).
3. ¿MySQL 8.4 LTS (repo oficial) u 8.0 (APT de Ubuntu)? Ver D-1.

**Criterio de aceptación F0:** rama creada, build/tsc/lint en verde, decisiones 1–3 escritas en este archivo (sección §19 Changelog).

---

## 6. FASE 1 — Servidor MySQL y entorno (0.5 d)

### 6.1 Instalación (Ubuntu 24.04, sin Docker)

```bash
# Opción 1: MySQL 8.0 de Ubuntu
sudo apt update && sudo apt install -y mysql-server mysql-client

# Opción 2 (recomendada): MySQL 8.4 LTS del repo oficial
curl -fsSLO https://dev.mysql.com/get/mysql-apt-config_0.8.34-1_all.deb
sudo dpkg -i mysql-apt-config_0.8.34-1_all.deb     # elegir "MySQL Server & Cluster" 8.4 LTS
sudo apt update && sudo apt install -y mysql-server mysql-client
sudo systemctl enable --now mysql
mysql --version && mysqladmin ping                 # mysqld is alive
```

### 6.2 Endurecimiento y BD

```bash
sudo mysql_secure_installation      # contraseña de root, quitar anon/test

sudo mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS aniei
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS aniei_shadow
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;   -- shadow para `prisma migrate dev`
CREATE USER IF NOT EXISTS 'aniei'@'localhost' IDENTIFIED BY 'TU-CLAVE-SEGURA';
GRANT ALL PRIVILEGES ON aniei.* TO 'aniei'@'localhost';
GRANT ALL PRIVILEGES ON aniei_shadow.* TO 'aniei'@'localhost';
FLUSH PRIVILEGES;
SQL
```

`/etc/mysql/mysql.conf.d/mysqld.cnf` (reiniciar después con `sudo systemctl restart mysql`):

```ini
[mysqld]
bind-address            = 127.0.0.1
port                    = 3306
character-set-server    = utf8mb4
collation-server        = utf8mb4_0900_ai_ci
default-time-zone       = '+00:00'
innodb_file_per_table   = ON
max_connections         = 150
wait_timeout            = 600
interactive_timeout     = 600
sql_mode                = STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION
```

> `GRANT ALL` sobre `aniei_shadow` es necesario porque `prisma migrate dev` crea/destruye la base sombra. En producción (solo `migrate deploy`) no se necesita shadow.

### 6.3 Variables de entorno

`.env.local` (y `.env.example`):

```bash
DATABASE_URL="mysql://aniei:TU-CLAVE-SEGURA@localhost:3306/aniei"
DIRECT_URL="mysql://aniei:TU-CLAVE-SEGURA@localhost:3306/aniei"
SHADOW_DATABASE_URL="mysql://aniei:TU-CLAVE-SEGURA@localhost:3306/aniei_shadow"
```

Opcional (recomendado, cierra la deuda P0-5.2): endurecer `src/shared/env.ts:4-5` para exigir el prefijo:

```ts
DATABASE_URL: z.string().url().startsWith('mysql://', 'DATABASE_URL debe ser mysql://'),
```

**Criterio de aceptación F1:** `mysql -u aniei -p aniei -e "SELECT VERSION(), @@collation_database, @@time_zone;"` devuelve `8.x`, `utf8mb4_0900_ai_ci`, `+00:00`.

---

## 7. FASE 2 — Esquema Prisma en MySQL + baseline (0.5–1 d)

### 7.1 Archivar migraciones PG

```bash
mkdir -p docs/db/migrations_pg_legacy
git mv prisma/migrations/* docs/db/migrations_pg_legacy/
# conservar prisma/migrations/migration_lock.toml (se regenera con provider mysql)
rm -f prisma/migrations/migration_lock.toml
```

### 7.2 Cambios en `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "mysql"          // era "postgresql" (:7)
}

enum Rol {                     // sin cambios: MySQL genera ENUM('USER','ADMIN')
  USER
  ADMIN
}
```

| Cambio | Antes | Después |
|--------|-------|---------|
| `accesos.auth_id` (`:21`) | `String? @unique @db.Uuid` | `String? @unique @db.VarChar(36)` |
| Todas las fechas (`:43,44,65,93,94,123,162,216,243,261,276`) | `@db.Timestamp(6)` | `@db.DateTime(6)` |
| `usuarios.folio_registro` (`:197`) | `String @id @default(dbgenerated("(…nextval…)")) @db.VarChar(15)` | `String @id @db.VarChar(15)` (sin default: lo pone la app) |
| Nuevo modelo | — | `model folios_contador { id Int @id @default(autoincrement()) creado_en DateTime @default(now()) @db.DateTime(6) }` |
| Búsquedas del cpanel | (índice GIN trigram en migración) | `@@index([apellido, nombre])` en `usuarios` |

Validar y dejar que Prisma liste cualquier otro tipo nativo inválido:

```bash
npx prisma validate     # autoridad sobre qué @db.* es legal en MySQL
npx prisma format
```

### 7.3 `prisma.config.ts`

```ts
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"]!,
    ...(process.env.SHADOW_DATABASE_URL
      ? { shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL }
      : {}),
  },
});
```

### 7.4 Baseline

```bash
npx prisma migrate dev --name init_mysql
# → crea prisma/migrations/<ts>_init_mysql/migration.sql y lo aplica en aniei (+ shadow)
npx prisma generate
```

**Edición manual obligatoria de la migración generada** (añadir al final, antes de aplicarla en otros entornos):

```sql
-- D-5: identificadores de seguridad sensibles a mayúsculas/minúsculas.
-- NO aplicar a columnas que participan en FK (errno 150).
ALTER TABLE `grupos_registro` MODIFY `token` VARCHAR(100) NOT NULL
  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE `accesos` MODIFY `auth_id` VARCHAR(36) NULL
  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
ALTER TABLE `usuarios` MODIFY `codigo_barras` VARCHAR(50) NULL
  CHARACTER SET utf8mb4 COLLATE utf8mb4_bin;
```

> Drift conocido: `prisma migrate dev` puede reportar diferencia entre esquema y BD por estas collations. Documentarlo en el propio archivo de migración (comentario) y en §19 (Changelog). **No** usar `prisma db push` en producción a partir de aquí.

Verificación post-migración:

```bash
mysql -u aniei -p aniei -e "SHOW TABLES;"                       # 21 tablas (20 modelos + folios_contador) + _prisma_migrations
mysql -u aniei -p aniei -e "SHOW CREATE TABLE usuarios\G"       | grep -i "engine=InnoDB\|utf8mb4"
mysql -u aniei -p aniei -e "SHOW INDEX FROM usuarios;"          # PK + FK indexadas
mysql -u aniei -p aniei -e "SHOW CREATE TABLE accesos\G"        | grep -i "ENUM('USER','ADMIN')"
```

**Criterio de aceptación F2:** `npx prisma migrate status` → *up to date*; todas las tablas InnoDB/utf8mb4; `SHOW CREATE TABLE` sin `TIMESTAMP`; `folios_contador` existe.

---

## 8. FASE 3 — Driver y cliente (0.25 d)

### 8.1 Dependencias

```bash
npm uninstall pg @prisma/adapter-pg @types/pg
npm install @prisma/adapter-mariadb        # trae `mariadb` como dependencia
npx prisma generate
```

### 8.2 Nuevo `src/infrastructure/database/client.ts`

```ts
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@/generated/prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL no está configurada');

  const u = new URL(url);
  const adapter = new PrismaMariaDb({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    connectionLimit: 10,
    acquireTimeout: 5000,   // ms
    idleTimeout: 30,        // SEGUNDOS (distinto de pg: allí era ms)
    connectTimeout: 5000,   // ms
    timezone: 'Z',          // UTC: evita desplazar DATETIME
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
```

**Pérdidas respecto al cliente PG actual (`client.ts:16-27`), a documentar:**
- `maxUses: 7500` (reciclado de conexiones) no tiene equivalente; se cubre con `idleTimeout` y `wait_timeout` del servidor.
- `pool.on('error', …)`: el pool de `mariadb` emite errores por conexión; añadir un `try/catch` de arranque y un `SELECT 1` de smoke test (§12.1) en su lugar.

**Criterio de aceptación F3:** script de humo (§12.1) conecta, inserta y lee con fechas correctas en UTC.

---

## 9. FASE 4 — Cambios de código (1 d)

### 9.1 Puerto y generador de folios (D-3)

`src/application/ports/IFolioGenerator.ts`:
```ts
export interface IFolioGenerator {
  siguiente(): Promise<string>;
}
```

`src/infrastructure/database/PrismaFolioGenerator.ts`:
```ts
import type { PrismaClient } from '@/generated/prisma/client';
import type { IFolioGenerator } from '@/application/ports/IFolioGenerator';

const PREFIJO = 'ANI26';
const DIGITOS = 4;

export class PrismaFolioGenerator implements IFolioGenerator {
  constructor(private readonly prisma: PrismaClient) {}

  async siguiente(): Promise<string> {
    const fila = await this.prisma.folios_contador.create({ data: {} });
    return `${PREFIJO}-${String(fila.id).padStart(DIGITOS, '0')}`;
  }
}
```

`src/infrastructure/repositories/PrismaUsuarioRepository.ts`:
```ts
constructor(
  private readonly prisma: PrismaClient,
  private readonly folioGenerator: IFolioGenerator,   // parámetro nuevo (obligatorio)
) {}

async crear(usuario: Usuario): Promise<Usuario> {
  const folio = usuario.folioRegistro ?? (await this.folioGenerator.siguiente());
  const data = { ...UsuarioMapper.toPersistence(usuario), folio_registro: folio };
  const created = await this.prisma.usuarios.create({ data });
  return UsuarioMapper.toDomain(created);
}
```

Y en `crearGrupoTransaccional()` (`:84-96`), dentro del `$transaction` existente:
```ts
const { id } = await tx.folios_contador.create({ data: {} });
const folio = `ANI26-${String(id).padStart(4, '0')}`;
const newUsuario = await tx.usuarios.create({ data: { folio_registro: folio, /* …resto igual… */ } });
```

`src/infrastructure/config/container.ts`:
```ts
export function getUsuarioRepository(): IUsuarioRepository {
  return new PrismaUsuarioRepository(prisma, new PrismaFolioGenerator(prisma));
}
```

⚠️ **No olvidar `PrismaTransactionManager.ts:12-18`**, que construye `new PrismaUsuarioRepository(tx as any)` dentro de la transacción: debe recibir un generador ligado a `tx` (`new PrismaFolioGenerator(tx as any)`), o el contador quedará fuera de la transacción.

### 9.2 Eliminar `mode: 'insensitive'` (10 apariciones)
- `src/infrastructure/services/PrismaAdminQueryService.ts:22-24`
- `src/infrastructure/repositories/PrismaEquipoRepository.ts:126-129`
- `src/app/cpanel/actividades/ponentes.actions.ts:35-37`

Queda `{ contains: q }`. `npx tsc --noEmit` debe usarse como verificación de que no queda ninguno.

### 9.3 SQL crudo y aislamiento (D-7)

`src/infrastructure/repositories/PrismaInscripcionActividadRepository.ts:72-116`:
```ts
import { Prisma } from '@/generated/prisma/client';

await this.prisma.$transaction(
  async (tx) => {
    const [actividad] = await tx.$queryRaw<Array<{ cupo_maximo: number | null }>>`
      SELECT cupo_maximo
      FROM actividades
      WHERE id_actividad = ${idActividad}
      FOR UPDATE
    `;

    if (!actividad || !actividad.cupo_maximo) { /* insertar y salir, igual que hoy */ }

    const [{ total }] = await tx.$queryRaw<Array<{ total: bigint | number }>>`
      SELECT COUNT(*) AS total
      FROM inscripcion_actividades
      WHERE id_actividad = ${idActividad}
    `;

    if (Number(total) >= actividad.cupo_maximo) throw new Error('SIN_CUPO');
    /* insertar */
  },
  { timeout: 8000, isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted },
);
```

Cambios: `COUNT(*)::bigint as count` → `COUNT(*) AS total` (el alias `count` es ambiguo con la función) y aislamiento explícito.

### 9.4 Mapeador de errores
`src/infrastructure/errors/prismaErrorMapper.ts`: confirmar que los deadlocks de MySQL (`errno 1213`, lock wait `1205`) llegan como `P2034`/`P2024`. Si el adapter los envuelve distinto, añadir rama por `errno` en el bloque `anyErr` (`:27-32`).

### 9.5 Barrido final de restos PG
```bash
grep -rn "mode: 'insensitive'\|::bigint\|nextval\|pg_trgm\|ILIKE\|@prisma/adapter-pg\|from 'pg'" src prisma scripts --include='*.ts' --include='*.tsx' --include='*.prisma' --include='*.mjs'
# esperado: 0 coincidencias (fuera de src/generated)
```

**Criterio de aceptación F4:** `npx tsc --noEmit`, `npm run lint`, `npm run build` en verde y grep anterior vacío.

---

## 10. FASE 5 — Semilla de datos (0.5 d)

`prisma/seed.mjs` (idempotente, sin dependencias nuevas). Contenido mínimo, con **origen** de cada bloque:

| Tabla | Filas | Origen |
|-------|-------|--------|
| `cargos` | 6 | `docs/db/seed_aniei2026.sql:13-20` |
| `estados` | 32 | `docs/db/seed_aniei2026.sql:24-57` |
| `tipo_usuario` | — | `docs/db/seed_aniei2026.sql:61-68` |
| `tipo_actividad` | — | `docs/db/seed_aniei2026.sql:72-86` (incluir `maneja_equipos`, `genera_constancia_participante`, `clave`) |
| `titulos` | — | `docs/db/seed_aniei2026.sql:90-97` |
| `instituciones` | 220 | `docs/db/seed_aniei2026.sql:101-321` |
| `tipo_participante` | 3 | `prisma/migrations/20260830_add_tipo_participante/migration.sql:10-13` |
| `precios_inscripcion` | 12 | ídem `:40-70` (**revisar vigencia de fechas/costos 2026**) |

Estructura del script:
```js
import { PrismaClient } from '../src/generated/prisma/client.js';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
// adapter + client iguales que en src/infrastructure/database/client.ts
// 1) upsert de catálogos por PK natural
// 2) upsert de tipo_participante y precios_inscripcion
// 3) opcional: crear ADMIN (ver §10.2)
```

### 10.1 Contadores `AUTO_INCREMENT`
Reemplazo directo de `docs/db/seed_aniei2026.sql:328-333`:
```sql
ALTER TABLE cargos        AUTO_INCREMENT = 100;
ALTER TABLE estados       AUTO_INCREMENT = 100;
ALTER TABLE tipo_usuario  AUTO_INCREMENT = 100;
ALTER TABLE tipo_actividad AUTO_INCREMENT = 100;
ALTER TABLE titulos       AUTO_INCREMENT = 100;
ALTER TABLE instituciones AUTO_INCREMENT = 500;
```
(Innodb ajusta automáticamente al `MAX(id)+1` si el valor indicado es menor.)

### 10.2 Primer ADMIN
Mismo procedimiento que `PLAN_DESPLIEGUE.md` §8, adaptado:
```bash
FOLIO="ANI26-0001"
HASH=$(node -e "const b=require('bcryptjs');console.log(b.hashSync(process.argv[1],10))" 'TU-CLAVE')
mysql -u aniei -p aniei -e "
INSERT INTO accesos (folio_registro, email, rol, nombre, password)
VALUES ('$FOLIO','admin@tudominio.mx','ADMIN','Administrador','$HASH');"
```
> Con BD vacía, el ADMIN puede necesitar una fila en `usuarios` si alguna consulta hace JOIN; validar en la prueba de aceptación (§12.2 paso 1). Si hace falta, insertar el usuario primero **con folio explícito** y sembrar `folios_contador` en consecuencia.

### 10.3 Alineación del contador de folios
Si ya existen folios emitidos que deban respetarse (decisión F0.2):
```sql
INSERT INTO folios_contador (id) VALUES (35);      -- último folio usado: ANI26-0035
ALTER TABLE folios_contador AUTO_INCREMENT = 36;   -- el siguiente será ANI26-0036
```

**Criterio de aceptación F5:** `node prisma/seed.mjs` ejecutable dos veces sin errores; `/registro` muestra títulos, estados, instituciones, tipos de participante y precios correctos.

---

## 11. FASE 6 — Verificación funcional (0.5–1 d)

### 11.1 Estática
```bash
npx prisma validate && npx prisma generate
npx tsc --noEmit && npm run lint && npm run build
```

### 11.2 Flujos de punta a punta (`npm run dev`)

| # | Flujo | Verificación |
|---|-------|--------------|
| 1 | Login ADMIN (folio + password) | Entra a `/cpanel`; sin sesión → 307 a `/login` |
| 2 | Registro individual con comprobante + facturación | Folio `ANI26-XXXX` correcto, correo recibido, PDF de constancia, archivo en `./storage/comprobantes/…`, fila en `depositos` y `facturaciones` |
| 3 | Registro con actividades | Inscripción respetando cupo; `inscripcion_actividades` con `fecha_inscripcion` en UTC correcta |
| 4 | **Concurrencia de cupo** | Actividad con `cupo_maximo = 3`; 10 inscripciones en paralelo → exactamente 3 `ok` y 7 `sinCupo`, sin `P2034` sin tratar |
| 5 | **Concurrencia de folios** | 20 registros en paralelo → 20 folios distintos, formato `ANI26-\d{4,}`, sin `P2002` |
| 6 | Grupo rápido (`/perfil/grupo/registro`) | N miembros pre-registrados, un solo comprobante, token UUID, correo con enlace |
| 7 | Completar registro (`/grupo-completar/[token]/usuario/[id]`) | Actualiza correo real + password; sin `P2002` por duplicado |
| 8 | Registro de ponente desde cpanel | Crea `usuarios` + `accesos` + `actividad_ponentes`; notificación por correo |
| 9 | Búsquedas del cpanel | Por nombre parcial con acentos y mayúsculas (`maria` → `María`), por correo, por folio; usuarios y equipos |
| 10 | Constancias (participante, ponente, manual) | PDF generado y reenvío por correo |
| 11 | Archivos firmados | `/api/archivos/…?exp=&sig=` sirve el comprobante; URL expirada → 403; path traversal → 400 |
| 12 | Reportes | `/cpanel/reportes` (groupBy por institución) y PDF de lista de participantes |
| 13 | Precios | `/cpanel/configuracion`: leer, guardar, crear, eliminar |
| 14 | Fechas | Comparar `fecha_registro` de un registro nuevo contra `UTC_TIMESTAMP()`; diferencia < 1 min |

### 11.3 Consultas de diagnóstico
```bash
mysql -u aniei -p aniei -e "SELECT folio_registro, nombre, fecha_registro, UTC_TIMESTAMP() FROM usuarios ORDER BY id_grupo_registro LIMIT 5;"
mysql -u aniei -p aniei -e "SELECT * FROM folios_contador ORDER BY id DESC LIMIT 3;"
mysql -u aniei -p aniei -e "SHOW ENGINE INNODB STATUS\G" | grep -A5 "LATEST DETECTED DEADLOCK"
```

**Criterio de aceptación F6:** los 14 flujos en verde; cero errores en el log de la app; `SHOW ENGINE INNODB STATUS` sin deadlocks recurrentes.

---

## 12. FASE 7 — Corte en producción (0.5 d)

### 12.1 Orden de ejecución
```bash
# 1. Smoke test de conexión (script nuevo scripts/db-smoke.mjs: adapter + SELECT 1 + NOW()/UTC_TIMESTAMP())
node scripts/db-smoke.mjs

# 2. Esquema desde cero en producción
npm ci && npx prisma generate
source /tmp/prod-env.sh && npx prisma migrate deploy
source /tmp/prod-env.sh && npx prisma migrate status     # "Database schema is up to date!"

# 3. Catálogos + ADMIN
node prisma/seed.mjs

# 4. Build y arranque
npm run build && npx tsc --noEmit && npm run lint
sudo systemctl restart aniei && systemctl is-active aniei
```

### 12.2 Aceptación en producción
1. `curl -I https://registro.dominio/login` → 200; `/cpanel` sin cookie → 307.
2. Login ADMIN real y recorrido por las 6 secciones del cpanel.
3. Registro de prueba de punta a punta (flujo 2 de §11.2) y constancia descargada.
4. `mysqldump` de respaldo inmediato (§13.2).

### 12.3 Rollback
- La BD PostgreSQL anterior **no se borra** hasta 7 días después del corte.
- Rollback de aplicación: volver al `.zip`/commit anterior + `.env.local` con URLs `postgresql://` + `sudo systemctl restart aniei` (< 5 min).
- Rollback de datos: no aplica (la BD MySQL arranca vacía); si el corte falla, se pierde únicamente lo registrado en MySQL durante el intento → registrar folios emitidos para re-sembrar el contador (§10.3).

---

## 13. FASE 8 — Limpieza y documentación (0.5 d)

### 13.1 Documentación y limpieza

1. `PLAN_DESPLIEGUE.md`: reescribir §1 (mapa mental), §2 (dato 6: sin dump), §3.2–3.3 (APT MySQL), §4 (BD), §6 (esquema, sin `pg_restore`), §7.2 (archivos huérfanos), §11 (checklist), §12 (respaldos), §13 (actualización), §14 (troubleshooting MySQL), §15.
2. `AGENTS.md`: stack (MySQL 8.x + `@prisma/adapter-mariadb`), sección "Base de datos" (secuencia de folios → `PrismaFolioGenerator`, `DateTime(6)`, collations, aislamiento `ReadCommitted`, shadow DB), y comandos (`prisma migrate dev` con shadow).
3. `docs/DESIGN.md`: §5 estructura (nuevo `folios_contador` y `PrismaFolioGenerator`), §15 infraestructura intercambiable, §16 mappers, ADR nuevo "ADR-13 MySQL como BD objetivo".
4. `.env.example`: URLs `mysql://` + `SHADOW_DATABASE_URL`.
5. Eliminar `pg`, `@prisma/adapter-pg`, `@types/pg` del `package.json` y del `package-lock.json` (`npm ci` limpio).
6. Decidir el destino de `docs/db/aniei2026.sql` (dump PG legacy) y `supabase/migrations_legacy/`: marcarlos como histórico en su cabecera.
7. `docs/PROGRESS.md`: nueva entrada de changelog + cierre/actualización de las tareas P0 que dependían de PG (`P0-4.2` secuencia, `P0-4.3` `pg_trgm`, `P0-4.4` `onDelete`).

### 13.2 Respaldos (sustituye a `pg_dump`)
```bash
# cron 02:00, retención 7 días
mysqldump --single-transaction --quick --routines --triggers --default-character-set=utf8mb4 \
  -u aniei -p"$MYSQL_PWD" aniei | gzip > /backups/aniei-$(date +%F).sql.gz
find /backups -name 'aniei-*.sql.gz' -mtime +7 -delete
# restaurar
gunzip < /backups/aniei-AAAA-MM-DD.sql.gz | mysql -u aniei -p aniei
```

---

## 14. Riesgos y mitigaciones

| # | Riesgo | Prob. | Impacto | Mitigación |
|---|--------|-------|---------|-----------|
| R1 | Folios duplicados o ausentes por el cambio de generador | Media | **Alto** (rompe registro, constancias y login) | Opción A de D-3 (AUTO_INCREMENT atómico); prueba de concurrencia §11.2 #5; `folios_contador` sembrado (§10.3) |
| R2 | `create()` no devuelve el folio en MySQL (PK no autogenerado) | Alta si se usa trigger | Alto | Trigger **descartado** (D-3 C); el folio se pasa explícito y Prisma lo devuelve |
| R3 | Sobrevenda de cupo por `REPEATABLE READ` | Media | Alto (overbooking de talleres) | `ReadCommitted` + `FOR UPDATE` + unique (`schema.prisma:167`); prueba §11.2 #4 |
| R4 | Fechas desplazadas por zona horaria (`TIMESTAMP`/`timezone`) | Alta | Medio (reportes y `fecha_limite` de precios) | `@db.DateTime(6)` + `timezone:'Z'` + `default-time-zone='+00:00'`; prueba §11.2 #14 |
| R5 | Búsquedas del cpanel lentas sin índice trigram | Media | Bajo–medio (UX admin) | Volúmenes pequeños; `@@index([apellido, nombre])`; FULLTEXT ngram como P2 |
| R6 | Collation `_ci` en identificadores de seguridad | Baja | Medio (colisión de tokens) | `utf8mb4_bin` en `token`, `auth_id`, `codigo_barras` (D-5), respetando FKs |
| R7 | `errno 150` al crear FKs por mezcla de collations | Media si se edita a mano | Alto (migración fallida) | Regla explícita en D-5: no cambiar collation de columnas con FK |
| R8 | Drift entre `schema.prisma` y BD por el SQL manual de collations | Alta | Bajo | Comentario en la migración + prohibir `db push` en prod + `migrate status` en cada despliegue |
| R9 | Deadlocks en inscripciones concurrentes | Media | Medio | Timeout 8 s, aislamiento `ReadCommitted`, mapeo `P2034` (§9.4), reintento en UI |
| R10 | `idleTimeout` en segundos mal interpretado como ms | Media | Bajo (conexiones cerradas o pool agotado) | Código revisado en §8.2 + smoke test y prueba de carga ligera |
| R11 | Pérdida de archivos huérfanos en `./storage` | Alta (BD vacía) | Bajo | Decisión F0.1: mover a `storage_legacy/` y no servir rutas inexistentes |
| R12 | Olvidar la shadow DB en `migrate dev` | Alta | Bajo (error P3014/P1003) | `SHADOW_DATABASE_URL` en `.env.example` + grants en §6.2 |
| R13 | Precios semilla desactualizados (fechas 2026) | Alta | Medio (cobros incorrectos) | Revisión explícita en §10 y validación contra el tarifario oficial ANIEI |
| R14 | Regresión silenciosa en `core/`/`application/` | Baja | Medio | Esas capas no se modifican; `npx tsc --noEmit` como puerta |

---

## 15. Estimación y gates

| Fase | Contenido | Estimación | Gate |
|------|-----------|------------|------|
| F0 | Rama + decisiones | 0.25 d | Build/tsc en verde antes de empezar |
| F1 | MySQL 8.4 + env | 0.5 d | `SELECT VERSION(), @@collation_database, @@time_zone` |
| F2 | Esquema MySQL + baseline + collations | 0.5–1 d | `migrate status` up to date; 21 tablas InnoDB |
| F3 | Adapter + `client.ts` + deps | 0.25 d | Smoke test `SELECT 1` + fechas UTC |
| F4 | Folios, `mode`, raw SQL, aislamiento | 1 d | `tsc` + `lint` + `build` verdes; grep de restos vacío |
| F5 | Semilla + ADMIN | 0.5 d | Seed idempotente; `/registro` con catálogos completos |
| F6 | Verificación funcional (14 flujos) | 0.5–1 d | 14/14 en verde, incluidas concurrencias |
| F7 | Corte en producción | 0.5 d | Checklist §12.2 firmado |
| F8 | Docs y limpieza | 0.5 d | `PLAN_DESPLIEGUE.md`, `AGENTS.md`, `DESIGN.md`, `.env.example` actualizados |
| **Total** | | **3–4 d** | |

**Gate G1 (no avanzar a F3 sin):** esquema validado por `prisma validate` + baseline aplicado en local.
**Gate G2 (no avanzar a F7 sin):** F4 y F6 completas al 100 %, en particular las pruebas de concurrencia #4 y #5.

---

## 16. Checklist final de aceptación

| # | Verificación | Comando / evidencia | Esperado |
|---|--------------|---------------------|----------|
| 1 | Provider MySQL | `grep -n 'provider = "mysql"' prisma/schema.prisma` | 1 coincidencia |
| 2 | Sin restos PG | `grep -rn "adapter-pg\|from 'pg'\|nextval\|::bigint\|mode: 'insensitive'" src prisma --include='*.ts' --include='*.prisma'` (excl. `src/generated`) | 0 |
| 3 | Cliente con adapter mariadb | `grep -n PrismaMariaDb src/infrastructure/database/client.ts` | presente |
| 4 | Generador de folios | `grep -rn PrismaFolioGenerator src` | puerto + impl + container + tx manager |
| 5 | Migraciones limpias | `ls prisma/migrations` | solo `<ts>_init_mysql` |
| 6 | Migraciones PG archivadas | `ls docs/db/migrations_pg_legacy` | 10 carpetas |
| 7 | Estado de esquema | `npx prisma migrate status` | up to date |
| 8 | Estática | `npx tsc --noEmit && npm run lint && npm run build` | exit 0 |
| 9 | Motor y charset | `SHOW TABLE STATUS` | InnoDB / utf8mb4_0900_ai_ci |
| 10 | Collations binarias | `SHOW FULL COLUMNS FROM grupos_registro LIKE 'token'` | `utf8mb4_bin` |
| 11 | Sin `TIMESTAMP` | `SHOW CREATE TABLE usuarios` | `datetime(6)` |
| 12 | Enum | `SHOW COLUMNS FROM accesos LIKE 'rol'` | `enum('USER','ADMIN')` |
| 13 | Concurrencia cupo | Prueba §11.2 #4 | 3 ok / 7 sinCupo |
| 14 | Concurrencia folios | Prueba §11.2 #5 | 20 folios únicos |
| 15 | Búsqueda insensible | `/cpanel` con `maria` | encuentra `María` |
| 16 | Fechas UTC | §11.2 #14 | desfase < 1 min |
| 17 | Archivos firmados | §11.2 #11 | 200 / 403 / 400 |
| 18 | Backup | `mysqldump` + restore en BD de prueba | restaura sin errores |
| 19 | Docs | `git diff --stat PLAN_DESPLIEGUE.md AGENTS.md docs/DESIGN.md .env.example` | actualizados |
| 20 | Seed idempotente | `node prisma/seed.mjs` ×2 | sin errores ni duplicados |

---

## 17. Anexo A — Traducción rápida PostgreSQL → MySQL (referencia del equipo)

| Tema | PostgreSQL (hoy) | MySQL (destino) |
|------|------------------|-----------------|
| Secuencias | `CREATE SEQUENCE` + `nextval()` | `AUTO_INCREMENT` en tabla contadora (§3 D-3) |
| Devolver la fila insertada | `RETURNING` (Prisma lo usa) | No existe; Prisma hace `INSERT` + `SELECT` por PK |
| UUID nativo | `@db.Uuid` | `@db.VarChar(36)` + `uuid()` en cliente |
| Fecha/hora | `@db.Timestamp(6)` | `@db.DateTime(6)` (sin límite 2038, sin conversión por sesión) |
| Cast | `expr::bigint` | `CAST(expr AS UNSIGNED)` |
| Búsqueda insensible | `ILIKE` / `mode: 'insensitive'` / `pg_trgm` GIN | Collation `_ai_ci` + `LIKE`; FULLTEXT ngram opcional |
| Aislamiento por defecto | `READ COMMITTED` | `REPEATABLE READ` (fijar `ReadCommitted` donde importe) |
| Bloqueo pesimista | `SELECT … FOR UPDATE` | Igual (InnoDB) |
| Enums | `CREATE TYPE … AS ENUM` | `ENUM(...)` en la columna |
| Boolean | `boolean` | `TINYINT(1)` |
| Extensión de búsqueda | `CREATE EXTENSION pg_trgm` | Sin equivalente |
| DDL condicional | `DO $$ … EXCEPTION WHEN …` | `IF NOT EXISTS` limitado; usar `information_schema` + prepared statements |
| Backup | `pg_dump -Fc` / `pg_restore` | `mysqldump --single-transaction` / `mysql <` |
| Healthcheck | `pg_isready` | `mysqladmin ping` |
| Shadow DB (`migrate dev`) | Opcional | **Obligatoria** (auto si hay permisos, si no `shadowDatabaseUrl`) |
| Límite de clave de índice | ~2704 bytes | 3072 bytes (InnoDB, `DYNAMIC`); utf8mb4 ⇒ ≤ 768 chars por columna indexada |
| Longitud de nombres | 63 bytes | 64 chars (tablas, índices y **constraints de FK**) |

Verificación de longitudes actuales (todas dentro del límite): FK más larga `actividad_ponentes_folio_registro_ponente_fkey` (46), índice más largo `usuarios_id_entidad_federativa_idx` (34).

---

## 18. Anexo B — Archivos a tocar

| Archivo | Acción |
|---------|--------|
| `prisma/schema.prisma` | provider, `@db.Uuid`→`VarChar(36)`, `Timestamp(6)`→`DateTime(6)`, quitar `dbgenerated`, modelo `folios_contador`, índice `[apellido, nombre]` |
| `prisma/migrations/` | vaciar → baseline `init_mysql` (+ SQL manual de collations) |
| `prisma/seed.mjs` | **nuevo** |
| `prisma.config.ts` | `shadowDatabaseUrl`, `migrations.seed` |
| `src/infrastructure/database/client.ts` | reescribir con `PrismaMariaDb` |
| `src/infrastructure/database/PrismaFolioGenerator.ts` | **nuevo** |
| `src/application/ports/IFolioGenerator.ts` | **nuevo** |
| `src/infrastructure/repositories/PrismaUsuarioRepository.ts` | inyectar generador; `crear()` y `crearGrupoTransaccional()` |
| `src/infrastructure/database/PrismaTransactionManager.ts` | pasar generador ligado a `tx` |
| `src/infrastructure/config/container.ts` | cablear `PrismaFolioGenerator` |
| `src/infrastructure/repositories/PrismaInscripcionActividadRepository.ts` | raw SQL + `isolationLevel` |
| `src/infrastructure/services/PrismaAdminQueryService.ts` | quitar `mode` |
| `src/infrastructure/repositories/PrismaEquipoRepository.ts` | quitar `mode` |
| `src/app/cpanel/actividades/ponentes.actions.ts` | quitar `mode` |
| `src/infrastructure/errors/prismaErrorMapper.ts` | validar deadlock/lock-wait MySQL |
| `src/shared/env.ts` | (opcional) validar prefijo `mysql://` |
| `package.json` | −`pg` −`@prisma/adapter-pg` −`@types/pg`, +`@prisma/adapter-mariadb` |
| `.env.example` | URLs `mysql://` + `SHADOW_DATABASE_URL` |
| `scripts/db-smoke.mjs` | **nuevo** (humo de conexión) |
| `PLAN_DESPLIEGUE.md`, `AGENTS.md`, `docs/DESIGN.md`, `docs/PROGRESS.md` | actualización documental |
| `docs/db/seed_aniei2026.sql`, `docs/db/aniei2026.sql` | marcar como histórico PG |

---

## 19. Changelog del plan

| Fecha | Cambio |
|-------|--------|
| 2026-09-10 | Versión inicial. Inventario verificado sobre el código actual; decisiones D-1…D-10; 8 fases; gates G1/G2. Pendiente: cerrar decisiones F0.1–F0.3 y validar precios semilla 2026 con ANIEI. |
