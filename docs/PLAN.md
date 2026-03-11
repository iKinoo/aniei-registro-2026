# PLAN — Plan de Construcción del Sistema de Registro ANIEI 2026

> **Documento complementario a:** [DESIGN.md](DESIGN.md)  
> **Objetivo:** Definir el orden de implementación, dependencias entre módulos, archivos a crear por fase, y guías de configuración de infraestructura.  
> **Infraestructura elegida:** Supabase (BD + Storage) · Resend (correos) · @react-pdf/renderer (PDFs simples)

---

## Tabla de Contenidos

1. [Visión General del Plan](#1-visión-general-del-plan)
2. [Infraestructura y Servicios Externos](#2-infraestructura-y-servicios-externos)
3. [Dependencias npm](#3-dependencias-npm)
4. [Variables de Entorno](#4-variables-de-entorno)
5. [Fase 0 — Scaffolding del Proyecto](#5-fase-0--scaffolding-del-proyecto)
6. [Fase 1 — Capa de Dominio](#6-fase-1--capa-de-dominio)
7. [Fase 2 — Capa de Aplicación (Puertos + DTOs)](#7-fase-2--capa-de-aplicación-puertos--dtos)
8. [Fase 3 — Infraestructura: Base de Datos](#8-fase-3--infraestructura-base-de-datos)
9. [Fase 4 — Infraestructura: Storage y Email](#9-fase-4--infraestructura-storage-y-email)
10. [Fase 5 — Infraestructura: PDF](#10-fase-5--infraestructura-pdf)
11. [Fase 6 — DI Container](#11-fase-6--di-container)
12. [Fase 7 — Use Cases](#12-fase-7--use-cases)
13. [Fase 8 — Presentación: Registro Individual](#13-fase-8--presentación-registro-individual)
14. [Fase 9 — Presentación: Registro Grupal](#14-fase-9--presentación-registro-grupal)
15. [Fase 10 — Página de Confirmación y Constancia](#15-fase-10--página-de-confirmación-y-constancia)
16. [Diagrama de Dependencias entre Fases](#16-diagrama-de-dependencias-entre-fases)
17. [Checklist Completo de Archivos](#17-checklist-completo-de-archivos)
18. [Guía de Configuración: Supabase](#18-guía-de-configuración-supabase)
19. [Guía de Configuración: Resend](#19-guía-de-configuración-resend)
20. [Guía de Configuración: Despliegue en Vercel](#20-guía-de-configuración-despliegue-en-vercel)

---

## 1. Visión General del Plan

### Principio de Construcción

Se construye **de adentro hacia afuera**, siguiendo la dirección de dependencias de Clean Architecture:

```
Dominio (0 deps) → Aplicación (depende de dominio) → Infraestructura (implementa puertos) → Presentación (usa todo)
```

### Resumen de Fases

```mermaid
gantt
    title Plan de Construcción — ANIEI 2026
    dateFormat X
    axisFormat %s

    section Preparación
    Fase 0 · Scaffolding     :f0, 0, 1

    section Capas Internas
    Fase 1 · Dominio          :f1, 1, 2
    Fase 2 · Aplicación       :f2, 2, 3

    section Infraestructura
    Fase 3 · Base de Datos    :f3, 3, 4
    Fase 4 · Storage + Email  :f4, 3, 4
    Fase 5 · PDF              :f5, 3, 4
    Fase 6 · DI Container     :f6, 4, 5

    section Lógica de Negocio
    Fase 7 · Use Cases        :f7, 5, 6

    section Presentación
    Fase 8 · Registro Indiv.  :f8, 6, 7
    Fase 9 · Registro Grupal  :f9, 7, 8
    Fase 10 · Confirm/Const.  :f10, 7, 8
```

### Reglas del Plan

1. **No escribir la capa N+1 sin que la capa N esté terminada y probada** (excepto Fases 3-5 que son paralelas entre sí).
2. **Cada fase produce archivos concretos** que se listan al detalle.
3. **Las pruebas del dominio y use cases no requieren infraestructura** (se podrían testear con mocks).
4. **La UI es lo último** porque depende de todo lo anterior.

---

## 2. Infraestructura y Servicios Externos

| Servicio | Proveedor | Uso | Plan |
|----------|-----------|-----|------|
| **Base de datos** | Supabase (PostgreSQL) | Almacenar usuarios, comprobantes, catálogos, facturaciones | Free tier o Pro |
| **Almacenamiento de archivos** | Supabase Storage | Comprobantes de pago (img/PDF) + constancias PDF generadas | Mismo proyecto Supabase |
| **Correo electrónico** | Resend | Confirmación de registro + envío de constancia PDF | Free tier (100 emails/día) |
| **PDF** | @react-pdf/renderer | Constancias simples (tablas básicas, sin diseño elaborado) | Librería local, sin servicio externo |
| **Hosting** | Vercel | Despliegue del proyecto Next.js | Free tier o Pro |

### Diagrama de Servicios

```mermaid
graph LR
    subgraph Vercel["Vercel (Next.js App)"]
        APP["App Next.js 15"]
    end

    subgraph Supabase["Supabase (Proyecto)"]
        DB[("PostgreSQL 17")]
        STORE["Supabase Storage<br/>📁 comprobantes/<br/>📁 constancias/"]
    end

    subgraph Resend["Resend"]
        MAIL["API de Correo"]
    end

    APP -->|"Prisma (DATABASE_URL)"| DB
    APP -->|"@supabase/supabase-js"| STORE
    APP -->|"resend SDK"| MAIL

    MAIL -->|"📧 Confirmación<br/>+ constancia PDF"| USER["👤 Usuario"]
    USER -->|"📝 Formulario<br/>+ 📎 comprobante"| APP
```

---

## 3. Dependencias npm

### Dependencias de producción

```bash
# Framework
next@15                    # App Router + Server Actions
react@19                   # React 19
react-dom@19               # React DOM

# ORM
prisma                     # CLI de Prisma (puede ir en devDeps)
@prisma/client             # Cliente generado

# Validación (capa de presentación)
zod                        # Validación de formularios en Server Actions

# Infraestructura: Supabase Storage
@supabase/supabase-js      # Cliente Supabase (solo para Storage)

# Infraestructura: Email
resend                     # SDK de Resend

# Infraestructura: PDF
@react-pdf/renderer        # Generación de PDF server-side
```

### Dependencias de desarrollo

```bash
typescript
@types/react
@types/node
eslint
eslint-config-next
tailwindcss                # Para estilos de la UI
@tailwindcss/postcss
```

### Instalación

```bash
# Crear proyecto
npx create-next-app@latest aniei-registro --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

cd aniei-registro

# Producción
npm install @prisma/client zod @supabase/supabase-js resend @react-pdf/renderer

# Desarrollo
npm install -D prisma

# Inicializar Prisma
npx prisma init --datasource-provider postgresql
```

---

## 4. Variables de Entorno

Archivo `.env.local` (nunca se commitea):

```env
# ── Supabase: Base de Datos ──
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ── Supabase: Storage ──
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# ── Resend: Email ──
RESEND_API_KEY="re_..."
EMAIL_FROM="ANIEI 2026 <registro@tudominio.com>"

# ── Feature Flags ──
ENABLE_GROUP_REGISTRATION="true"

# ── App ──
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 5. Fase 0 — Scaffolding del Proyecto

### Objetivo
Crear la estructura de carpetas vacía y configurar las herramientas base.

### Prerequisitos
- Node.js 20+
- npm / pnpm
- Cuenta de Supabase creada (ver [Guía §18](#18-guía-de-configuración-supabase))
- Cuenta de Resend creada (ver [Guía §19](#19-guía-de-configuración-resend))

### Tareas

| # | Tarea | Detalle |
|---|-------|---------|
| 0.1 | Crear proyecto Next.js | `npx create-next-app@latest` con las opciones indicadas en §3 |
| 0.2 | Instalar dependencias | Todas las listadas en §3 |
| 0.3 | Configurar path aliases | Verificar que `@/*` apunte a `./src/*` en `tsconfig.json` |
| 0.4 | Crear estructura de carpetas | Crear los directorios vacíos de todas las capas (ver abajo) |
| 0.5 | Crear `.env.local` | Con las variables listadas en §4 (valores reales de Supabase y Resend) |
| 0.6 | Inicializar Prisma | `npx prisma init`, apuntar a la `DATABASE_URL` de Supabase |
| 0.7 | Verificar conexión | `npx prisma db pull` para validar que Prisma se conecta a Supabase |

### Estructura de carpetas a crear

```bash
mkdir -p src/core/{entities,value-objects,errors,enums}
mkdir -p src/application/{ports,use-cases,dtos}
mkdir -p src/infrastructure/{database/prisma,mappers,repositories,services/{email,pdf,storage},config}
mkdir -p src/shared/{types,validation,constants}
mkdir -p src/app/registro/{components,actions}
mkdir -p src/app/confirmacion
mkdir -p src/app/constancia/\[folio\]
```

### Archivos de esta fase

| Archivo | Propósito |
|---------|-----------|
| `src/infrastructure/database/prisma/schema.prisma` | Esquema Prisma (se escribe en Fase 3) |
| `src/infrastructure/database/client.ts` | Placeholder — se implementa en Fase 3 |
| `.env.local` | Variables de entorno |
| `tsconfig.json` | Path alias `@/*` verificado |

### Resultado
Un proyecto Next.js limpio que compila (`npm run dev`), con la estructura de carpetas lista y Prisma conectado a Supabase.

---

## 6. Fase 1 — Capa de Dominio

### Objetivo
Escribir todas las entidades, value objects, errores y enums del dominio. **Cero dependencias externas**, solo TypeScript puro.

### Prerequisitos
- Fase 0 completada.

### Orden de escritura

Las dependencias internas del dominio definen el orden: primero lo que no depende de nada, luego lo que compone.

```mermaid
graph TD
    A["1. Enums<br/>Genero.ts"] --> E["4. Entities"]
    B["2. Value Objects<br/>Email, Telefono, Monto<br/>FolioRecibo, CodigoBarras<br/>ArchivoComprobante"] --> E
    C["3. Domain Errors<br/>RegistroError, ComprobanteError<br/>GrupoRegistroError"] --> E
    E --> E1["Usuario.ts"]
    E --> E2["ComprobantePago.ts"]
    E --> E3["Facturacion.ts"]
    E1 --> F["5. GrupoRegistro.ts<br/>(depende de Usuario)"]
```

### Archivos a crear

#### 1. Enums (sin dependencias)

| Archivo | Contenido |
|---------|-----------|
| `src/core/enums/Genero.ts` | Enum `Genero { MASCULINO = 'M', FEMENINO = 'F', OTRO = 'O' }` |

#### 2. Value Objects (sin dependencias)

| Archivo | Validaciones principales |
|---------|--------------------------|
| `src/core/value-objects/Email.ts` | Formato email válido, trimmed, lowercase |
| `src/core/value-objects/Telefono.ts` | Número, lada opcional, extensión opcional |
| `src/core/value-objects/FolioRecibo.ts` | Formato de folio (alfanumérico, longitud) |
| `src/core/value-objects/CodigoBarras.ts` | Formato de código de barras |
| `src/core/value-objects/Monto.ts` | Número positivo, máximo 2 decimales |
| `src/core/value-objects/ArchivoComprobante.ts` | MIME permitido (image/png, image/jpeg, application/pdf), tamaño máximo |

#### 3. Domain Errors (sin dependencias)

| Archivo | Errores que contiene |
|---------|----------------------|
| `src/core/errors/RegistroError.ts` | `CORREO_DUPLICADO`, `DATOS_INVALIDOS` |
| `src/core/errors/ComprobanteError.ts` | `TIPO_NO_PERMITIDO`, `TAMANIO_EXCEDIDO`, `ARCHIVO_REQUERIDO` |
| `src/core/errors/GrupoRegistroError.ts` | `MIEMBRO_CORREO_DUPLICADO`, `GRUPO_VACIO`, `RESPONSABLE_NO_ENCONTRADO` |

#### 4. Entities (dependen de VOs + Enums + Errors)

| Archivo | Depende de |
|---------|------------|
| `src/core/entities/Usuario.ts` | Email, Telefono, FolioRecibo, CodigoBarras, Genero |
| `src/core/entities/ComprobantePago.ts` | ArchivoComprobante, Monto |
| `src/core/entities/Facturacion.ts` | (solo tipos primitivos + id) |

#### 5. GrupoRegistro (depende de Usuario)

| Archivo | Depende de |
|---------|------------|
| `src/core/entities/GrupoRegistro.ts` | Usuario, Email, Genero, GrupoRegistroError |

### Catálogos (tipos de solo lectura)

| Archivo | Contenido |
|---------|-----------|
| `src/shared/types/catalogos.ts` | Interfaces `Cargo`, `Estado`, `Institucion`, `TipoUsuario`, `Titulo` |

### Criterio de completitud
- Cada entidad tiene un factory method `static create()` que valida y retorna o lanza un error de dominio.
- Cada Value Object es inmutable y valida en su constructor.
- No hay `import` de ningún paquete externo en ningún archivo de `src/core/`.

---

## 7. Fase 2 — Capa de Aplicación (Puertos + DTOs)

### Objetivo
Definir las interfaces (puertos) que la infraestructura debe implementar y los DTOs que cruzan las fronteras de la aplicación.

### Prerequisitos
- Fase 1 completada (se importan entidades y VOs del dominio para tipar los puertos).

### Archivos a crear

#### Puertos (Interfaces)

| Archivo | Métodos |
|---------|---------|
| `src/application/ports/IUsuarioRepository.ts` | `crear`, `crearMuchos`, `buscarPorCorreo`, `buscarPorId`, `buscarPorFolio`, `verificar` |
| `src/application/ports/IComprobantePagoRepository.ts` | `crear`, `buscarPorUsuario` |
| `src/application/ports/IFacturacionRepository.ts` | `crear`, `buscarPorUsuario` |
| `src/application/ports/ICatalogoRepository.ts` | `obtenerCargos`, `obtenerEstados`, `obtenerInstituciones`, `obtenerTiposUsuario` |
| `src/application/ports/IEmailService.ts` | `enviarConfirmacionRegistro`, `enviarConstancia` |
| `src/application/ports/IPdfService.ts` | `generarConstanciaInscripcion` |
| `src/application/ports/IStorageService.ts` | `subir`, `obtenerUrl`, `eliminar` |

#### DTOs

| Archivo | Campos |
|---------|--------|
| `src/application/dtos/RegistroUsuarioDTO.ts` | Todos los campos del formulario individual + archivo comprobante (Buffer + metadata) |
| `src/application/dtos/RegistroGrupoDTO.ts` | Datos responsable + array de `MiembroInput` (con `idTipoUsuario` individual) + archivo comprobante |
| `src/application/dtos/FacturacionDTO.ts` | Datos fiscales |
| `src/application/dtos/ResultadoRegistro.ts` | `success`, `folio`, `urlConstancia`, `correo` |
| `src/application/dtos/ResultadoRegistroGrupo.ts` | `success`, `totalRegistrados`, `costoTotal`, `folios[]` |

### Criterio de completitud
- Los puertos solo importan tipos del dominio (`core/`) o DTOs propios.
- Los DTOs son tipos planos (interfaces o types), sin lógica.
- Los Use Cases aún no se escriben (Fase 7) — primero se necesita infraestructura.

---

## 8. Fase 3 — Infraestructura: Base de Datos

### Objetivo
Configurar Prisma contra Supabase, definir el schema, generar el cliente, crear los Data Mappers y los repositorios.

### Prerequisitos
- Fase 2 completada (puertos definidos).
- Supabase proyecto creado con la BD exportada (ver [Guía §18](#18-guía-de-configuración-supabase)).

### Tareas en orden

| # | Tarea | Detalle |
|---|-------|---------|
| 3.1 | Escribir `schema.prisma` | Modelar las tablas del SQL (`aniei2026.sql`) en esquema Prisma. Usar `db pull` para introspectar si ya creaste las tablas en Supabase, o `db push` para crearlas desde el schema. |
| 3.2 | Generar Prisma Client | `npx prisma generate` |
| 3.3 | Crear singleton PrismaClient | `src/infrastructure/database/client.ts` |
| 3.4 | Crear Data Mappers | Uno por entidad de dominio |
| 3.5 | Crear Repositorios | Implementan puertos usando Prisma + Mappers |
| 3.6 | Verificar | Probar queries básicas para confirmar que la conexión y el mapping funcionan |

### Archivos a crear

#### schema.prisma

| Archivo | Notas |
|---------|-------|
| `src/infrastructure/database/prisma/schema.prisma` | Debe mapear las tablas: `usuarios`, `comprobantes_pago`, `facturaciones`, `cargos`, `estados`, `instituciones`, `tipo_usuario`, `titulos`. Configurar `datasource` con `DATABASE_URL` y `DIRECT_URL` para Supabase pooler. |

Configuración especial para Supabase:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")       // pooler (port 6543)
  directUrl = env("DIRECT_URL")         // directo (port 5432, para migraciones)
}
```

#### PrismaClient Singleton

| Archivo | Notas |
|---------|-------|
| `src/infrastructure/database/client.ts` | Patrón singleton para evitar múltiples instancias en desarrollo con hot reload |

#### Data Mappers (3 archivos)

| Archivo | Transforma |
|---------|-----------|
| `src/infrastructure/mappers/UsuarioMapper.ts` | `PrismaUsuario ↔ Usuario` (con VOs: Email, Telefono, etc.) |
| `src/infrastructure/mappers/ComprobantePagoMapper.ts` | `PrismaComprobante ↔ ComprobantePago` (con VOs: ArchivoComprobante, Monto) |
| `src/infrastructure/mappers/FacturacionMapper.ts` | `PrismaFacturacion ↔ Facturacion` |

#### Repositorios (4 archivos)

| Archivo | Implementa | Métodos clave |
|---------|-----------|---------------|
| `src/infrastructure/repositories/PrismaUsuarioRepository.ts` | `IUsuarioRepository` | `crear`, `crearMuchos`, `buscarPorCorreo`, `buscarPorId`, `verificar` |
| `src/infrastructure/repositories/PrismaComprobantePagoRepository.ts` | `IComprobantePagoRepository` | `crear`, `buscarPorUsuario` |
| `src/infrastructure/repositories/PrismaFacturacionRepository.ts` | `IFacturacionRepository` | `crear`, `buscarPorUsuario` |
| `src/infrastructure/repositories/PrismaCatalogoRepository.ts` | `ICatalogoRepository` | `obtenerCargos`, `obtenerEstados`, `obtenerInstituciones`, `obtenerTiposUsuario` |

### Seed de datos
El seed de catálogos (`cargos`, `estados`, `instituciones`, `tipo_usuario`, `titulos`, `tipo_actividad`) se ejecuta directamente contra Supabase usando el SQL Editor o un script:

```bash
# Opción A: Desde el SQL Editor de Supabase
# Copiar y ejecutar el contenido de db/seed_aniei2026.sql

# Opción B: Con psql local
psql "$DIRECT_URL" < db/seed_aniei2026.sql
```

### Criterio de completitud
- `npx prisma generate` sin errores.
- Los repositorios compilan e implementan todas las firmas de los puertos.
- Un test manual de `buscarPorCorreo` o `obtenerCargos` retorna datos correctamente.

---

## 9. Fase 4 — Infraestructura: Storage y Email

### Objetivo
Implementar los adaptadores de Supabase Storage y Resend Email.

### Prerequisitos
- Fase 2 completada (puertos `IStorageService`, `IEmailService` definidos).
- Supabase Storage configurado (ver [Guía §18](#18-guía-de-configuración-supabase)).
- Resend configurado (ver [Guía §19](#19-guía-de-configuración-resend)).

> **Nota:** Esta fase es **paralela** a las Fases 3 y 5. No depende de los repositorios.

### Archivos a crear

#### Storage

| Archivo | Notas |
|---------|-------|
| `src/infrastructure/services/storage/SupabaseStorageService.ts` | Implementa `IStorageService`. Usa `@supabase/supabase-js` con la `SERVICE_ROLE_KEY`. Sube archivos a los buckets `comprobantes` y `constancias`. |

Métodos:
- `subir(ruta, buffer, mime)` → sube al bucket correspondiente, retorna la URL pública o signed URL.
- `obtenerUrl(ruta)` → genera URL pública de un archivo existente.
- `eliminar(ruta)` → elimina un archivo del bucket.

#### Email

| Archivo | Notas |
|---------|-------|
| `src/infrastructure/services/email/ResendEmailService.ts` | Implementa `IEmailService`. Usa el SDK `resend`. Templates de correo como HTML básico con tablas (nada elaborado). |

Métodos:
- `enviarConfirmacionRegistro(destinatario, datos)` → correo de confirmación con datos de inscripción en tabla HTML simple.
- `enviarConstancia(destinatario, pdfBuffer)` → correo con el PDF adjunto.

#### Templates de correo (inline)

Los templates de correo serán **funciones TypeScript** que retornan un string HTML. Se guardan junto al servicio de email para mantenerlos colocalizados:

| Archivo | Contenido |
|---------|-----------|
| `src/infrastructure/services/email/templates/confirmacion.ts` | Función `renderConfirmacionHTML(datos)` → retorna HTML con tabla simple: nombre, folio, institución, fecha |
| `src/infrastructure/services/email/templates/constancia.ts` | Función `renderConstanciaEmailHTML(datos)` → retorna HTML del cuerpo del correo que acompaña al PDF adjunto |

**Filosofía de templates:** HTML básico con tablas (`<table>`), sin CSS complejo ni frameworks de email. Prioridad = que funcione y sea legible, no que sea bonito.

```html
<!-- Ejemplo conceptual del template de confirmación -->
<table style="max-width:600px;margin:0 auto;font-family:sans-serif">
  <tr><td colspan="2" style="..."><h2>Registro Confirmado — ANIEI 2026</h2></td></tr>
  <tr><td>Nombre:</td><td>{{nombre}} {{apellido}}</td></tr>
  <tr><td>Folio:</td><td>{{folio}}</td></tr>
  <tr><td>Institución:</td><td>{{institucion}}</td></tr>
  <tr><td>Fecha:</td><td>{{fecha}}</td></tr>
</table>
```

### Criterio de completitud
- Se puede subir un archivo de prueba a Supabase Storage y obtener su URL.
- Se puede enviar un correo de prueba con Resend con HTML y archivo adjunto.

---

## 10. Fase 5 — Infraestructura: PDF

### Objetivo
Implementar el adaptador de generación de PDF para constancias.

### Prerequisitos
- Fase 2 completada (puerto `IPdfService` definido).

> **Nota:** Esta fase es **paralela** a las Fases 3 y 4. No depende de repositorios ni de otros servicios.

### Archivos a crear

| Archivo | Notas |
|---------|-------|
| `src/infrastructure/services/pdf/ReactPdfService.ts` | Implementa `IPdfService`. Usa `@react-pdf/renderer` para generar el PDF en memoria (Buffer). |
| `src/infrastructure/services/pdf/templates/ConstanciaTemplate.tsx` | Componente React PDF que define el layout de la constancia: tabla simple con datos del asistente, folio, evento, fecha. |

### Diseño del PDF

La constancia es un documento simple:

```
┌──────────────────────────────────────────┐
│         CONSTANCIA DE INSCRIPCIÓN        │
│            ANIEI 2026                    │
│                                          │
│  Nombre:       Juan Pérez López          │
│  Folio:        ANIEI-2026-0001           │
│  Institución:  IT Morelia                │
│  Tipo:         Alumno                    │
│  Fecha:        15 de marzo de 2026       │
│                                          │
│  Se hace constar que el portador se      │
│  encuentra inscrito al congreso...       │
│                                          │
└──────────────────────────────────────────┘
```

**Sin logos, imágenes ni diseño elaborado** por ahora. Solo texto y estructura clara con `@react-pdf/renderer`.

### Criterio de completitud
- Se puede generar un Buffer PDF en Node.js con datos de ejemplo.
- El PDF se puede abrir y contiene los datos correctos.

---

## 11. Fase 6 — DI Container

### Objetivo
Crear la factory que ensambla todos los adaptadores y los expone como funciones simples.

### Prerequisitos
- Fases 3, 4 y 5 completadas (todos los adaptadores listos).

### Archivos a crear

| Archivo | Notas |
|---------|-------|
| `src/infrastructure/config/container.ts` | Factory functions que instancian e inyectan dependencias. Lee variables de entorno para decidir adaptadores (aunque inicialmente solo hay uno por tipo). |

### Funciones del Container

```
container.ts
├── getUsuarioRepository()           → PrismaUsuarioRepository(prisma)
├── getComprobantePagoRepository()   → PrismaComprobantePagoRepository(prisma)
├── getFacturacionRepository()       → PrismaFacturacionRepository(prisma)
├── getCatalogoRepository()          → PrismaCatalogoRepository(prisma)
├── getEmailService()                → ResendEmailService(RESEND_API_KEY)
├── getPdfService()                  → ReactPdfService()
└── getStorageService()              → SupabaseStorageService(SUPABASE_URL, SUPABASE_KEY)
```

### Criterio de completitud
- Cada `get*()` retorna una instancia que implementa el puerto correcto.
- No hay imports directos de adaptadores fuera de este archivo y de los Server Actions.

---

## 12. Fase 7 — Use Cases

### Objetivo
Escribir los casos de uso que orquestan la lógica de negocio usando puertos inyectados.

### Prerequisitos
- Fase 6 completada (container listo). Aunque los use cases dependen solo de puertos (interfaces), necesitamos poder probarlos end-to-end.

### Orden de escritura

Los use cases se construyen en orden de complejidad y dependencia:

```mermaid
graph TD
    UC1["1. RegistrarUsuario<br/>(flujo principal)"] 
    UC2["2. EnviarConfirmacion<br/>(se usa dentro de UC1)"]
    UC3["3. GenerarConstancia<br/>(se usa dentro de UC1)"]
    UC4["4. RegistrarGrupo<br/>(extiende lógica de UC1)"]
    UC5["5. SolicitarFacturacion<br/>(independiente)"]

    UC2 --> UC1
    UC3 --> UC1
    UC1 --> UC4
```

### Archivos a crear

| # | Archivo | Puertos que inyecta | Lógica principal |
|---|---------|---------------------|------------------|
| 1 | `src/application/use-cases/RegistrarUsuario.ts` | `IUsuarioRepository`, `IComprobantePagoRepository`, `IStorageService`, `IEmailService`, `IPdfService` | Verificar correo → subir comprobante → crear usuario → crear comprobante → generar PDF → enviar correo |
| 2 | `src/application/use-cases/EnviarConfirmacion.ts` | `IEmailService`, `IUsuarioRepository` | Buscar usuario → enviar correo confirmación |
| 3 | `src/application/use-cases/GenerarConstancia.ts` | `IPdfService`, `IStorageService`, `IUsuarioRepository` | Buscar usuario → generar PDF → subir a storage → retornar URL |
| 4 | `src/application/use-cases/RegistrarGrupo.ts` | `IUsuarioRepository`, `IComprobantePagoRepository`, `IStorageService`, `IEmailService`, `IPdfService` | Verificar responsable (existente o nuevo) → verificar correos de miembros → subir comprobante → crear GrupoRegistro → persistir nuevos → generar constancias → enviar correos |
| 5 | `src/application/use-cases/SolicitarFacturacion.ts` | `IFacturacionRepository`, `IUsuarioRepository` | Verificar usuario existe → crear facturación |

### Detalle: RegistrarUsuario

```
execute(dto: RegistroUsuarioDTO):
  1. correoExistente = await usuarioRepo.buscarPorCorreo(dto.correo)
     → si existe: throw RegistroError.CORREO_DUPLICADO
  2. archivoVO = ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio)
  3. urlComprobante = await storageService.subir("comprobantes/{uuid}.{ext}", dto.archivo.buffer, dto.archivo.mime)
  4. usuario = Usuario.create({ ...dto })
  5. usuarioPersistido = await usuarioRepo.crear(usuario)
  6. comprobante = ComprobantePago.create({ idUsuario: usuarioPersistido.id, url: urlComprobante, ... })
  7. await comprobanteRepo.crear(comprobante)
  8. pdfBuffer = await pdfService.generarConstanciaInscripcion({ ...datos })
  9. urlConstancia = await storageService.subir("constancias/{folio}.pdf", pdfBuffer, "application/pdf")
 10. await emailService.enviarConfirmacionRegistro(dto.correo, { nombre, folio, ... })
 11. await emailService.enviarConstancia(dto.correo, pdfBuffer)
 12. return { success: true, folio, urlConstancia }
```

### Detalle: RegistrarGrupo

```
execute(dto: RegistroGrupoDTO):
  1. responsableExistente = await usuarioRepo.buscarPorCorreo(dto.responsable.correo)
  2. for each miembro in dto.miembros:
       existente = await usuarioRepo.buscarPorCorreo(miembro.correo)
       → si existe: throw GrupoRegistroError.MIEMBRO_CORREO_DUPLICADO
  3. archivoVO = ArchivoComprobante.create(...)
  4. urlComprobante = await storageService.subir("comprobantes/{uuid}.{ext}", ...)
  5. grupo = GrupoRegistro.create(responsable, dto.miembros, !!responsableExistente)
     → hereda id_institucion, id_entidad_federativa
     → NO hereda id_tipo_usuario (cada miembro trae el suyo)
  6. nuevosUsuarios = grupo.obtenerNuevosRegistros()
  7. persistidos = await usuarioRepo.crearMuchos(nuevosUsuarios)
  8. idResponsable = responsableExistente?.id ?? persistidos[0].id
  9. comprobante = ComprobantePago.create({ idUsuario: idResponsable, esGrupal: true, ... })
 10. await comprobanteRepo.crear(comprobante)
 11. for each usuario in persistidos:
       pdfBuffer = await pdfService.generarConstanciaInscripcion(...)
       await storageService.subir("constancias/{folio}.pdf", ...)
       await emailService.enviarConstancia(usuario.correo, pdfBuffer)
 12. await emailService.enviarConfirmacionRegistro(dto.responsable.correo, datosGrupo)
 13. return { success: true, totalRegistrados, folios[] }
```

### Criterio de completitud
- Cada use case se puede instanciar con el container y ejecutar end-to-end.
- `RegistrarUsuario` crea un usuario en Supabase, sube un comprobante, genera un PDF, y envía un correo.
- Los errores de dominio se lanzan correctamente (correo duplicado, archivo inválido).

---

## 13. Fase 8 — Presentación: Registro Individual

### Objetivo
Crear la página de registro individual: formulario, validación Zod, Server Action.

### Prerequisitos
- Fase 7 completada (use case `RegistrarUsuario` funcional).

### Archivos a crear

#### Schemas de validación (Zod)

| Archivo | Valida |
|---------|--------|
| `src/shared/validation/registro.schema.ts` | Campos del formulario individual: nombre, apellido, correo, teléfono, género, carrera, dependencia, id_cargo, id_tipo_usuario, id_institucion, id_entidad_federativa, archivo comprobante (tipo, tamaño) |

#### Server Action

| Archivo | Notas |
|---------|-------|
| `src/app/registro/actions/registrar-usuario.action.ts` | `"use server"`. Recibe FormData → valida con Zod → instancia Use Case con container → ejecuta → retorna resultado. |

#### Componentes UI

| Archivo | Tipo | Notas |
|---------|------|-------|
| `src/app/registro/page.tsx` | Server Component | Carga catálogos (cargos, estados, instituciones, tipos usuario) del repositorio y los pasa al formulario. Muestra opción individual/grupal si feature flag activo. |
| `src/app/registro/components/RegistroForm.tsx` | Client Component | Formulario completo con todos los campos, upload de archivo, feedback de errores. Llama al Server Action con `useActionState` o form action. |
| `src/app/registro/components/CampoArchivo.tsx` | Client Component | Input de archivo con preview y validación client-side de tipo/tamaño. |
| `src/app/registro/components/SelectCatalogo.tsx` | Client Component | Select reutilizable para catálogos (cargos, estados, instituciones, tipo_usuario). |

### Flujo de la página

```
/registro (page.tsx - Server Component)
  │
  ├── Carga catálogos: getCatalogoRepository().obtenerCargos(), ...
  │
  └── Renderiza <RegistroForm catalogos={...} />
        │
        ├── Campos: nombre, apellido, correo, teléfono, ...
        ├── Selects: cargo, tipo_usuario, institución, estado
        ├── Upload: comprobante de pago
        │
        └── Submit → registrarUsuarioAction(formData)
              │
              ├── Validación Zod
              ├── Instancia RegistrarUsuario (container)
              ├── execute(dto)
              └── Retorna { success, folio } o { errors }
```

### Criterio de completitud
- El formulario se renderiza con los catálogos cargados dinámicamente de Supabase.
- Se puede completar un registro individual end-to-end: formulario → base de datos → comprobante en storage → PDF generado → correo enviado.
- Los errores de validación se muestran en el formulario.

---

## 14. Fase 9 — Presentación: Registro Grupal

### Objetivo
Agregar la UI y el Server Action del registro grupal, condicional a la feature flag.

### Prerequisitos
- Fase 8 completada (registro individual funcionando).
- Use case `RegistrarGrupo` (Fase 7) funcional.

### Archivos a crear

#### Schema de validación

| Archivo | Valida |
|---------|--------|
| `src/shared/validation/grupo.schema.ts` | Datos del responsable + array de miembros (cada uno con: nombre, apellido, correo, género, carrera, id_tipo_usuario) + archivo comprobante |

#### Server Action

| Archivo | Notas |
|---------|-------|
| `src/app/registro/actions/registrar-grupo.action.ts` | `"use server"`. Recibe FormData → valida con Zod → instancia `RegistrarGrupo` con container → ejecuta → retorna resultado. |

#### Componentes UI

| Archivo | Tipo | Notas |
|---------|------|-------|
| `src/app/registro/components/GrupoForm.tsx` | Client Component | Formulario de responsable + formulario dinámico para agregar/eliminar miembros. Cada miembro tiene su propio selector de `tipo_usuario`. Muestra costo total calculado. |
| `src/app/registro/components/MiembroRow.tsx` | Client Component | Fila de formulario para un miembro individual: nombre, apellido, correo, género, carrera, tipo_usuario. Con botón de eliminar. |

#### Modificaciones a archivos existentes

| Archivo | Cambio |
|---------|--------|
| `src/app/registro/page.tsx` | Agregar lógica condicional: si `ENABLE_GROUP_REGISTRATION=true`, mostrar tabs o selector para elegir entre Individual y Grupal. |

### Lógica del formulario grupal

```
<GrupoForm>
  ├── Datos del responsable (mismo form que individual)
  ├── Sección "Miembros del grupo":
  │   ├── <MiembroRow> nombre, apellido, correo, género, carrera, tipo_usuario
  │   ├── <MiembroRow> ...
  │   ├── [+ Agregar miembro]
  │   └── Feedback: "Costo total: $X × N miembros = $Total"
  ├── Upload: comprobante grupal
  └── Submit → registrarGrupoAction(formData)
```

### Criterio de completitud
- Un usuario ya registrado puede entrar al formulario grupal, ingresar su correo como responsable, y registrar N miembros nuevos sin crear un duplicado.
- Cada miembro tiene su propio `tipo_usuario` independiente.
- El costo total se calcula dinámicamente.
- Los correos se envían a cada miembro registrado.

---

## 15. Fase 10 — Página de Confirmación y Constancia

### Objetivo
Crear las páginas post-registro: confirmación y descarga de constancia.

### Prerequisitos
- Fase 8 completada como mínimo.

### Archivos a crear

| Archivo | Tipo | Notas |
|---------|------|-------|
| `src/app/confirmacion/page.tsx` | Server Component | Muestra "Registro exitoso", folio, nombre, y enlace "Descargar constancia". Recibe datos via searchParams o state. |
| `src/app/constancia/[folio]/page.tsx` | Server Component | Busca el usuario por folio, regenera o descarga el PDF de constancia desde storage, y lo retorna. |

### Criterio de completitud
- Después de registrarse, el usuario ve la página de confirmación con su folio.
- El enlace a `/constancia/FOLIO` retorna el PDF correcto.

---

## 16. Diagrama de Dependencias entre Fases

```mermaid
graph TD
    F0["Fase 0<br/>Scaffolding"] --> F1["Fase 1<br/>Dominio"]
    F1 --> F2["Fase 2<br/>Puertos + DTOs"]
    F2 --> F3["Fase 3<br/>BD (Prisma + Repos)"]
    F2 --> F4["Fase 4<br/>Storage + Email"]
    F2 --> F5["Fase 5<br/>PDF"]
    F3 --> F6["Fase 6<br/>DI Container"]
    F4 --> F6
    F5 --> F6
    F6 --> F7["Fase 7<br/>Use Cases"]
    F7 --> F8["Fase 8<br/>Registro Individual"]
    F8 --> F9["Fase 9<br/>Registro Grupal"]
    F8 --> F10["Fase 10<br/>Confirmación + Constancia"]

    style F0 fill:#333,stroke:#888,color:#fff
    style F1 fill:#1a1a2e,stroke:#e94560,color:#fff
    style F2 fill:#16213e,stroke:#0f3460,color:#fff
    style F3 fill:#0f3460,stroke:#533483,color:#fff
    style F4 fill:#0f3460,stroke:#533483,color:#fff
    style F5 fill:#0f3460,stroke:#533483,color:#fff
    style F6 fill:#0f3460,stroke:#533483,color:#fff
    style F7 fill:#16213e,stroke:#0f3460,color:#fff
    style F8 fill:#1a1a2e,stroke:#e94560,color:#fff
    style F9 fill:#1a1a2e,stroke:#e94560,color:#fff
    style F10 fill:#1a1a2e,stroke:#e94560,color:#fff
```

**Fases paralelas:** Las fases 3, 4 y 5 pueden desarrollarse simultáneamente porque cada una implementa un puerto diferente y no tienen dependencias entre sí.

---

## 17. Checklist Completo de Archivos

### Capa de Dominio (`src/core/`) — Fase 1

- [ ] `src/core/enums/Genero.ts`
- [ ] `src/core/value-objects/Email.ts`
- [ ] `src/core/value-objects/Telefono.ts`
- [ ] `src/core/value-objects/FolioRecibo.ts`
- [ ] `src/core/value-objects/CodigoBarras.ts`
- [ ] `src/core/value-objects/Monto.ts`
- [ ] `src/core/value-objects/ArchivoComprobante.ts`
- [ ] `src/core/errors/RegistroError.ts`
- [ ] `src/core/errors/ComprobanteError.ts`
- [ ] `src/core/errors/GrupoRegistroError.ts`
- [ ] `src/core/entities/Usuario.ts`
- [ ] `src/core/entities/ComprobantePago.ts`
- [ ] `src/core/entities/Facturacion.ts`
- [ ] `src/core/entities/GrupoRegistro.ts`

### Capa de Aplicación (`src/application/`) — Fase 2

- [ ] `src/application/ports/IUsuarioRepository.ts`
- [ ] `src/application/ports/IComprobantePagoRepository.ts`
- [ ] `src/application/ports/IFacturacionRepository.ts`
- [ ] `src/application/ports/ICatalogoRepository.ts`
- [ ] `src/application/ports/IEmailService.ts`
- [ ] `src/application/ports/IPdfService.ts`
- [ ] `src/application/ports/IStorageService.ts`
- [ ] `src/application/dtos/RegistroUsuarioDTO.ts`
- [ ] `src/application/dtos/RegistroGrupoDTO.ts`
- [ ] `src/application/dtos/FacturacionDTO.ts`
- [ ] `src/application/dtos/ResultadoRegistro.ts`
- [ ] `src/application/dtos/ResultadoRegistroGrupo.ts`

### Capa de Aplicación: Use Cases — Fase 7

- [ ] `src/application/use-cases/RegistrarUsuario.ts`
- [ ] `src/application/use-cases/EnviarConfirmacion.ts`
- [ ] `src/application/use-cases/GenerarConstancia.ts`
- [ ] `src/application/use-cases/RegistrarGrupo.ts`
- [ ] `src/application/use-cases/SolicitarFacturacion.ts`

### Capa de Infraestructura (`src/infrastructure/`) — Fases 3-6

- [ ] `src/infrastructure/database/prisma/schema.prisma`
- [ ] `src/infrastructure/database/client.ts`
- [ ] `src/infrastructure/mappers/UsuarioMapper.ts`
- [ ] `src/infrastructure/mappers/ComprobantePagoMapper.ts`
- [ ] `src/infrastructure/mappers/FacturacionMapper.ts`
- [ ] `src/infrastructure/repositories/PrismaUsuarioRepository.ts`
- [ ] `src/infrastructure/repositories/PrismaComprobantePagoRepository.ts`
- [ ] `src/infrastructure/repositories/PrismaFacturacionRepository.ts`
- [ ] `src/infrastructure/repositories/PrismaCatalogoRepository.ts`
- [ ] `src/infrastructure/services/storage/SupabaseStorageService.ts`
- [ ] `src/infrastructure/services/email/ResendEmailService.ts`
- [ ] `src/infrastructure/services/email/templates/confirmacion.ts`
- [ ] `src/infrastructure/services/email/templates/constancia.ts`
- [ ] `src/infrastructure/services/pdf/ReactPdfService.ts`
- [ ] `src/infrastructure/services/pdf/templates/ConstanciaTemplate.tsx`
- [ ] `src/infrastructure/config/container.ts`

### Shared (`src/shared/`) — Se crean cuando se necesiten

- [ ] `src/shared/types/catalogos.ts`
- [ ] `src/shared/validation/registro.schema.ts`
- [ ] `src/shared/validation/grupo.schema.ts`

### Capa de Presentación (`src/app/`) — Fases 8-10

- [ ] `src/app/registro/page.tsx`
- [ ] `src/app/registro/components/RegistroForm.tsx`
- [ ] `src/app/registro/components/GrupoForm.tsx`
- [ ] `src/app/registro/components/MiembroRow.tsx`
- [ ] `src/app/registro/components/CampoArchivo.tsx`
- [ ] `src/app/registro/components/SelectCatalogo.tsx`
- [ ] `src/app/registro/actions/registrar-usuario.action.ts`
- [ ] `src/app/registro/actions/registrar-grupo.action.ts`
- [ ] `src/app/confirmacion/page.tsx`
- [ ] `src/app/constancia/[folio]/page.tsx`

**Total: ~47 archivos** a crear a lo largo de las 11 fases.

---

## 18. Guía de Configuración: Supabase

### 18.1 Crear proyecto

1. Ir a [supabase.com](https://supabase.com) e iniciar sesión.
2. Click **"New Project"**.
3. Configurar:
   - **Name:** `aniei-registro-2026`
   - **Database Password:** (guardar de forma segura, se usará en `DATABASE_URL`)
   - **Region:** Elegir la más cercana (ej. `South America (São Paulo)` o `US East`)
   - **Plan:** Free tier es suficiente para desarrollo.
4. Esperar a que el proyecto se cree (1-2 minutos).

### 18.2 Obtener credenciales de Base de Datos

1. En el dashboard del proyecto, ir a **Settings → Database**.
2. En la sección **"Connection string"**, copiar:
   - **URI (Transaction pooler, port 6543)** → será tu `DATABASE_URL`
   - **URI (Session pooler, port 5432)** → será tu `DIRECT_URL`
3. Reemplazar `[YOUR-PASSWORD]` con la contraseña del paso 18.1.

```env
# .env.local
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### 18.3 Crear las tablas

**Opción A: Usar el SQL Editor de Supabase (recomendada)**

1. Ir a **SQL Editor** en el dashboard.
2. Copiar el contenido completo de `db/aniei2026.sql`.
3. Ejecutar.
4. Copiar el contenido de `db/seed_aniei2026.sql`.
5. Ejecutar.
6. Verificar en **Table Editor** que las tablas y datos se crearon correctamente.

**Opción B: Usar Prisma db push**

1. Escribir el `schema.prisma` primero (Fase 3).
2. Ejecutar `npx prisma db push` para crear las tablas.
3. Ejecutar el seed SQL manualmente desde el SQL Editor.

### 18.4 Vincular Prisma con Supabase

En `schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Verificar conexión:

```bash
npx prisma db pull    # Introspecta la BD existente → genera modelos
npx prisma generate   # Genera el PrismaClient tipado
```

### 18.5 Configurar Supabase Storage

1. En el dashboard, ir a **Storage**.
2. Click **"New bucket"** y crear **dos buckets**:

| Bucket | Public | Propósito |
|--------|--------|-----------|
| `comprobantes` | **No** (privado) | Comprobantes de pago subidos por usuarios. Solo accesibles via signed URLs o con la service key. |
| `constancias` | **Sí** (público) | Constancias PDF generadas. Accesibles públicamente por URL para descarga. |

3. Para el bucket `constancias` (público):
   - Click en el bucket → **Policies** → **New Policy**.
   - Seleccionar **"Allow public access for SELECT"** (solo lectura pública).

4. Para el bucket `comprobantes` (privado):
   - No crear políticas públicas. El acceso será solo via `service_role_key` desde el servidor.

### 18.6 Obtener credenciales de Storage

1. Ir a **Settings → API**.
2. Copiar:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role key** (bajo "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

> **Importante:** La `service_role` key tiene acceso total. **Nunca exponerla** en el cliente. Solo usarla en Server Actions / backend.

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL="https://abcdefghijk.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
```

### 18.7 Verificar Setup de Supabase

```bash
# Verificar BD
npx prisma db pull
# Debe generar modelos para: usuarios, comprobantes_pago, facturaciones, cargos, estados, etc.

# Verificar Storage (desde Node.js o un script temporal)
# Subir un archivo de prueba y obtener su URL
```

---

## 19. Guía de Configuración: Resend

### 19.1 Crear cuenta

1. Ir a [resend.com](https://resend.com) e iniciar sesión con GitHub o email.
2. El plan **Free** permite 100 emails/día y 3,000/mes (suficiente para desarrollo y un congreso pequeño).

### 19.2 Configurar dominio (opcional pero recomendado para producción)

Para enviar correos desde una dirección personalizada (ej. `registro@aniei.org.mx`) en lugar de `onboarding@resend.dev`:

1. En el dashboard de Resend, ir a **Domains → Add Domain**.
2. Ingresar el dominio: ej. `aniei.org.mx`.
3. Resend mostrará **registros DNS** que debes agregar:
   - **TXT** (para verificación SPF)
   - **CNAME** (para DKIM)
   - **MX** (opcional, para recibir correos)
4. Agregar los registros en el panel DNS del proveedor del dominio.
5. Click **"Verify"** en Resend. Puede tardar hasta 24h en propagarse.

> **Nota para desarrollo:** Sin dominio verificado, puedes enviar correos usando la dirección de prueba `onboarding@resend.dev` como remitente (solo llegan a la dirección de la cuenta de Resend).

### 19.3 Obtener API Key

1. En el dashboard, ir a **API Keys → Create API Key**.
2. Configurar:
   - **Name:** `aniei-registro-2026`
   - **Permission:** `Sending access` (solo enviar, no leer)
   - **Domain:** Seleccionar el dominio verificado, o "All domains".
3. Click **"Add"**. Copiar la API Key (empieza con `re_`).

```env
# .env.local
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="ANIEI 2026 <registro@aniei.org.mx>"
# Desarrollo sin dominio verificado:
# EMAIL_FROM="ANIEI 2026 <onboarding@resend.dev>"
```

### 19.4 Verificar Setup de Resend

Crear un script temporal o ejecutar en un REPL:

```typescript
import { Resend } from 'resend';

const resend = new Resend('re_xxxxxxxxxxxx');

const { data, error } = await resend.emails.send({
  from: 'ANIEI 2026 <onboarding@resend.dev>',
  to: ['tu-correo@gmail.com'],
  subject: 'Test — ANIEI Registro',
  html: '<p>Correo de prueba del sistema de registro ANIEI 2026</p>',
});

console.log(data, error);
```

Si `data.id` retorna un ID, el setup está correcto.

### 19.5 Límites del Free Tier

| Límite | Valor |
|--------|-------|
| Emails por día | 100 |
| Emails por mes | 3,000 |
| Dominios | 1 |
| API Keys | Sin límite |
| Tamaño de adjunto | 40 MB por correo |

Para un congreso con ~500 asistentes, el free tier **no será suficiente** en producción durante el rush de registro. Considerar actualizar al plan **Pro ($20/mes, 50k emails/mes)** antes del evento.

---

## 20. Guía de Configuración: Despliegue en Vercel

### 20.1 Conectar repositorio

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub.
2. Click **"New Project"** → importar el repositorio `iKinoo/aniei-registro-2026`.
3. Configurar:
   - **Framework Preset:** Next.js (auto-detectado)
   - **Root Directory:** `.` (o `src/` si el `next.config` está ahí)
   - **Build Command:** `npx prisma generate && next build`
   - **Install Command:** `npm install`

### 20.2 Variables de entorno

En Vercel → Project → **Settings → Environment Variables**, agregar:

| Variable | Valor | Nota |
|----------|-------|------|
| `DATABASE_URL` | (la URL del pooler de Supabase) | Production + Preview |
| `DIRECT_URL` | (la URL directa de Supabase) | Production + Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | (la URL del proyecto) | Production + Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | (la service role key) | Production + Preview |
| `RESEND_API_KEY` | (la API key de Resend) | Production + Preview |
| `EMAIL_FROM` | `ANIEI 2026 <registro@aniei.org.mx>` | Production |
| `ENABLE_GROUP_REGISTRATION` | `true` | Production + Preview |
| `NEXT_PUBLIC_APP_URL` | `https://tu-dominio.vercel.app` | Production |

### 20.3 Configurar Prisma para Vercel

En `package.json`, agregar un script `postinstall`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Esto asegura que el Prisma Client se genera después de cada `npm install` en Vercel.

### 20.4 Checklist pre-deploy

- [ ] Tablas creadas en Supabase con seed data cargado
- [ ] Buckets de Storage creados (`comprobantes`, `constancias`)
- [ ] Dominio verificado en Resend (o usar dominio de prueba)
- [ ] Todas las env vars configuradas en Vercel
- [ ] `prisma generate` incluido en build
- [ ] La app compila sin errores localmente (`npm run build`)
