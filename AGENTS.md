# AGENTS.md — Sistema de Registro ANIEI 2026

Sistema web de inscripción al congreso ANIEI 2026: registro individual y grupal, comprobantes de pago, actividades con cupo, constancias PDF y panel de administración (`/cpanel`).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript estricto · Prisma 7 (`@prisma/adapter-mariadb`) · MySQL 8.x · Zod 4 · Tailwind CSS 4 · NextAuth v5 · Nodemailer · `@react-pdf/renderer` · qrcode · bcryptjs.

**Principio rector:** Clean Architecture / hexagonal. Las capas `core` y `application` no dependen de frameworks ni de librerías externas.

---

## Comandos

| Tarea | Comando |
|-------|---------|
| Desarrollo | `npm run dev` |
| Build | `npm run build` |
| Lint | `npm run lint` |
| Typecheck | `npx tsc --noEmit` |
| Cliente Prisma | `npx prisma generate` (corre en `postinstall`) |
| Estado de migraciones | `npx prisma migrate status` |
| Aplicar migraciones | `npx prisma migrate deploy` |

**No existe suite de tests** (ni vitest ni jest). La verificación de cualquier cambio es: `npx tsc --noEmit` + `npm run lint` + `npm run build` en verde, y probar el flujo real en `npm run dev`. Ejecuta los tres antes de dar una tarea por terminada.

Variables de entorno en `.env.local` (gitignoreado); plantilla en `.env.example`.

---

## Arquitectura y estructura

```
prisma/schema.prisma          Fuente de verdad de la BD
src/core/                     DOMINIO puro: entities, value-objects, errors, enums
src/application/              APLICACIÓN: ports (interfaces), use-cases, dtos
src/infrastructure/           ADAPTADORES: database, repositories, mappers, services, config/container.ts
src/app/                      PRESENTACIÓN: páginas, layouts, Server Actions (actúan como controllers)
src/shared/                   Utilidades transversales: auth/requireAdmin.ts, security/password.ts,
                              validation/registro.schema.ts, types/catalogos.ts, env.ts
src/generated/prisma/         Cliente Prisma generado — GITIGNOREADO, no editar a mano
src/auth.ts, src/proxy.ts     NextAuth (credenciales) y middleware de protección de rutas
```

Reglas de dependencia (no romperlas):

- `core` y `application` **no** importan Next.js, Prisma, Zod ni nada externo. Solo TS puro y entre sí.
- `application` define puertos (`IXxxRepository`, `IEmailService`, `IPdfService`, `IStorageService`, …); `infrastructure` los implementa.
- `app/` no construye repositorios ni clientes a mano: obtiene dependencias de los getters de `src/infrastructure/config/container.ts` e instancia el use case.
- Excepción conocida (deuda P2, no propagarla): algunas páginas de `app/` importan `prisma` directamente.

Flujo canónico: `[Client Component] → Server Action → Use Case → Domain + Ports ← Infrastructure`.

---

## Convenciones de código

- Alias de import `@/*` → `./src/*`. En `core` se usan rutas relativas (`../value-objects/Email`).
- Nombres de archivos y clases en español y PascalCase para entidades/use cases (`RegistrarUsuario.ts`, `GenerarConstancia.ts`); `actions.ts` junto a la página que las consume.
- Use cases: clase con dependencias inyectadas por constructor, métodos en español (`obtenerPrecios`, `guardarPrecio`).
- Servidores/acciones: archivo con `'use server'` en la primera línea.
- Validación de entrada con Zod en la capa de presentación (`src/shared/validation/registro.schema.ts` usa `zod/v4`; el resto `zod`). Nunca validar en `core`/`application` con Zod.
- Sin comentarios en el código salvo que se pidan explícitamente.

### Patrón de Server Action

```ts
'use server';

export async function guardarPrecioAction(id: number, data: ActualizarPrecioDTO) {
  try {
    await requireAdmin();
    const useCase = new GestionarPrecios(getPrecioInscripcionRepository());
    const precio = await useCase.guardarPrecio(id, data);
    revalidatePath('/cpanel/configuracion');
    return { success: true as const, data: precio };
  } catch (error) {
    console.error('Error en guardarPrecioAction:', error);
    return { success: false as const, error: 'Error al guardar el precio' };
  }
}
```

Las actions **no lanzan** errores al cliente: devuelven `{ success, data | error }` con `as const`. Mensajes de error en español y sin filtrar detalles internos (solo `isDev` donde ya existe).

---

## Base de datos

- Nombres de tablas y columnas en `snake_case` (`folio_registro`, `id_tipo_participante`); el dominio usa camelCase y la traducción vive en `src/infrastructure/mappers/*`.
- Cliente: singleton `src/infrastructure/database/client.ts` (`mariadb` Pool → `PrismaMariaDb` adapter, caché en `globalThis`). `DATABASE_URL` para runtime, `DIRECT_URL` para Prisma CLI/migraciones.
- Migraciones en `prisma/migrations/`, con nombre `YYYYMMDD[_descriptivo]`. Al tocar `schema.prisma`: generar la migración SQL y correr `npx prisma generate`.
- Generación de folios: `PrismaFolioGenerator` usa tabla `folios_contador` con `AUTO_INCREMENT` para generar folios únicos `ANI26-XXXX` (sustituye la secuencia PostgreSQL).
- Fechas: `@db.DateTime(6)` en lugar de `@db.Timestamp(6)` para evitar el límite 2038 y conversiones por zona horaria. Conexión en UTC (`timezone: 'Z'`).
- Collations: `utf8mb4_0900_ai_ci` por defecto (case-insensitive). Columnas de seguridad (`token`, `auth_id`, `codigo_barras`) usan `utf8mb4_bin` (case-sensitive).
- Atomicidad: operaciones multi-tabla vía `getTransactionManager()` (`ITransactionManager` / `PrismaTransactionManager`). Si se sube un archivo antes de la transacción, compensar con `storage.eliminar` en el `catch`.
- Cupos de actividades con bloqueo pesimista (`SELECT … FOR UPDATE`) y aislamiento `ReadCommitted` en `PrismaInscripcionActividadRepository`.
- Errores Prisma → dominio con `src/infrastructure/errors/prismaErrorMapper.ts` (`mapPrismaError`, cubre `P2002/P2003/P2024/P2025/P2034`).
- Shadow DB: `SHADOW_DATABASE_URL` requerida para `prisma migrate dev` (crea/destruye la base sombra).

---

## Autenticación y seguridad

- NextAuth v5 con proveedor Credentials: se autentica con **`folioRegistro` + password** contra la tabla `accesos` (bcrypt). Roles `USER` | `ADMIN` (`enum Rol` en Prisma).
- `src/proxy.ts` (middleware) protege `/cpanel` (requiere ADMIN), `/perfil`, `/actividades` y redirige `/login` y `/registro` si ya hay sesión.
- **Toda** Server Action de `/cpanel` debe empezar con `await requireAdmin()`; las de usuario autenticado con `await requireUser()` (`src/shared/auth/requireAdmin.ts`). El middleware no sustituye al guard.
- Contraseñas generadas solo con `generateSecurePassword` / `generateSecurePasswordAlnum` (`src/shared/security/password.ts`). Prohibido `Math.random()` para cualquier valor de seguridad (folios, tokens, contraseñas).
- No loguear contraseñas en claro ni secretos. Hashing abstraído tras `IPasswordHasher`; IDs tras `IIdGenerator`.
- Archivos privados se sirven por `src/app/api/archivos/[...path]/route.ts` con URL firmada (`exp` + `sig`, `STORAGE_URL_SECRET`) y normalización de ruta contra path traversal. Nunca exponer `storage/` directamente.

---

## Almacenamiento y correo

- `STORAGE_PROVIDER=filesystem` (default) → `LocalFilesystemStorageService` sobre `./storage/{comprobantes,constancias}`. `supabase` → `SupabaseStorageService` (legacy, solo transición). Todo acceso vía `IStorageService` / `getStorageService()`.
- Comprobantes: png/jpeg/pdf, máx. 5 MB (`src/core/value-objects/ArchivoComprobante.ts`).
- Correo: `NodemailerEmailService` (Gmail SMTP, `GMAIL_USER` / `GMAIL_APP_PASSWORD` / `EMAIL_FROM`); plantillas HTML en `src/infrastructure/services/email/templates/`.
- PDF: `ReactPdfService` + plantillas en `src/infrastructure/services/pdf/templates/`.

---

## Documentación de referencia

- `docs/DESIGN.md` — arquitectura, modelo de dominio, puertos, ADRs (fuente principal).
- `docs/PROGRESS.md` y `docs/PLAN_CORRECION.md` — estado de tareas P0/P1/P2 y pendientes conocidos.
- `docs/AUDITORIA.md`, `docs/AUDITORIA_04.09.2026.md` — hallazgos de seguridad/BD.
- `PLAN_DESPLIEGUE.md` — despliegue en VPS Linux (MySQL 8.x nativo + filesystem, systemd + nginx, sin Docker).
- `docs/PLAN_MIGRACION_MYSQL.md` — detalle de la migración PostgreSQL → MySQL.

Idioma de documentación, commits y mensajes de error: **español**. Commits en formato conventional (`feat:`, `fix:`, `docs:`, `chore:`). No commitear sin que se pida explícitamente.
