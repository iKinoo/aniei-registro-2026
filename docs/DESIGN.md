# PLAN & DESIGN — Sistema de Registro ANIEI 2026

> **Estado:** En desarrollo activo (MVP funcional con módulos expandidos)  
> **Stack:** Next.js 16 (App Router) · React 19 · PostgreSQL (Supabase) · Prisma 7 (@prisma/adapter-pg) · TypeScript · Zod 4 · Tailwind CSS 4 · NextAuth v5 (Auth.js) · Nodemailer · @react-pdf/renderer · qrcode · bcryptjs  
> **Principio rector:** Clean Architecture (Arquitectura por capas / Hexagonal) adaptada a Next.js

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Requisitos Funcionales](#2-requisitos-funcionales)
3. [Requisitos No Funcionales](#3-requisitos-no-funcionales)
4. [Arquitectura Limpia en Next.js](#4-arquitectura-limpia-en-nextjs)
5. [Estructura de Directorios](#5-estructura-de-directorios)
6. [Diagrama de Arquitectura por Capas](#6-diagrama-de-arquitectura-por-capas)
7. [Modelo de Dominio](#7-modelo-de-dominio)
8. [Puertos y Adaptadores (Ports & Adapters)](#8-puertos-y-adaptadores-ports--adapters)
9. [Casos de Uso](#9-casos-de-uso)
10. [Diagramas de Secuencia](#10-diagramas-de-secuencia)
11. [Diagramas de Flujo](#11-diagramas-de-flujo)
12. [Módulo de Registro Grupal (Grupo Rápido)](#12-módulo-de-registro-grupal-grupo-rápido)
13. [Módulo de Actividades](#13-módulo-de-actividades)
14. [Módulo de Autenticación y CPanel](#14-módulo-de-autenticación-y-cpanel)
15. [Estrategia de Infraestructura Intercambiable](#15-estrategia-de-infraestructura-intercambiable)
16. [Data Mapper Pattern (ORM ↔ Dominio)](#16-data-mapper-pattern-orm--dominio)
17. [Decisiones de Diseño (ADRs)](#17-decisiones-de-diseño-adrs)

---

## 1. Visión General

Sistema web de inscripción al congreso ANIEI 2026 que permite:

- **Registro individual** de asistentes al congreso con selección de actividades opcionales.
- **Registro grupal rápido (Grupo Rápido)**: un usuario autenticado (`/perfil/grupo/registro`) pre-registra N miembros con nombre/apellido; cada miembro completa su registro posterior vía token/QR (`/grupo-completar/[token]`).
- **Confirmación por correo** electrónico tras registro (incluye contraseña generada).
- **Generación de constancia PDF** de inscripción, participación y ponencia, y hoja de registro grupal con QR.
- **Panel de administración (CPanel)** para gestión de usuarios, actividades, ponentes, precios y reenvío de constancias.
- **Autenticación** vía Auth.js (NextAuth v5) con credenciales locales (`accesos` + bcrypt) y `proxy.ts` para protección de rutas.
- **Precios escalonados** configurables (`precios_inscripcion`) con costo base + costo por miembro.
- **Independencia de proveedores** de infraestructura (BD, correo, almacenamiento).

El sistema se construye sobre Next.js aprovechando **Server Actions** como punto de entrada al backend, colocando frontend y backend en el mismo repositorio pero con separación lógica estricta entre capas.

---

## 2. Requisitos Funcionales

| ID    | Requisito                                                                 | Prioridad |
|-------|---------------------------------------------------------------------------|-----------|
| RF-01 | Registro individual de asistente (datos personales + institución)         | Alta      |
| RF-02 | Carga de comprobante de pago (imagen/PDF) durante el registro              | Alta      |
| RF-03 | Envío de correo de confirmación de inscripción (con contraseña)           | Alta      |
| RF-04 | Generación y almacenamiento de constancia PDF de inscripción               | Alta      |
| RF-05 | Registro grupal rápido: usuario autenticado pre-registra N miembros con un solo comprobante; miembros completan registro vía token/QR | Media     |
| RF-06 | Solicitud de facturación (opcional en registro)                           | Media     |
| RF-07 | Verificación de inscripción (manual)                                      | Media     |
| RF-08 | Inscripción a actividades del congreso (talleres, cursos) con validación de cupo (`SELECT FOR UPDATE`) | Media     |
| RF-09 | Gestión de ponentes por actividad                                         | Media     |
| RF-10 | Generación de constancias de participación y ponencia                     | Media     |
| RF-11 | Panel de administración para gestión de usuarios y actividades            | Alta      |
| RF-12 | Autenticación de administradores y usuarios con credenciales locales (bcrypt) | Alta      |
| RF-13 | Envío de constancias desde el CPanel por el administrador                 | Media     |
| RF-14 | Gestión de precios escalonados (`precios_inscripcion`)                    | Media     |
| RF-15 | Completar registro grupal vía enlace token (`/grupo-completar/[token]/usuario/[folio]`) | Media     |

---

## 3. Requisitos No Funcionales

| ID     | Requisito                                                                               |
|--------|-----------------------------------------------------------------------------------------|
| RNF-01 | La capa de dominio y aplicación **NO** deben depender de frameworks ni librerías externas |
| RNF-02 | Cambiar de proveedor de BD (Supabase → VPS PostgreSQL) no debe afectar casos de uso      |
| RNF-03 | Cambiar proveedor de correo (Nodemailer → SendGrid → SMTP propio) requiere solo un adaptador |
| RNF-04 | Cambiar almacenamiento (Supabase Storage → S3 → filesystem) requiere solo un adaptador    |
| RNF-05 | El módulo de registro grupal es independiente y opera vía token; no interfiere con el flujo base individual |
| RNF-06 | El sistema debe ser desplegable en Vercel, Docker (VPS) o cualquier plataforma Node.js     |
| RNF-07 | La autenticación no debe depender de proveedor externo (Auth.js + tabla `accesos`)        |
| RNF-08 | Inscripción a actividades debe ser segura ante concurrencia (bloqueo pesimista `FOR UPDATE`) |

---

## 4. Arquitectura Limpia en Next.js

### Principio Fundamental

La clave es separar **qué hace el sistema** (dominio + casos de uso) de **cómo lo hace** (infraestructura) y de **cómo se presenta** (UI / Next.js).

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEXT.JS (App Router)                         │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              PRESENTATION LAYER                           │  │
│  │    app/ → Pages, Layouts, Server Components, Client       │  │
│  │           Components, Server Actions                      │  │
│  │                                                           │  │
│  │    Server Actions = "Controllers" que invocan Use Cases   │  │
│  └──────────────────────┬────────────────────────────────────┘  │
│                         │ llama                                  │
│  ┌──────────────────────▼────────────────────────────────────┐  │
│  │              APPLICATION LAYER                             │  │
│  │    use-cases/ → Orquestación de lógica de negocio         │  │
│  │    dtos/      → Data Transfer Objects                     │  │
│  │    ports/     → Interfaces (contratos) de infraestructura │  │
│  └──────────────────────┬────────────────────────────────────┘  │
│                         │ depende de                             │
│  ┌──────────────────────▼────────────────────────────────────┐  │
│  │              DOMAIN LAYER                                  │  │
│  │    entities/       → Entidades de dominio                 │  │
│  │    value-objects/  → Objetos de valor                     │  │
│  │    errors/         → Errores de dominio                   │  │
│  │    enums/          → Enumeraciones (Genero)               │  │
│  │    (CERO dependencias externas)                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         ▲ implementa                             │
│  ┌──────────────────────┴────────────────────────────────────┐  │
│  │              INFRASTRUCTURE LAYER                          │  │
│  │    database/     → Prisma schema, client (PrismaPg+pg)    │  │
│  │    mappers/      → Data Mappers (PrismaType ↔ Entidad)   │  │
│  │    repositories/ → Implementaciones concretas (Prisma)    │  │
│  │    services/     → Email, PDF, Storage, Auth (adapters)   │  │
│  │    config/       → Dependency Injection container + supabase│  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### ¿Cómo encajan los Server Actions?

En Clean Architecture tradicional (Express, Nest), un **Controller** recibe el request HTTP, lo parsea, y llama al Use Case. En Next.js con App Router:

- Los **Server Actions** (`"use server"`) reemplazan a los controllers.
- Reciben datos del formulario (FormData o argumentos tipados).
- Validan input con Zod (capa de presentación).
- Instancian el Use Case inyectando las dependencias (vía `container.ts`).
- Retornan el resultado al Client Component.

```
[Client Component] → form submit → [Server Action] → [Use Case] → [Domain] + [Ports]
                                                                         ↑
                                                           [Infrastructure Adapters]
```

---

## 5. Estructura de Directorios

```
prisma/
└── schema.prisma                  # Esquema Prisma (fuente de verdad BD) — 13 modelos + catálogos

src/
├── app/                          # ── PRESENTATION LAYER (Next.js) ──
│   ├── layout.tsx
│   ├── page.tsx                  # Landing
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx              # Login (Auth.js Credentials)
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts # Handlers NextAuth
│   ├── registro/
│   │   ├── page.tsx              # Server Component: carga catálogos (titulos/estados/instituciones) + precios
│   │   ├── components/
│   │   │   ├── RegistroForm.tsx  # Client Component: wizard 3 pasos (Datos → Grupo → Pago)
│   │   │   ├── CampoArchivo.tsx
│   │   │   ├── FormularioDeposito.tsx
│   │   │   ├── SeccionFacturacion.tsx
│   │   │   ├── SelectCatalogo.tsx
│   │   │   ├── MiembroRow.tsx
│   │   │   └── steps/
│   │   │       ├── StepDatosGenerales.tsx
│   │   │       ├── StepGrupo.tsx
│   │   │       ├── StepPago.tsx
│   │   │       ├── StepActividades.tsx   # (usado en flujo actividades independiente)
│   │   │       ├── StepCheckout.tsx
│   │   │       └── StepFacturacion.tsx
│   │   └── actions/
│   │       └── registrar-usuario.action.ts  # Server Action (individual + miembros extra → grupo rápido transaccional)
│   ├── perfil/
│   │   ├── page.tsx              # Perfil usuario autenticado (actividades inscritas + historial depósitos)
│   │   ├── AutoLogout.tsx
│   │   └── grupo/
│   │       └── registro/
│   │           ├── page.tsx
│   │           └── GrupoRapidoForm.tsx  # Form de grupo rápido autenticado
│   ├── grupo-completar/
│   │   └── [token]/
│   │       ├── page.tsx              # Lista pendientes/completados del grupo
│   │       └── usuario/[folio]/page.tsx # Completar datos del miembro (email real, password)
│   ├── actividades/
│   │   ├── page.tsx                  # Listado + selección
│   │   ├── checkout/page.tsx
│   │   ├── actions.ts                # Server Actions de inscripción a actividades
│   │   └── ActividadesSeleccionClient.tsx
│   ├── confirmacion/page.tsx
│   ├── constancia/[folio]/page.tsx
│   ├── components/HistorialDepositos.tsx
│   └── cpanel/                       # ── Panel de Administración ──
│       ├── layout.tsx
│       ├── page.tsx                  # Gestión de usuarios (búsqueda + paginación + reenvío constancia + URL firmada)
│       ├── actions.ts                # getUsuariosAdminAction, reenviarConstanciaAction, obtenerUrlArchivoAction
│       ├── logoutAction.ts
│       ├── actividades/
│       │   ├── page.tsx
│       │   └── [id]/page.tsx
│       ├── configuracion/page.tsx    # Precios escalonados
│       └── usuarios/[folio]/page.tsx # Detalle depósitos de usuario
│
├── core/                         # ── DOMAIN LAYER (puro TypeScript) ──
│   ├── entities/
│   │   ├── Usuario.ts            # folioRegistro PK string (ANI26-XXXX), idTitulo, idInstitucion, idEntidadFederativa
│   │   ├── Deposito.ts           # Comprobante de pago (archivo + proposito)
│   │   ├── Facturacion.ts
│   │   ├── GrupoRegistro.ts      # Entidad de aplicación para grupo rápido (MiembroInput mínimo)
│   │   └── Acceso.ts             # Credenciales (email/rol/nombre/authId)
│   ├── value-objects/
│   │   ├── Email.ts
│   │   ├── Telefono.ts
│   │   ├── FolioRegistro.ts
│   │   ├── CodigoBarras.ts
│   │   ├── Monto.ts
│   │   └── ArchivoComprobante.ts # Validación MIME (png/jpeg/pdf) y 5 MB
│   ├── errors/
│   │   ├── RegistroError.ts
│   │   ├── ComprobanteError.ts
│   │   └── GrupoRegistroError.ts
│   └── enums/
│       └── Genero.ts             # 'M' | 'F' | 'O'
│
├── application/                  # ── APPLICATION LAYER ──
│   ├── ports/                    # Interfaces (contratos) = 14 puertos
│   │   ├── IUsuarioRepository.ts
│   │   ├── IDepositoRepository.ts
│   │   ├── IFacturacionRepository.ts
│   │   ├── ICatalogoRepository.ts    # obtenerTitulos/Estados/Instituciones/TiposUsuario
│   │   ├── IAccesoRepository.ts      # buscarPorEmail(email) / crear(email, hash, rol, folio?, nombre?)
│   │   ├── IActividadRepository.ts
│   │   ├── IInscripcionActividadRepository.ts # crearMuchas, crearMuchasConValidacion, obtenerPorActividad, etc.
│   │   ├── IPonentesRepository.ts
│   │   ├── IPrecioInscripcionRepository.ts
│   │   ├── IAdminQueryService.ts
│   │   ├── IAuthService.ts
│   │   ├── IEmailService.ts
│   │   ├── IPdfService.ts
│   │   └── IStorageService.ts
│   ├── use-cases/
│   │   ├── RegistrarUsuario.ts
│   │   ├── RegistrarGrupoRapido.ts
│   │   ├── EnviarConfirmacion.ts
│   │   ├── GenerarConstancia.ts
│   │   ├── GenerarConstanciaParticipanteUseCase.ts
│   │   ├── GenerarConstanciaPonenteUseCase.ts
│   │   ├── EnviarConstanciaParticipanteUseCase.ts
│   │   ├── EnviarConstanciaPonenteUseCase.ts
│   │   ├── SolicitarFacturacion.ts
│   │   ├── GestionarActividades.ts
│   │   ├── GestionarPrecios.ts
│   │   ├── LoginCpanelUseCase.ts
│   │   ├── ObtenerAccesoArchivo.ts
│   │   └── ObtenerUsuariosForAdmin.ts
│   └── dtos/
│       ├── RegistroUsuarioDTO.ts       # Incluye ArchivoDTO, DepositoDTO, actividadesIds?
│       ├── RegistrarGrupoRapidoDTO.ts  # responsableId + miembros {nombre, apellido} + deposito+archivo
│       ├── FacturacionDTO.ts
│       ├── ActividadDTO.ts             # ActividadDTO, CrearActividadDTO, PonenteDTO, InscritoDTO
│       ├── InscripcionActividadDTO.ts
│       ├── AuthSessionDTO.ts
│       ├── UsuarioForAdminDTO.ts
│       ├── PaginatedResult.ts
│       ├── ResultadoRegistro.ts        # { success, folio, urlConstancia, correo, passwordPlana }
│       └── ResultadoRegistroGrupo.ts
│
├── generated/                    # ── CÓDIGO GENERADO ──
│   └── prisma/                   # Cliente Prisma generado (prisma-client)
│
├── infrastructure/               # ── INFRASTRUCTURE LAYER ──
│   ├── database/
│   │   └── client.ts                     # Singleton PrismaClient con PrismaPg(pool) — usa DATABASE_URL (pooler 6543)
│   ├── mappers/
│   │   ├── UsuarioMapper.ts              # toDomain / toPersistence (Email, Telefono, CodigoBarras)
│   │   ├── DepositoMapper.ts
│   │   └── FacturacionMapper.ts
│   ├── repositories/
│   │   ├── PrismaUsuarioRepository.ts    # crear, crearMuchos, buscarPorCorreo/Id/Folio, verificar, crearGrupoTransaccional
│   │   ├── PrismaDepositoRepository.ts
│   │   ├── PrismaFacturacionRepository.ts
│   │   ├── PrismaCatalogoRepository.ts   # titulos, estados, instituciones, tipo_usuario
│   │   ├── PrismaAccesoRepository.ts
│   │   ├── PrismaActividadRepository.ts
│   │   ├── PrismaInscripcionActividadRepository.ts # crearMuchasConValidacion con SELECT FOR UPDATE
│   │   ├── PrismaPonentesRepository.ts
│   │   └── PrismaPrecioInscripcionRepository.ts
│   ├── services/
│   │   ├── email/
│   │   │   ├── NodemailerEmailService.ts   # Gmail SMTP (GMAIL_USER/GMAIL_APP_PASSWORD)
│   │   │   └── templates/
│   │   │       ├── confirmacion.ts
│   │   │       ├── constancia.ts
│   │   │       ├── confirmacion-actividades.ts
│   │   │       └── notificacion-ponente.ts
│   │   ├── pdf/
│   │   │   ├── ReactPdfService.ts          # @react-pdf/renderer + qrcode
│   │   │   └── templates/
│   │   │       ├── GenericConstanciaTemplate.tsx
│   │   │       └── HojaRegistroGrupoTemplate.tsx
│   │   ├── storage/
│   │   │   └── SupabaseStorageService.ts   # buckets: comprobantes / constancias (signedUrl 5min)
│   │   ├── auth/
│   │   │   └── AuthJsAuthService.ts
│   │   └── PrismaAdminQueryService.ts      # obtenerUsuariosForAdmin con paginación + búsqueda insensible
│   └── config/
│       ├── container.ts                    # DI factory — 11 getters + getPrecioInscripcionRepository()
│       └── supabase/                       # client.ts / server.ts / middleware.ts (helpers SSR)
│
├── shared/                       # ── UTILIDADES COMPARTIDAS ──
│   ├── types/
│   │   └── catalogos.ts              # Titulo, Estado, Institucion, TipoUsuario, TipoActividad, PrecioInscripcion
│   └── validation/
│       └── registro.schema.ts        # Zod v4: registroSchema, depositoSchema, facturacionSchema, validarArchivo
│
├── auth.ts                       # NextAuth con Credentials + bcrypt + prisma.accesos
├── auth.config.ts                # NextAuthConfig (jwt, callbacks, pages signIn /login)
└── proxy.ts                      # Auth middleware (NextAuth) — protege /cpanel, /perfil, /actividades, redirige /login y /registro si ya autenticado
```

---

## 6. Diagrama de Arquitectura por Capas

```mermaid
graph TB
    subgraph Presentation["🖥️ Presentation Layer (Next.js App Router)"]
        Pages["Pages & Layouts"]
        SC["Server Components"]
        CC["Client Components<br/>(RegistroForm, GrupoRapidoForm)"]
        SA["Server Actions<br/>(registrar-usuario, cpanel/actions)"]
    end

    subgraph Application["⚙️ Application Layer"]
        UC["Use Cases<br/>RegistrarUsuario<br/>RegistrarGrupoRapido<br/>GestionarPrecios<br/>GenerarConstancia"]
        DTO["DTOs"]
        Ports["Ports (Interfaces)<br/>IUsuarioRepository<br/>IPrecioInscripcionRepository<br/>IEmailService<br/>IPdfService<br/>IStorageService"]
    end

    subgraph Domain["🧠 Domain Layer (Pure TypeScript)"]
        Entities["Entities<br/>Usuario · Deposito<br/>Facturacion · GrupoRegistro · Acceso"]
        VO["Value Objects<br/>Email · FolioRegistro<br/>Monto · CodigoBarras<br/>ArchivoComprobante · Telefono"]
        DErr["Domain Errors"]
    end

    subgraph Infrastructure["🔌 Infrastructure Layer (Adapters)"]
        Repos["Repositories<br/>PrismaUsuarioRepo<br/>PrismaDepositoRepo<br/>PrismaActividadRepo<br/>PrismaPrecioRepo"]
        Mappers["Data Mappers<br/>UsuarioMapper<br/>DepositoMapper<br/>FacturacionMapper"]
        ORM["Prisma ORM<br/>(PrismaClient + PrismaPg)"]
        EmailSvc["Email Adapters<br/>Nodemailer (Gmail)"]
        PdfSvc["PDF Adapters<br/>ReactPdf + QRCode"]
        StoreSvc["Storage Adapters<br/>Supabase Storage (buckets)"]
        AuthSvc["Auth Adapters<br/>Auth.js (Credentials)"]
        AdminSvc["Admin Services<br/>PrismaAdminQueryService"]
        DB[("PostgreSQL 17<br/>(Supabase pooler)")]
    end

    CC -->|"submit form"| SA
    SA -->|"crea DTO + llama"| UC
    UC -->|"usa"| Entities
    UC -->|"usa"| VO
    UC -->|"define"| Ports

    Ports -.->|"implementa"| Repos
    Ports -.->|"implementa"| EmailSvc
    Ports -.->|"implementa"| PdfSvc
    Ports -.->|"implementa"| StoreSvc
    Ports -.->|"implementa"| AuthSvc
    Ports -.->|"implementa"| AdminSvc

    Repos -->|"usa"| Mappers
    Repos -->|"query/insert"| ORM
    ORM -->|"SQL (pg Pool)"| DB

    style Domain fill:#1a1a2e,stroke:#e94560,color:#fff
    style Application fill:#16213e,stroke:#0f3460,color:#fff
    style Presentation fill:#0f3460,stroke:#533483,color:#fff
    style Infrastructure fill:#1a1a2e,stroke:#533483,color:#fff
```

---

## 7. Modelo de Dominio

### 7.1 Diagrama de Clases del Dominio (Entidades y Value Objects)

> **Nota actualizada:** `Usuario` usa `idTitulo` (FK a `titulos`) y **no** `idCargo`/`idTipoUsuario`. `titulos` es el catálogo usado en el formulario de registro. `tipo_usuario` permanece como catálogo consultable pero no es FK directa de `Usuario` en el flujo actual. `cargos` existe en BD pero no se expone vía `ICatalogoRepository`.

```mermaid
classDiagram
    class Usuario {
        -folioRegistro: string | null
        -codigoBarras: CodigoBarras | null
        -nombre: string
        -apellido: string
        -correo: Email
        -telefono: Telefono | null
        -genero: Genero
        -carrera: string | null
        -dependencia: string | null
        -idTitulo: number
        -idInstitucion: number
        -idEntidadFederativa: number
        -idGrupoRegistro: number | null
        -verificado: boolean
        -fechaRegistro: Date
        +static create(props): Usuario
        +verificar(): void
        +asignarCodigoBarras(codigo: CodigoBarras): void
        +nombreCompleto(): string
    }

    class Deposito {
        -idDeposito: number | null
        -folioRegistro: string
        -bancoSucursal: string | null
        -ciudad: string | null
        -referencia: string
        -monto: Monto
        -fechaDeposito: Date
        -archivoUrl: string
        -archivo: ArchivoComprobante
        -fechaRegistro: Date
        -proposito: string
        -notas: string | null
        +static create(props): Deposito
    }

    class Facturacion {
        -idFacturacion: number | null
        -folioRegistro: string
        -razonSocial: string
        -rfc: string
        -calle: string
        -numExterior: string | null
        -numInterior: string | null
        -colonia: string
        -municipio: string
        -codigoPostal: string
        -idEntidadFederativaRfc: number | null
        +static create(props): Facturacion
    }

    class GrupoRegistro {
        -responsable: Usuario
        -miembros: Usuario[]
        -idInstitucionCompartida: number
        -idEntidadFederativaCompartida: number
        -responsableYaRegistrado: boolean
        +static create(responsable, miembrosInput, yaRegistrado?): GrupoRegistro
        +obtenerTodos(): Usuario[]
        +obtenerNuevosRegistros(): Usuario[]
        +totalIntegrantes(): number
        +esResponsableExistente(): boolean
    }

    class Email {
        <<value-object>>
        -valor: string
        +static create(email: string): Email
        +toString(): string
    }

    class FolioRegistro {
        <<value-object>>
        -valor: string
        +static create(folio: string): FolioRegistro
        +toString(): string
        +equals(other: FolioRegistro): boolean
    }

    class CodigoBarras {
        <<value-object>>
        -valor: string
        +static create(codigo: string): CodigoBarras
    }

    class Monto {
        <<value-object>>
        -valor: number
        +static create(monto: number): Monto
        +esMayorQue(otro: Monto): boolean
    }

    class ArchivoComprobante {
        <<value-object>>
        -nombre: string
        -mime: string
        -tamanio: number
        +static create(nombre: string, mime: string, tamanio: number): ArchivoComprobante
        +esImagen(): boolean
        +esPdf(): boolean
        +getNombre(): string
        +getMime(): string
        +getTamanio(): number
    }

    class Telefono {
        <<value-object>>
        -numero: string
        -lada: string | null
        -extension: string | null
        +static create(num, lada?, ext?): Telefono
        +completo(): string
        +getNumero(): string
        +getLada(): string | null
        +getExtension(): string | null
    }

    class Acceso {
        -idAcceso: number
        -email: string
        -rol: string
        -nombre: string | null
        -authId: string | null
        +static create(props): Acceso
        +isAdmin(): boolean
    }

    class Genero {
        <<enumeration>>
        MASCULINO = M
        FEMENINO = F
        OTRO = O
    }

    Usuario *-- Email
    Usuario *-- Telefono
    Usuario *-- CodigoBarras
    Deposito *-- Monto
    Deposito *-- ArchivoComprobante
    GrupoRegistro "1" *-- "1" Usuario : responsable
    GrupoRegistro "1" *-- "*" Usuario : miembros
    Acceso --> Usuario : folioRegistro (nullable)
```

#### Usuario (implementación real en `src/core/entities/Usuario.ts:7`)

```ts
interface UsuarioProps {
  folioRegistro?: string | null;
  codigoBarras?: CodigoBarras | null;
  nombre: string; apellido: string;
  correo: Email; telefono?: Telefono | null;
  genero: Genero; carrera?: string|null; dependencia?: string|null;
  idTitulo: number; idInstitucion: number; idEntidadFederativa: number;
  verificado?: boolean; fechaRegistro?: Date;
}
```

No hay `idCargo` ni `idTipoUsuario` en la entidad. `idTitulo` mapea a `usuarios.id_titulo` → `titulos.id_titulo`.

#### GrupoRegistro (implementación real en `src/core/entities/GrupoRegistro.ts:6`)

```ts
interface MiembroInput { nombre: string; apellido: string; correo: string; genero: Genero; carrera?: string|null; }
// En la práctica el flujo rápido usa {nombre, apellido} y hereda idTitulo/institucion/estado/dependencia del responsable
```

Herencia real: `idInstitucion`, `idEntidadFederativa`, `idTitulo` (y `dependencia`) — no `idCargo`.

### 7.2 Catálogos

Los catálogos se tratan como **datos de referencia** de solo lectura:

```typescript
// src/shared/types/catalogos.ts
interface Estado { idEntidadFederativa: number; nombre: string }
interface Institucion { idInstitucion: number; nombre: string; abreviatura: string | null }
interface Titulo { idTitulo: number; descripcion: string }
interface TipoUsuario { idTipoUsuario: number; descripcion: string } // consultable, no FK directa de Usuario en flujo actual
interface TipoActividad { idTipoActividad: number; clave: string | null; descripcion: string; manejaEquipos: boolean; generaConstanciaParticipante: boolean }
interface PrecioInscripcion { id: number; fechaLimite: Date; costo: number; costoMiembro: number; orden: number; activo: boolean }
```

> `cargos` existe en BD (`prisma/schema.prisma:62`) pero `PrismaCatalogoRepository` no lo expone actualmente (solo titulos/estados/instituciones/tipo_usuario).

---

## 8. Puertos y Adaptadores (Ports & Adapters)

### 8.1 Diagrama de Puertos

```mermaid
classDiagram
    class IUsuarioRepository {
        <<port>>
        +crear(usuario: Usuario): Promise~Usuario~
        +crearMuchos(usuarios: Usuario[]): Promise~Usuario[]~
        +buscarPorCorreo(correo: Email): Promise~Usuario | null~
        +buscarPorId(id: string): Promise~Usuario | null~
        +buscarPorFolio(folio: FolioRegistro): Promise~Usuario | null~
        +verificar(id: string): Promise~void~
        +crearGrupoTransaccional(data): Promise~(usuariosIds, folios)~
    }

    class IDepositoRepository {
        <<port>>
        +crear(deposito: Deposito): Promise~Deposito~
        +buscarPorUsuario(folioRegistro: string): Promise~Deposito | null~
        +buscarTodosPorUsuario(folioRegistro: string): Promise~Deposito[]~
    }

    class IFacturacionRepository {
        <<port>>
        +crear(facturacion: Facturacion): Promise~Facturacion~
        +buscarPorUsuario(folioRegistro: string): Promise~Facturacion | null~
    }

    class ICatalogoRepository {
        <<port>>
        +obtenerTitulos(): Promise~Titulo[]~
        +obtenerEstados(): Promise~Estado[]~
        +obtenerInstituciones(): Promise~Institucion[]~
        +obtenerTiposUsuario(): Promise~TipoUsuario[]~
    }

    class IAccesoRepository {
        <<port>>
        +buscarPorEmail(email: string): Promise~Acceso | null~
        +crear(email, passwordHash, rol, folioRegistro?, nombre?): Promise~Acceso~
    }

    class IActividadRepository {
        <<port>>
        +listar(): Promise~ActividadDTO[]~
        +obtenerPorId(id: number): Promise~ActividadDTO | null~
        +crear(data: CrearActividadDTO): Promise~ActividadDTO~
        +actualizar(id: number, data): Promise~ActividadDTO~
        +obtenerTiposActividad(): Promise~TipoActividad[]~
    }

    class IInscripcionActividadRepository {
        <<port>>
        +crearMuchas(folioRegistro, ids): Promise~void~
        +obtenerIdsPorUsuario(folioRegistro): Promise~number[]~
        +obtenerPorActividad(idActividad): Promise~InscritoDTO[]~
        +crearMuchasConValidacion(folioRegistro, ids): Promise~(ok, sinCupo)~
        +actualizarUrlConstancia(idActividad, folioRegistro, url): Promise~void~
    }

    class IPonentesRepository {
        <<port>>
        +crear(data): Promise~void~
        +listarPorActividad(idActividad: number): Promise~Ponente[]~
        +eliminar(idPonente: number): Promise~void~
    }

    class IPrecioInscripcionRepository {
        <<port>>
        +obtenerTodos(): Promise~PrecioInscripcion[]~
        +obtenerVigente(): Promise~PrecioInscripcion | null~
        +obtenerPorId(id: number): Promise~PrecioInscripcion | null~
        +crear(data: CrearPrecioDTO): Promise~PrecioInscripcion~
        +actualizar(id: number, data): Promise~PrecioInscripcion~
        +eliminar(id: number): Promise~void~
    }

    class IAdminQueryService {
        <<port>>
        +obtenerUsuariosForAdmin(page, limit, search?): Promise~PaginatedResult~UsuarioForAdminDTO~~
    }

    class IAuthService {
        <<port>>
        +signOut(): Promise~void~
        +getCurrentSession(): Promise~AuthSessionDTO | null~
    }

    class IEmailService {
        <<port>>
        +enviarConfirmacionRegistro(destinatario: string, datos: ConfirmacionData): Promise~void~
        +enviarConstancia(destinatario: string, pdfBuffer: Buffer, folio: string): Promise~void~
        +enviarConfirmacionActividades(destinatario: string, datos): Promise~void~
        +enviarNotificacionPonente(destinatario: string, datos): Promise~void~
        +enviarConstanciaPonente(destinatario: string, pdfBuffer, nombre, actividad): Promise~void~
        +enviarConstanciaParticipante(destinatario: string, pdfBuffer, nombre, actividad): Promise~void~
        +enviarConfirmacionGrupoRapido(destinatario: string, datos, pdfBuffer): Promise~void~
    }

    class IPdfService {
        <<port>>
        +generarConstanciaInscripcion(datos: ConstanciaData): Promise~Buffer~
        +generarConstanciaPonente(datos: ConstanciaPonenteData): Promise~Buffer~
        +generarConstanciaParticipante(datos: ConstanciaPonenteData): Promise~Buffer~
        +generarHojaRegistroGrupo(datos: HojaRegistroGrupoData): Promise~Buffer~
    }

    class IStorageService {
        <<port>>
        +subir(ruta: string, buffer: Buffer, mime: string): Promise~string~
        +getAccess(file: FileReference): Promise~string~
        +eliminar(ruta: string): Promise~void~
        +descargar(ruta: string): Promise~Buffer~
    }

    class UsuarioMapper {
        <<data-mapper>>
        +toDomain(prismaUsuario): Usuario
        +toPersistence(usuario): PrismaUsuarioCreateInput
    }

    class DepositoMapper {
        <<data-mapper>>
        +toDomain(prismaDeposito): Deposito
        +toPersistence(deposito): PrismaDepositoCreateInput
    }

    class FacturacionMapper {
        <<data-mapper>>
        +toDomain(prismaFacturacion): Facturacion
        +toPersistence(facturacion): PrismaFacturacionCreateInput
    }

    class PrismaUsuarioRepo {
        <<adapter>>
        -prisma: PrismaClient
        -mapper: UsuarioMapper
    }
    class NodemailerEmailService {
        <<adapter>>
    }
    class ReactPdfService {
        <<adapter>>
    }
    class SupabaseStorageService {
        <<adapter>>
    }
    class AuthJsAuthService {
        <<adapter>>
    }

    IUsuarioRepository <|.. PrismaUsuarioRepo
    PrismaUsuarioRepo --> UsuarioMapper : usa
    IEmailService <|.. NodemailerEmailService
    IPdfService <|.. ReactPdfService
    IStorageService <|.. SupabaseStorageService
    IAuthService <|.. AuthJsAuthService
```

#### Firmas reales relevantes

**`IUsuarioRepository` (`src/application/ports/IUsuarioRepository.ts:5`)**
```ts
crearGrupoTransaccional(data: {
  token: string; responsableId: string; institucionId: number;
  dependenciaId: string; estadoId: number;
  miembros: Array<{ nombre: string; apellido: string; correoDummy: string; passwordHash: string; }>;
}): Promise<{ usuariosIds: string[], folios: string[] }>;
```

**`ICatalogoRepository` (`src/application/ports/ICatalogoRepository.ts:3`)** expone `obtenerTitulos()` (no `obtenerCargos()`).

**`IAdminQueryService` (`src/application/ports/IAdminQueryService.ts:4`)**: `obtenerUsuariosForAdmin(page, limit, search?)` (no `verificado`).

**`IPrecioInscripcionRepository`** (14to puerto, no documentado antes) con CRUD + `obtenerVigente()`.

### 8.2 Dependency Injection Container

El container es una **simple factory** sin framework DI (`src/infrastructure/config/container.ts:31`):

```
container.ts
├── getUsuarioRepository()          → PrismaUsuarioRepository(prisma)
├── getDepositoRepository()         → PrismaDepositoRepository(prisma)
├── getFacturacionRepository()      → PrismaFacturacionRepository(prisma)
├── getCatalogoRepository()         → PrismaCatalogoRepository(prisma)
├── getAccesoRepository()           → PrismaAccesoRepository(prisma)
├── getActividadRepository()        → PrismaActividadRepository(prisma)
├── getInscripcionActividadRepository() → PrismaInscripcionActividadRepository(prisma)
├── getPonentesRepository()         → PrismaPonentesRepository(prisma)
├── getPrecioInscripcionRepository()→ PrismaPrecioInscripcionRepository(prisma)
├── getAdminQueryService()          → PrismaAdminQueryService(prisma)
├── getEmailService()               → NodemailerEmailService(GMAIL_USER, GMAIL_APP_PASSWORD, EMAIL_FROM)
├── getPdfService()                 → ReactPdfService()
├── getStorageService()             → SupabaseStorageService(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
└── getAuthService()                → AuthJsAuthService()
```

**Variables de entorno requeridas por el container:**

```
GMAIL_USER               # Usuario de Gmail (para Nodemailer SMTP)
GMAIL_APP_PASSWORD        # App password de Gmail
EMAIL_FROM               # Remitente (e.g. "ANIEI 2026 <registro@dominio.com>")
NEXT_PUBLIC_SUPABASE_URL  # URL del proyecto Supabase
SUPABASE_SERVICE_ROLE_KEY # Service role key de Supabase
DATABASE_URL              # Pool de Supabase (6543) — usado por PrismaPg en client.ts
DIRECT_URL                # (opcional) URL directa 5432 — usada por CLI/migraciones
AUTH_SECRET               # Secreto para JWT de NextAuth
NEXT_PUBLIC_BASE_URL      # Base URL para QR de grupo (fallback vercel.app)
```

> **Infra BD real (`src/infrastructure/database/client.ts:1`):** `new Pool({ connectionString: process.env.DATABASE_URL! })` + `new PrismaPg(pool)` + `new PrismaClient({ adapter })`. Singleton con cache en `globalThis` en dev.

---

## 9. Casos de Uso

### 9.1 Diagrama de Clases de Use Cases

```mermaid
classDiagram
    class RegistrarUsuario {
        -usuarioRepo: IUsuarioRepository
        -depositoRepo: IDepositoRepository
        -facturacionRepo: IFacturacionRepository
        -storageService: IStorageService
        -emailService: IEmailService
        -pdfService: IPdfService
        -catalogoRepo: ICatalogoRepository
        -accesoRepo: IAccesoRepository
        -inscripcionRepo: IInscripcionActividadRepository
        +execute(dto: RegistroUsuarioDTO): Promise~ResultadoRegistro~
    }

    class RegistrarGrupoRapido {
        -usuarioRepo: IUsuarioRepository
        -depositoRepo: IDepositoRepository
        -storageService: IStorageService
        -emailService: IEmailService
        -pdfService: IPdfService
        +execute(dto: RegistrarGrupoRapidoDTO): Promise~ResultadoRegistroGrupo~
    }

    class GenerarConstancia {
        -pdfService: IPdfService
        -storageService: IStorageService
        -usuarioRepo: IUsuarioRepository
        -catalogoRepo: ICatalogoRepository
        +execute(folioRegistro: string): Promise~string~
    }

    class GenerarConstanciaParticipanteUseCase {
        -pdfService: IPdfService
        -storageService: IStorageService
        -usuarioRepo: IUsuarioRepository
        -inscripcionRepo: IInscripcionActividadRepository
        -actividadRepo: IActividadRepository
        +execute(folioRegistro: string, idActividad: number): Promise~string~
    }

    class GenerarConstanciaPonenteUseCase {
        -pdfService: IPdfService
        -storageService: IStorageService
        -ponentesRepo: IPonentesRepository
        -actividadRepo: IActividadRepository
        +execute(idPonente: number): Promise~string~
    }

    class EnviarConfirmacion {
        -emailService: IEmailService
        -usuarioRepo: IUsuarioRepository
        -catalogoRepo: ICatalogoRepository
        +execute(folioRegistro: string): Promise~void~
    }

    class EnviarConstanciaParticipanteUseCase {
        -emailService: IEmailService
        -usuarioRepo: IUsuarioRepository
        -actividadRepo: IActividadRepository
        +execute(folioRegistro: string, idActividad: number, pdfBuffer: Buffer): Promise~void~
    }

    class EnviarConstanciaPonenteUseCase {
        -emailService: IEmailService
        -ponentesRepo: IPonentesRepository
        +execute(idPonente: number, pdfBuffer: Buffer): Promise~void~
    }

    class SolicitarFacturacion {
        -facturacionRepo: IFacturacionRepository
        -usuarioRepo: IUsuarioRepository
        +execute(dto: FacturacionDTO): Promise~Facturacion~
    }

    class GestionarActividades {
        -actividadRepo: IActividadRepository
        -catalogoRepo: ICatalogoRepository
        +listar(): Promise~ActividadDTO[]~
        +crear(dto): Promise~ActividadDTO~
        +actualizar(id, dto): Promise~ActividadDTO~
        +obtenerTiposActividad(): Promise~TipoActividad[]~
    }

    class GestionarPrecios {
        -precioRepo: IPrecioInscripcionRepository
        +obtenerPrecios(): Promise~PrecioInscripcion[]~
        +obtenerPrecioVigente(): Promise~PrecioInscripcion | null~
        +crearPrecio(dto): Promise~PrecioInscripcion~
        +guardarPrecio(id, dto): Promise~PrecioInscripcion~
        +eliminarPrecio(id): Promise~void~
    }

    class LoginCpanelUseCase {
        -accesoRepo: IAccesoRepository
        -usuarioRepo: IUsuarioRepository
        -catalogoRepo: ICatalogoRepository
        +execute(credentials): Promise~AuthSessionDTO~
    }

    class ObtenerAccesoArchivo {
        -storageService: IStorageService
        +execute(ruta: string): Promise~string~
    }

    class ObtenerUsuariosForAdmin {
        -adminQueryService: IAdminQueryService
        +execute(page, limit, search?): Promise~PaginatedResult~UsuarioForAdminDTO~~
    }

    RegistrarUsuario ..> IUsuarioRepository
    RegistrarUsuario ..> IDepositoRepository
    RegistrarUsuario ..> IStorageService
    RegistrarUsuario ..> IEmailService
    RegistrarUsuario ..> IPdfService
    RegistrarUsuario ..> IActividadRepository
    RegistrarUsuario ..> IInscripcionActividadRepository

    RegistrarGrupoRapido ..> IUsuarioRepository
    RegistrarGrupoRapido ..> IDepositoRepository
    RegistrarGrupoRapido ..> IStorageService
    RegistrarGrupoRapido ..> IEmailService
    RegistrarGrupoRapido ..> IPdfService

    GenerarConstancia ..> IPdfService
    GenerarConstancia ..> IStorageService
    EnviarConfirmacion ..> IEmailService
    SolicitarFacturacion ..> IFacturacionRepository
    LoginCpanelUseCase ..> IAccesoRepository
    ObtenerAccesoArchivo ..> IStorageService
    ObtenerUsuariosForAdmin ..> IAdminQueryService
```

### 9.2 Descripción de Casos de Uso Principales

#### UC-01: Registrar Usuario (Inscripción Individual)

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Asistente (no autenticado, `/registro`)                                            |
| **Precondición**| El correo no está registrado previamente                                           |
| **Flujo**       | 1. Asistente llena wizard 3 pasos (`Datos Generales` → `Grupo` opcional → `Pago` + facturación opcional) + adjunta comprobante → 2. Validación Zod (registroSchema, depositoSchema, facturacionSchema, validarArchivo 5MB png/jpeg/pdf) → 3. `Email.create` duplicado check → 4. `ArchivoComprobante.create` → 5. Subir comprobante a `comprobantes/{uuid}.ext` (Supabase) → 6. `Usuario.create` (con `idTitulo`) → 7. `usuarioRepo.crear` → PK `ANI26-XXXX` generado por secuencia `usuarios_folio_seq` → 8. Generar password aleatorio 8 chars, `bcrypt.hash` + `accesoRepo.crear(correo, hash, USER, folio, nombreCompleto)` → 9. `Deposito.create` (con `proposito` default `EVENTO_PRINCIPAL`) → 10. `depositoRepo.crear` → 11. Si hay facturación → `Facturacion.create` → 12. Si `actividadesIds` → `inscripcionRepo.crearMuchasConValidacion(folio, ids)` (transacciones `FOR UPDATE`) → 13. Cargar catálogos (instituciones/titulos) → 14. `pdfService.generarConstanciaInscripcion` (GenericConstanciaTemplate) → 15. Subir a `constancias/{folio}.pdf` → 16. `emailService.enviarConfirmacionRegistro` con `password` incluido |
| **Postcondición**| Usuario + Acceso creados, comprobante y constancia en storage, correo enviado |
| **Error**       | Correo duplicado → `RegistroError.CORREO_DUPLICADO` · Archivo inválido → `ComprobanteError.TIPO_NO_PERMITIDO` |
| **DTO**         | `RegistroUsuarioDTO` (`src/application/dtos/RegistroUsuarioDTO.ts:31`) incluye `actividadesIds?: number[]` opcional |
| **Resultado**   | `ResultadoRegistro: { success, folio, urlConstancia, correo, passwordPlana }` |

#### UC-02: Registrar Grupo Rápido

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Usuario autenticado (responsable) en `/perfil/grupo/registro`                      |
| **Precondición**| Responsable existe (`buscarPorId(responsableId)`)                                  |
| **Flujo**       | 1. Responsable llena `miembros: {nombre, apellido}[]` + datos depósito + archivo único → 2. `ArchivoComprobante.create` → 3. `token = crypto.randomUUID()` → 4. Subir comprobante a `comprobantes_grupo/{token}.ext` (bucket `comprobantes`) → 5. `Deposito.create({ folioRegistro: responsableId, proposito: 'GRUPO_RAPIDO', ...})` → 6. Mapear miembros a `{correoDummy: grupo_{token}_{i}@temp.aniei.org, passwordHash: bcrypt(crypto.randomUUID())}` (mismo hash reutilizado) → 7. `usuarioRepo.crearGrupoTransaccional({ token, responsableId, institucionId, dependenciaId, estadoId, miembros })` → transacción Prisma: `grupos_registro.create` + loop miembros: `accesos.create` + `usuarios.create({ id_grupo_registro: grupo.id, id_institucion, dependencia, id_entidad_federativa, correoDummy })` + `accesos.update({folio_registro})` → 8. `pdfService.generarHojaRegistroGrupo({ token, nombres, responsableNombre })` (QR a `NEXT_PUBLIC_BASE_URL/grupo-completar/{token}`) → 9. `emailService.enviarConfirmacionGrupoRapido(responsable.correo, {nombreResponsable, token, totalMiembros}, pdfBuffer)` |
| **Postcondición**| Grupo y miembros dummy creados, depósito grupal asociado al responsable, PDF con QR generado y enviado al responsable |
| **Completar**   | Miembros acceden a `/grupo-completar/[token]` → lista pendientes (`correo.includes('@temp.aniei.org')`) → `/grupo-completar/[token]/usuario/[folio]` para proveer datos reales (correo, género, etc.) y password definitivo |
| **DTO**         | `RegistrarGrupoRapidoDTO` (`src/application/dtos/RegistrarGrupoRapidoDTO.ts:8`): `responsableId, miembros: {nombre, apellido}[], deposito, archivo` |
| **Costo**       | `total = costoBase + costoMiembro * nMiembros` (de `precioVigente` — `src/app/registro/components/RegistroForm.tsx:82`) |

#### UC-03: Generar Constancia

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Sistema (post-registro) o Admin (reenvío)                                          |
| **Flujo**       | 1. Obtener datos del usuario por folio → 2. `ReactPdfService.generarConstanciaInscripcion` (GenericConstanciaTemplate) → 3. Subir a `constancias/{folio}.pdf` (bucket `constancias`) → 4. Retornar URL interna |
| **Admin reenvío**| `reenviarConstanciaAction` en CPanel → `EnviarConfirmacion` descarga y adjunta vía `IEmailService.enviarConstancia` |

---

## 10. Diagramas de Secuencia

### 10.1 Registro Individual Completo (implementación real `src/application/use-cases/RegistrarUsuario.ts:35`)

```mermaid
sequenceDiagram
    actor A as Asistente
    participant CC as Client Component<br/>(RegistroForm)
    participant SA as Server Action<br/>(registrar-usuario.action)
    participant Val as Zod Schema<br/>(Validación)
    participant UC as RegistrarUsuario<br/>(Use Case)
    participant Dom as Usuario<br/>(Entity)
    participant Comp as Deposito<br/>(Entity)
    participant Repo as IUsuarioRepository<br/>(Prisma + Mapper)
    participant AccRepo as IAccesoRepository
    participant Store as IStorageService<br/>(Supabase)
    participant PDF as IPdfService<br/>(ReactPdf)
    participant Mail as IEmailService<br/>(Nodemailer)
    participant DB as PostgreSQL

    A->>CC: Llena wizard 3 pasos +<br/>comprobante (img/PDF)
    CC->>SA: submit (FormData + numMiembros)
    SA->>Val: validar registroSchema + depositoSchema
    Val-->>SA: RegistroUsuarioDTO ✓
    SA->>UC: execute(dto)

    UC->>Repo: buscarPorCorreo(dto.correo)
    Repo->>DB: SELECT ... WHERE correo = $1
    DB-->>Repo: null (no existe)
    Repo-->>UC: null ✓

    UC->>Store: subir("comprobantes/{uuid}.ext", fileBuffer, mime)
    Store-->>UC: "comprobantes/xxx.ext"

    UC->>Dom: Usuario.create(props) con idTitulo
    Dom-->>UC: usuario

    UC->>Repo: crear(usuario) → folio ANI26-0001
    Repo->>DB: INSERT INTO usuarios ... (folio generado por usuarios_folio_seq)
    DB-->>Repo: row
    Repo-->>UC: usuario persistido

    UC->>AccRepo: crear(email, bcrypt(random8), USER, folio, nombre)
    AccRepo->>DB: INSERT INTO accesos ...
    DB-->>AccRepo: acceso

    UC->>Comp: Deposito.create(folio, url, archivo, monto, proposito=EVENTO_PRINCIPAL)
    Comp-->>UC: deposito
    UC->>Store: depositRepo crear (INSERT depositos)

    alt dto.facturacion
        UC->>DB: INSERT INTO facturaciones
    end

    alt dto.actividadesIds
        UC->>DB: inscrip crearMuchasConValidacion FOR UPDATE por actividad
    end

    UC->>PDF: generarConstanciaInscripcion(datos)
    PDF-->>UC: pdfBuffer
    UC->>Store: subir("constancias/{folio}.pdf", buffer)
    Store-->>UC: "constancias/ANI26-0001.pdf"

    UC->>Mail: enviarConfirmacionRegistro(correo, {folio, institucion, password})
    UC-->>SA: { success, folio, correo, passwordPlana }
    SA-->>CC: state.success + folio
    CC-->>A: Pantalla confirmación + link /actividades y /perfil
```

### 10.2 Registro Grupal Rápido (implementación real `src/application/use-cases/RegistrarGrupoRapido.ts:22`)

```mermaid
sequenceDiagram
    actor R as Responsable (autenticado)
    participant CC as GrupoRapidoForm
    participant SA as Server Action<br/>(registrar-grupo)
    participant Val as Zod / create
    participant UC as RegistrarGrupoRapido
    participant Repo as IUsuarioRepository
    participant Store as IStorageService
    participant PDF as IPdfService
    participant Mail as IEmailService
    participant DB as PostgreSQL

    R->>CC: Ingresa N miembros {nombre, apellido}<br/>+ depósito único
    CC->>SA: submit (FormData)
    SA->>Val: validar archivo 5MB
    Val-->>SA: dto ✓
    SA->>UC: execute(dto: responsableId, miembros, deposito, archivo)

    UC->>Repo: buscarPorId(responsableId)
    Repo->>DB: SELECT usuarios WHERE folio_registro = $1
    DB-->>Repo: responsable
    Repo-->>UC: responsable ✓

    UC->>Store: subir("comprobantes_grupo/{token}.ext", buffer)
    Store-->>UC: urlComprobante

    UC->>Repo: crear depósito GRUPO_RAPIDO (folio=responsableId)

    UC->>UC: bcrypt hash genérico + mapeo miembros a correoDummy grupo_{token}_{i}@temp.aniei.org
    UC->>Repo: crearGrupoTransaccional(token, responsableId, institucionId, dependenciaId, estadoId, miembrosMapeados)
    Repo->>DB: BEGIN; INSERT grupos_registro; FOR EACH miembro: INSERT accesos + INSERT usuarios + UPDATE accesos.folio_registro; COMMIT
    DB-->>Repo: {usuariosIds, folios}
    Repo-->>UC: ids

    UC->>PDF: generarHojaRegistroGrupo({token, nombres, responsableNombre}) → QRCode.toDataURL(qrUrl)
    PDF-->>UC: pdfBuffer

    UC->>Mail: enviarConfirmacionGrupoRapido(responsable.correo, {nombre, token, totalMiembros}, pdfBuffer)
    UC-->>SA: { success, totalRegistrados, folios }
    SA-->>CC: confirmación + enlace /grupo-completar/{token}
```

### 10.3 Flujo del Server Action (Detalle Interno)

```mermaid
sequenceDiagram
    participant CC as Client Component
    participant SA as Server Action
    participant Container as DI Container
    participant UC as Use Case

    CC->>SA: formAction(formData)

    Note over SA: 1. Parsear y validar con Zod

    SA->>Container: getUsuarioRepository()
    Container-->>SA: PrismaUsuarioRepository
    SA->>Container: getEmailService()
    Container-->>SA: Nodemailer
    SA->>Container: getPdfService()
    Container-->>SA: ReactPdfService
    SA->>Container: getStorageService()
    Container-->>SA: SupabaseStorage

    SA->>UC: new RegistrarUsuario(repos, services)
    SA->>UC: execute(dto)
    UC-->>SA: ResultadoRegistro
    SA-->>CC: { success, data?, errors? }
```

---

## 11. Diagramas de Flujo

### 11.1 Flujo Principal de Inscripción

```mermaid
flowchart TD
    A([Inicio: Asistente accede a /registro]) --> B{Carga precios_inscripcion}

    B --> D[Wizard 3 pasos: Datos Generales<br/>+ Grupo opcional<br/>+ Pago]
    D --> F[Llenar: nombre, apellido, correo,<br/>teléfono, género, carrera,<br/>dependencia, título, institución,<br/>estado + miembros {nombre,apellido} si grupo activo]
    F --> F2[Total = costoBase + costoMiembro × N<br/>Monto auto-rellenado si no tocado]

    F2 --> G3[Adjuntar comprobante<br/>(png/jpeg/pdf 5MB)]
    G3 --> H{¿Validación OK?}
    H -->|No| I[Mostrar errors en form + _form]
    I --> F

    H -->|Sí| J{"¿Correo ya<br/>registrado?"}
    J -->|Sí| K[RegistroError CORREO_DUPLICADO]
    K --> F
    J -->|No| L[Subir comprobante a storage<br/>comprobantes/{uuid}.ext]

    L --> M["Crear Usuario (idTitulo)<br/>+ Acceso bcrypt USER<br/>+ Deposito EVENTO_PRINCIPAL<br/>(+ Facturacion si activa)<br/>(+ miembros → crearGrupoTransaccional si grupo activo en registro)"]

    M --> N[Persistir folio ANI26-XXXX + acceso]

    N --> O[Generar constancia PDF (GenericConstanciaTemplate)]
    O --> P[Subir constancia constancias/{folio}.pdf]

    P --> Q[Enviar correo confirmación con password]

    Q --> R([Mostrar confirmación con folio<br/>+ links a /actividades y /perfil])
```

### 11.2 Flujo de Grupo Rápido (Autenticado)

```mermaid
flowchart TD
    A[Usuario autenticado /perfil/grupo/registro] --> B[Llena miembros nombre+apellido<br/>+ depósito único]
    B --> C[Validar archivo]
    C --> D[Token UUID]
    D --> E[Subir comprobante comprobantes_grupo/{token}]
    E --> F[Crear depósito propósito GRUPO_RAPIDO]
    F --> G[Crear grupo transaccional<br/>grupos_registro + usuarios dummy + accesos dummy]
    G --> H[Generar PDF HojaRegistroGrupoTemplate<br/>con QR → /grupo-completar/{token}]
    H --> I[Enviar email al responsable con PDF adjunto]
    I --> J[Miembros completan registro<br/>/grupo-completar/{token}/usuario/{folio}]
```

### 11.3 Flujo de Generación de Constancia PDF

```mermaid
flowchart LR
    A[Datos del<br/>Usuario] --> B[IPdfService<br/>.generarConstancia]
    B --> C[Buffer PDF<br/>en memoria]
    C --> D[IStorageService<br/>.subir constancias/{folio}.pdf]
    D --> E[URL interna]
    C --> F[IEmailService<br/>.enviarConstancia<br/>(solo vía CPanel)]
    F --> G[Correo con<br/>PDF adjunto]
```

---

## 12. Módulo de Registro Grupal (Grupo Rápido)

### 12.1 Diseño Real Implementado

El registro grupal implementado **no es el feature flag `ENABLE_GROUP_REGISTRATION` descrito originalmente** sino el flujo **Grupo Rápido autenticado**:

| Aspecto | Implementación real |
|---------|---------------------|
| **Ruta** | `/perfil/grupo/registro` (requiere sesión `USER`/`ADMIN`, protegida por `proxy.ts:14`) + `/grupo-completar/[token]` público para completar |
| **Entidad BD** | `grupos_registro (id, token unique, folio_registro_responsable, fecha_registro)` + `usuarios.id_grupo_registro` FK |
| **Use Case** | `RegistrarGrupoRapido` (`src/application/use-cases/RegistrarGrupoRapido.ts:13`) — solo 5 dependencias (sin catálogo) |
| **Repositorio** | `PrismaUsuarioRepository.crearGrupoTransaccional` (`src/infrastructure/repositories/PrismaUsuarioRepository.ts:58`) transacción con `grupos_registro` + `accesos` + `usuarios` |
| **Herencia** | `id_institucion`, `id_entidad_federativa`, `dependencia` (string) e `idTitulo` (implícito: miembros se crean sin `id_titulo`, lo completan después) heredados del responsable |
| **Miembros** | Solo `{nombre, apellido}` en `RegistrarGrupoRapidoDTO`; `correoDummy = grupo_{token}_{i}@temp.aniei.org`; `passwordHash` genérico reutilizado |
| **Comprobante** | Un solo archivo a `comprobantes_grupo/{token}.ext` → `depositos` con `proposito='GRUPO_RAPIDO'` y `folio_registro = responsableId` |
| **Feedback costo** | `RegistroForm.tsx:82` `total = costoBase + costoMiembro * nMiembros` (de `precios_inscripcion` vigente); en grupo rápido el costo se muestra en `GrupoRapidoForm` |
| **PDF** | `ReactPdfService.generarHojaRegistroGrupo` (`src/infrastructure/services/pdf/ReactPdfService.ts:55`) usa `qrcode` → `QRCode.toDataURL(qrUrl)` donde `qrUrl = NEXT_PUBLIC_BASE_URL/grupo-completar/{token}` → `HojaRegistroGrupoTemplate` |
| **Correo** | `NodemailerEmailService.enviarConfirmacionGrupoRapido` adjunta PDF + link emergencia |
| **Completar** | `/grupo-completar/[token]/page.tsx:37` separa `pendientes` (`correo.includes('@temp.aniei.org')`) vs `completados`; cada pendiente linka a `/grupo-completar/{token}/usuario/{folio}` |

El registro grupal desde `/registro` (wizard) también permite añadir `miembros` inline (`numMiembros` + `miembro_{i}_nombre`/`apellido`) y los crea vía el mismo `crearGrupoTransaccional` dentro de `registrar-usuario.action.ts`.

#### Usuario ya registrado como responsable

No hay lógica de `responsableYaRegistrado` en la implementación actual de `GrupoRegistro.create` del dominio; en cambio, `RegistrarGrupoRapido` **exige** que el responsable ya exista (`buscarPorId`) y nunca lo recrea. La vieja entidad `GrupoRegistro` con flag `responsableYaRegistrado` permanece en dominio pero no se usa en el flujo rápido actual.

#### Herencia de Campos en Grupo (real)

| Campo heredado       | Fuente                 |
|----------------------|------------------------|
| `id_institucion`     | `responsable.idInstitucion` |
| `id_entidad_federativa` | `responsable.idEntidadFederativa` |
| `dependencia`        | `responsable.dependencia` (string 128) |
| `idTitulo`           | No se setea en creación inicial (null); el miembro lo elige al completar |

Campos **individuales** por miembro:
| Campo | Origen |
|-------|--------|
| `nombre`, `apellido` | Input del responsable |
| `correo` real | Proveído al completar (`/grupo-completar/.../usuario/...`) |
| `genero`, `carrera`, `telefono`, `idTitulo` | Proveídos al completar |

### 12.2 Diagrama de la Entidad GrupoRegistro (dominio)

```mermaid
classDiagram
    class GrupoRegistro {
        -responsable: Usuario
        -miembros: Usuario[]
        -idInstitucionCompartida: number
        -idEntidadCompartida: number
        -responsableYaRegistrado: boolean

        +static create(responsable: Usuario, miembrosData: MiembroInput[], responsableYaRegistrado?: boolean): GrupoRegistro
        +obtenerTodos(): Usuario[]
        +obtenerNuevosRegistros(): Usuario[]
        +totalIntegrantes(): number
        +esResponsableExistente(): boolean
    }

    class MiembroInput {
        <<interface>>
        +nombre: string
        +apellido: string
        +correo: string
        +genero: Genero
        +carrera: string | null
    }

    note for GrupoRegistro "En flujo rápido real: MiembroInput es {nombre, apellido}<br/>y se usan correoDummy @temp.aniei.org<br/>La entidad de dominio no se usa en RegistrarGrupoRapido actual"

    GrupoRegistro --> MiembroInput : recibe datos mínimos
```

---

## 13. Módulo de Actividades

### 13.1 Visión General

El sistema permite la **inscripción a actividades** del congreso (talleres, cursos, conferencias) tanto en el flujo de registro individual (`actividadesIds` en `RegistroUsuarioDTO`) como desde `/actividades/checkout` para usuarios ya registrados. El CPanel permite CRUD de actividades y gestión de **ponentes**.

### 13.2 Modelo de Datos (Prisma `src/prisma/schema.prisma:32`)

```
actividades (id_actividad, nombre, cupo_maximo, fecha_inicio, fecha_fin, id_tipo_actividad, id_institucion_sede, id_sala, costo)
├── tipo_actividad (id_tipo_actividad, clave, descripcion, maneja_equipos, genera_constancia_participante)
├── inscripcion_actividades (id_inscripcion, folio_registro, id_actividad, fecha_inscripcion, url_constancia) UNIQUE(folio_registro, id_actividad)
├── actividad_ponentes (id_actividad, folio_registro_ponente, rol, url_constancia) PK(id_actividad, folio_registro_ponente) → usuarios
├── asistencia_actividades (id_asistencia, folio_registro, id_actividad, fecha_hora_marcaje) UNIQUE(folio_registro, id_actividad)
└── equipos / equipo_integrantes (para actividades con manejaEquipos)
```

### 13.3 Tipos de Actividad

| Propiedad                    | Descripción                                             |
|------------------------------|---------------------------------------------------------|
| `clave`                      | Identificador único del tipo (e.g., "TALLER", "CURSO")  |
| `manejaEquipos`              | Si `true`, permite formar equipos de participantes       |
| `generaConstanciaParticipante` | Si `true`, se genera constancia de participación         |

### 13.4 Puertos del Módulo de Actividades

| Puerto                              | Responsabilidad                                        |
|-------------------------------------|--------------------------------------------------------|
| `IActividadRepository`              | CRUD de actividades + listado de tipos + DTO con `cupoOcupado` y `ponentes` |
| `IInscripcionActividadRepository`   | `crearMuchas`, `crearMuchasConValidacion` (FOR UPDATE), `obtenerPorActividad`, `obtenerIdsPorUsuario`, `actualizarUrlConstancia` |
| `IPonentesRepository`               | Gestión de ponentes por actividad                      |

### 13.5 Casos de Uso de Actividades

| Caso de Uso                          | Descripción                                            |
|--------------------------------------|--------------------------------------------------------|
| `GestionarActividades`               | CRUD de actividades desde CPanel                       |
| `GenerarConstanciaParticipanteUseCase` | Genera PDF de constancia de participación             |
| `GenerarConstanciaPonenteUseCase`    | Genera PDF de constancia de ponencia                   |
| `EnviarConstanciaParticipanteUseCase` | Envía constancia de participación por email            |
| `EnviarConstanciaPonenteUseCase`     | Envía constancia de ponencia por email                 |

### 13.6 Inscripción a Actividades (con control de concurrencia)

- **Flujo individual:** `RegistroUsuarioDTO.actividadesIds?: number[]` → `RegistrarUsuario` llama `inscripcionRepo.crearMuchasConValidacion(folio, ids)` (`src/application/use-cases/RegistrarUsuario.ts:118`).
- **Flujo checkout:** `/actividades/checkout` para usuarios ya registrados (requiere auth vía `proxy.ts`).
- **Validación de cupo atómica** (`src/infrastructure/repositories/PrismaInscripcionActividadRepository.ts:59`): por cada `idActividad` abre transacción, `SELECT cupo_maximo FROM actividades WHERE id_actividad=$1 FOR UPDATE` (bloqueo pesimista), `COUNT(*) FROM inscripcion_actividades WHERE id_actividad=$1`, si `count >= cupo_maximo` → `SIN_CUPO`, sino `INSERT`. Retorna `{ok, sinCupo}`.
- Costo de actividad (`actividades.costo`) informativo; el monto pagado sigue siendo el del `depositos` del evento principal.

---

## 14. Módulo de Autenticación y CPanel

### 14.1 Autenticación con Auth.js (NextAuth v5)

La autenticación usa **NextAuth v5** con **Credentials** y tabla `accesos` (bcrypt):

```
app/login/                  → Formulario login (público, redirige a /cpanel o /perfil si ya autenticado)
app/api/auth/[...nextauth]/ → Handlers NextAuth (JWT)
proxy.ts                    → Middleware Auth (NextAuth) — protege /cpanel, /perfil, /actividades, /registro
auth.ts / auth.config.ts    → Configuración (session jwt, callbacks jwt/session, pages signIn /login)
```

**Flujo:**
1. Usuario/Administrador en `/login` ingresa email + password.
2. `auth.ts:16` `authorize(credentials)` busca `prisma.accesos.findUnique({where:{email}})`, valida `bcrypt.compare`.
3. Retorna `{id, email, name, role: accesos.rol}`.
4. `auth.config.ts:13` `jwt` guarda `token.role`, `session` expone `session.user.role`.
5. `proxy.ts:7` `auth((req)=>{...})` aplica reglas: `/login` redirige si ya logueado; `/cpanel` requiere `role==='ADMIN'`; `/perfil` y `/actividades` requieren login; `/registro` redirige si ya logueado.

**Entidad `Acceso` (`src/core/entities/Acceso.ts:1`):**
```typescript
class Acceso {
  idAcceso: number; email: string; rol: string; // "ADMIN" | "USER"
  nombre: string | null; authId: string | null;
  isAdmin(): boolean { return rol.toLowerCase() === 'admin'; }
}
```

**Puerto `IAccesoRepository` (`src/application/ports/IAccesoRepository.ts:5`):**
```typescript
interface IAccesoRepository {
  buscarPorEmail(email: string): Promise<Acceso | null>;
  crear(email: string, passwordHash: string, rol: string, folioRegistro?: string, nombre?: string): Promise<Acceso>;
}
```

**Adaptador `AuthJsAuthService`:** Wrapper sobre `auth()`/`signIn`/`signOut` (hexagonal).

### 14.2 Panel de Administración (CPanel)

El CPanel (`/cpanel`) es dashboard protegido (`proxy.ts:37` requiere `ADMIN`):

| Ruta                       | Funcionalidad                                              |
|----------------------------|------------------------------------------------------------|
| `/cpanel`                  | Gestión de usuarios: búsqueda insensible, paginación, reenvío constancia, URL firmada de comprobante |
| `/cpanel/actividades`      | CRUD de actividades                                        |
| `/cpanel/actividades/[id]` | Detalle de actividad + gestión de ponentes                 |
| `/cpanel/configuracion`    | Precios escalonados (`GestionarPrecios`)                   |
| `/cpanel/usuarios/[folio]` | Detalle de depósitos del usuario                          |

**Funcionalidades:**
- **Búsqueda y paginación** (`PrismaAdminQueryService.obtenerUsuariosForAdmin` con `OR contains insensitive` y `where: proposito='EVENTO_PRINCIPAL'`).
- **Reenvío de constancias** (`reenviarConstanciaAction` → `EnviarConfirmacion` vía CPanel).
- **Gestión de actividades** (`GestionarActividades`).
- **Gestión de ponentes** (`IPonentesRepository`).
- **Gestión de precios** (`GestionarPrecios` con límite 3 niveles).
- **Acceso a archivos protegidos** (`obtenerUrlArchivoAction` → `ObtenerAccesoArchivo` → `SupabaseStorageService.getAccess` con `createSignedUrl(5min)`).

### 14.3 Servicio de Consultas Admin

```typescript
// src/application/ports/IAdminQueryService.ts:4
interface IAdminQueryService {
  obtenerUsuariosForAdmin(page: number, limit: number, search?: string): Promise<PaginatedResult<UsuarioForAdminDTO>>;
}
// UsuarioForAdminDTO: folioRegistro, nombreCompleto, correo, telefono, institucion, tipoUsuario (de titulos), fechaRegistro, deposito {monto, fecha, referencia, archivo:{ruta}}
```

---

## 15. Estrategia de Infraestructura Intercambiable

### 15.1 Mapa de Proveedores

```mermaid
graph LR
    subgraph Puertos["Puertos (Interfaces)"]
        P1["IUsuarioRepository"]
        P2["IEmailService"]
        P3["IPdfService"]
        P4["IStorageService"]
        P5["IAuthService"]
        P6["IActividadRepository"]
        P7["IPrecioInscripcionRepository"]
    end

    subgraph Actual["Adaptadores Actuales"]
        A1["PrismaUsuarioRepo<br/>(PrismaPg + Data Mapper)"]
        A2["NodemailerEmailService<br/>(Gmail SMTP)"]
        A3["ReactPdfService<br/>(GenericConstancia + QR)"]
        A4["SupabaseStorageService<br/>(buckets)"]
        A5["AuthJsAuthService<br/>(NextAuth v5 + bcrypt)"]
        A6["PrismaActividadRepo"]
        A7["PrismaPrecioRepo"]
    end

    subgraph Futuro["Adaptadores Futuros"]
        F1["DrizzleUsuarioRepo"]
        F2["SendGridEmailService"]
        F3["PuppeteerPdfService"]
        F4["S3StorageService"]
        F5["SupabaseAuthService"]
        F6["DrizzleActividadRepo"]
    end

    P1 -.-> A1
    P1 -.-> F1
    P2 -.-> A2
    P2 -.-> F2
    P3 -.-> A3
    P3 -.-> F3
    P4 -.-> A4
    P4 -.-> F4
    P5 -.-> A5
    P5 -.-> F5
    P6 -.-> A6
    P6 -.-> F6
```

### 15.2 Container Actual (`src/infrastructure/config/container.ts:1`)

```typescript
import { prisma } from "@/infrastructure/database/client";

export function getUsuarioRepository(): IUsuarioRepository {
    return new PrismaUsuarioRepository(prisma);
}
export function getDepositoRepository(): IDepositoRepository {
    return new PrismaDepositoRepository(prisma);
}
export function getFacturacionRepository(): IFacturacionRepository {
    return new PrismaFacturacionRepository(prisma);
}
export function getCatalogoRepository(): ICatalogoRepository {
    return new PrismaCatalogoRepository(prisma);
}
export function getAccesoRepository(): IAccesoRepository {
    return new PrismaAccesoRepository(prisma);
}
export function getActividadRepository(): IActividadRepository {
    return new PrismaActividadRepository(prisma);
}
export function getInscripcionActividadRepository(): IInscripcionActividadRepository {
    return new PrismaInscripcionActividadRepository(prisma);
}
export function getPonentesRepository(): IPonentesRepository {
    return new PrismaPonentesRepository(prisma);
}
export function getPrecioInscripcionRepository(): IPrecioInscripcionRepository {
    return new PrismaPrecioInscripcionRepository(prisma);
}
export function getEmailService(): IEmailService {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    const from = process.env.EMAIL_FROM || user;
    if (!user || !pass || !from) throw new Error('GMAIL_USER, GMAIL_APP_PASSWORD y EMAIL_FROM deben estar configuradas');
    return new NodemailerEmailService(user, pass, from);
}
export function getPdfService(): IPdfService { return new ReactPdfService(); }
export function getStorageService(): IStorageService {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas');
    return new SupabaseStorageService(url, key);
}
export function getAdminQueryService(): IAdminQueryService { return new PrismaAdminQueryService(prisma); }
export function getAuthService(): IAuthService { return new AuthJsAuthService(); }
```

### 15.3 Escenarios de Migración

| Escenario                         | Qué cambia                              | Qué NO cambia                  |
|-----------------------------------|------------------------------------------|---------------------------------|
| Supabase → VPS con PostgreSQL     | `DATABASE_URL` en `.env`                 | Use Cases, Domain, Presentation |
| Prisma → Drizzle                  | Repos, Mappers, esquema ORM              | Use Cases, Domain, Presentation |
| Nodemailer → SendGrid                 | Nuevo adapter `SendGridEmailService`     | Use Cases, Domain, Presentation |
| Supabase Storage → S3             | Nuevo adapter `S3StorageService`         | Use Cases, Domain, Presentation |
| Agregar nuevo proveedor de PDF    | Nuevo adapter implementando `IPdfService`| Use Cases, Domain, Presentation |
| Cambiar lógica de precios         | `GestionarPrecios` + `IPrecioInscripcionRepository` | Dominio base |
| Nuevo flujo grupal                | Adaptar `RegistrarGrupoRapido` + `crearGrupoTransaccional` | Resto |

---

## 16. Data Mapper Pattern (ORM ↔ Dominio)

### 16.1 Concepto

El **Data Mapper** aísla el dominio del ORM. Cada Mapper traduce entre dos mundos:

- **`toDomain()`**: Prisma row → Entidad de dominio (con Value Objects).
- **`toPersistence()`**: Entidad → Input de creación Prisma.

El dominio **nunca** importa tipos de Prisma. Solo repositorios conocen ambos mundos.

```
┌──────────────┐     toDomain()      ┌──────────────────┐
│ PrismaClient │ ──────────────────▶  │ Entidad Dominio  │
│  (query)     │                      │ (Value Objects)  │
│              │ ◀──────────────────  │                  │
└──────────────┘   toPersistence()    └──────────────────┘
         ▲                                     ▲
         │                                     │
    Infraestructura                        Dominio
    (conoce Prisma)                   (puro TypeScript)
```

### 16.2 Diagrama de Flujo del Data Mapper

```mermaid
sequenceDiagram
    participant UC as Use Case
    participant Repo as PrismaUsuarioRepo
    participant Mapper as UsuarioMapper
    participant Prisma as PrismaClient
    participant DB as PostgreSQL

    Note over UC,DB: LECTURA: buscarPorCorreo()
    UC->>Repo: buscarPorCorreo(email)
    Repo->>Prisma: prisma.usuarios.findUnique({ where: { correo } })
    Prisma->>DB: SELECT * FROM usuarios WHERE correo = $1
    DB-->>Prisma: row (PrismaUsuario)
    Prisma-->>Repo: prismaUsuario
    Repo->>Mapper: toDomain(prismaUsuario)
    Note over Mapper: Crea Value Objects:<br/>Email.create(), Telefono.create(),<br/>FolioRegistro.create(), etc.
    Mapper-->>Repo: Usuario (entidad dominio)
    Repo-->>UC: Usuario

    Note over UC,DB: ESCRITURA: crear()
    UC->>Repo: crear(usuario)
    Repo->>Mapper: toPersistence(usuario)
    Note over Mapper: Extrae valores primitivos<br/>de los Value Objects
    Mapper-->>Repo: PrismaUsuarioCreateInput
    Repo->>Prisma: prisma.usuarios.create({ data })
    Prisma->>DB: INSERT INTO usuarios ...
    DB-->>Prisma: row insertado
    Prisma-->>Repo: prismaUsuario
    Repo->>Mapper: toDomain(prismaUsuario)
    Mapper-->>Repo: Usuario (con id asignado)
    Repo-->>UC: Usuario
```

### 16.3 Ejemplo Real de un Mapper

```typescript
// src/infrastructure/mappers/UsuarioMapper.ts:8
import { usuarios } from "@/generated/prisma/client";
import { Usuario } from "@/core/entities/Usuario";
import { Email } from "@/core/value-objects/Email";
import { Telefono } from "@/core/value-objects/Telefono";
import { CodigoBarras } from "@/core/value-objects/CodigoBarras";
import { Genero } from "@/core/enums/Genero";

export class UsuarioMapper {
  static toDomain(raw: usuarios): Usuario {
    return Usuario.create({
      folioRegistro: raw.folio_registro,
      codigoBarras: raw.codigo_barras ? CodigoBarras.create(raw.codigo_barras) : null,
      nombre: raw.nombre, apellido: raw.apellido,
      correo: Email.create(raw.correo),
      telefono: raw.telefono ? Telefono.create(raw.telefono, raw.lada, raw.extension) : null,
      genero: (raw.genero as Genero) ?? Genero.OTRO,
      carrera: raw.carrera, dependencia: raw.dependencia,
      idTitulo: raw.id_titulo ?? 0,
      idInstitucion: raw.id_institucion ?? 0,
      idEntidadFederativa: raw.id_entidad_federativa ?? 0,
      verificado: raw.verificado ?? false,
      fechaRegistro: raw.fecha_registro ?? new Date(),
    });
  }
  static toPersistence(usuario: Usuario) {
    return {
      ...(usuario.folioRegistro ? { folio_registro: usuario.folioRegistro.toString() } : {}),
      ...(usuario.codigoBarras ? { codigo_barras: usuario.codigoBarras.toString() } : {}),
      nombre: usuario.nombre, apellido: usuario.apellido,
      correo: usuario.correo.toString(),
      telefono: usuario.telefono?.getNumero() ?? null,
      lada: usuario.telefono?.getLada() ?? null,
      extension: usuario.telefono?.getExtension() ?? null,
      genero: usuario.genero as string,
      carrera: usuario.carrera, dependencia: usuario.dependencia,
      id_titulo: usuario.idTitulo,
      id_institucion: usuario.idInstitucion,
      id_entidad_federativa: usuario.idEntidadFederativa,
      verificado: usuario.verificado,
    };
  }
}
```

### 16.4 Ejemplo Real de un Repositorio con Prisma + Mapper

```typescript
// src/infrastructure/repositories/PrismaUsuarioRepository.ts:8
import { PrismaClient } from "@/generated/prisma/client";
import type { IUsuarioRepository } from "@/application/ports/IUsuarioRepository";
import { UsuarioMapper } from "@/infrastructure/mappers/UsuarioMapper";

export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async crear(usuario: Usuario): Promise<Usuario> {
    const data = UsuarioMapper.toPersistence(usuario);
    const created = await this.prisma.usuarios.create({ data });
    return UsuarioMapper.toDomain(created);
  }
  async buscarPorCorreo(correo: Email): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({ where: { correo: correo.toString() } });
    return found ? UsuarioMapper.toDomain(found) : null;
  }
  async buscarPorFolio(folio: FolioRegistro): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({ where: { folio_registro: folio.toString() }, include: { accesos: true } });
    return found ? UsuarioMapper.toDomain(found) : null;
  }
  async crearGrupoTransaccional(data) {
    return this.prisma.$transaction(async (tx) => {
      const grupo = await tx.grupos_registro.create({ data: { token: data.token, responsable: { connect: { folio_registro: data.responsableId } } } });
      const usuariosIds: string[] = []; const folios: string[] = [];
      for (const m of data.miembros) {
        const newAcceso = await tx.accesos.create({ data: { email: m.correoDummy, nombre: `${m.nombre} ${m.apellido}`, password: m.passwordHash, rol: 'USER' } });
        const newUsuario = await tx.usuarios.create({ data: { nombre: m.nombre, apellido: m.apellido, correo: m.correoDummy, id_grupo_registro: grupo.id, id_institucion: data.institucionId, dependencia: data.dependenciaId, id_entidad_federativa: data.estadoId } });
        await tx.accesos.update({ where: { id_acceso: newAcceso.id_acceso }, data: { folio_registro: newUsuario.folio_registro } });
        usuariosIds.push(newUsuario.folio_registro); folios.push(newUsuario.folio_registro);
      }
      return { usuariosIds, folios };
    });
  }
}
```

### 16.5 Resumen Visual

```mermaid
graph LR
    subgraph Domain["🧠 Dominio (Puro)"]
        E["Usuario<br/>Deposito<br/>Facturacion"]
        VO["Email · Monto<br/>FolioRegistro · Telefono"]
    end

    subgraph Mapper["🔄 Data Mappers"]
        M["UsuarioMapper<br/>DepositoMapper<br/>FacturacionMapper"]
    end

    subgraph Infra["🔌 Infraestructura"]
        R["PrismaUsuarioRepo<br/>PrismaDepositoRepo"]
        P["PrismaClient + PrismaPg"]
        DB[("PostgreSQL")]
    end

    R -->|"toPersistence()"| M
    M -->|"datos primitivos"| P
    P -->|"SQL (pg Pool)"| DB
    DB -->|"rows"| P
    P -->|"PrismaTypes"| M
    M -->|"toDomain()"| R
    R -->|"Entidades Dominio"| E

    style Domain fill:#1a1a2e,stroke:#e94560,color:#fff
    style Mapper fill:#16213e,stroke:#0f3460,color:#fff
    style Infra fill:#0f3460,stroke:#533483,color:#fff
```

---

## 17. Decisiones de Diseño (ADRs)

### ADR-01: Server Actions como Controllers

- **Contexto:** Next.js App Router ofrece Server Actions.
- **Decisión:** Usar Server Actions como "controladores".
- **Razón:** Elimina fetch manual, tipado end-to-end, reduce boilerplate.
- **Consecuencia:** Solo validan input y orquestan Use Case; nunca lógica de negocio.

### ADR-02: ORM + Data Mapper Pattern

- **Contexto:** Acceso a BD con type-safety sin acoplar dominio al ORM.
- **Decisión:** Prisma + `@prisma/adapter-pg` (PrismaPg + `pg` Pool) en infraestructura, con Data Mapper por entidad.
- **Razón:** `client.ts:1` usa `DATABASE_URL` (pooler 6543) + `PrismaPg`. El Mapper aísla dominio.
- **Consecuencia:** Cambiar ORM solo afecta repos/mappers.

### ADR-03: Feature Flag para Registro Grupal → Grupo Rápido Autenticado

- **Contexto:** El diseño original preveía `ENABLE_GROUP_REGISTRATION`. La implementación real reemplaza eso por flujo **Grupo Rápido** autenticado con token/QR.
- **Decisión:** Grupo rápido requiere sesión (`/perfil/grupo/registro`), genera `grupos_registro.token` y miembros dummy; completan vía `/grupo-completar/[token]`.
- **Consecuencia:** No hay flag; el módulo es independiente y no interfiere con `/registro` (que también permite `miembros` inline).

### ADR-04: Value Objects para Validación de Dominio

- **Contexto:** Campos con reglas intrínsecas.
- **Decisión:** `Email`, `Monto`, `FolioRegistro`, `ArchivoComprobante` (5 MB, png/jpeg/pdf) validan en `create`.
- **Consecuencia:** Doble validación Zod + VO.

### ADR-05: Generación de PDF en el Servidor

- **Contexto:** Constancias con template consistente.
- **Decisión:** `@react-pdf/renderer` + `GenericConstanciaTemplate` + `HojaRegistroGrupoTemplate` con `qrcode` para QR.
- **Consecuencia:** Buffer en memoria → upload a Supabase Storage + adjunto a email.

### ADR-06: Comprobante de Pago como Archivo Adjunto en Entidad Deposito

- **Contexto:** Tabla `depositos` con archivo (no captura manual) + `comprobantes_pago` eliminada.
- **Decisión:** `Deposito` incluye `ArchivoComprobante` VO + `archivo_url/nombre/mime/tamanio` + `proposito` (`EVENTO_PRINCIPAL` vs `GRUPO_RAPIDO`) + `notas`.
- **Consecuencia:** Buckets `comprobantes`/`constancias`; URLs firmadas 5 min vía `getAccess`.

### ADR-07: tipo_usuario No Se Hereda — Herencia Real es Institución/Dependencia/Estado

- **Contexto:** Diseño original heredaba `id_tipo_usuario`. Implementación real hereda `id_institucion`, `id_entidad_federativa`, `dependencia`, (y `idTitulo` implícito). `MiembroInput` del flujo rápido es solo `{nombre, apellido}`.
- **Decisión:** Cada miembro completa su `idTitulo`/`genero`/`carrera` al finalizar registro vía token.
- **Consecuencia:** `GrupoRegistro` de dominio con `MiembroInput` completo no se usa en flujo rápido actual.

### ADR-08: Usuario Ya Registrado como Responsable de Grupo → Flujo Grupo Rápido Exige Responsable Existente

- **Contexto:** Flujo rápido actual **exige** `responsableId` existente; no crea responsable nuevo. `RegistrarGrupoRapido.ts:24` lanza si no encuentra.
- **Decisión:** No hay variante "responsable nuevo" en grupo rápido; el responsable debe estar registrado previamente (creado vía `RegistrarUsuario`).
- **Consecuencia:** `crearGrupoTransaccional` solo inserta miembros dummy.

### ADR-09: Delegación del Envío de Constancias al Administrador

- **Contexto:** Registro público solo envía confirmación con password; constancia queda en storage para reenvío manual.
- **Decisión:** `RegistrarUsuario` genera y sube PDF pero `enviarConstancia` solo se invoca desde CPanel (`reenviarConstanciaAction` → `EnviarConfirmacion`).
- **Consecuencia:** Menor latencia en registro público.

### ADR-10: Migración de Autenticación a Auth.js (NextAuth)

- **Contexto:** Antes Supabase Auth; ahora Auth.js Credentials + `accesos.password` (bcrypt).
- **Decisión:** `auth.ts` usa `Credentials` + `bcrypt.compare`; `proxy.ts` (no `middleware.ts`) protege rutas con `auth()` JWT.
- **Consecuencia:** Tabla `accesos` con `folio_registro` nullable + `password`; `proxy.ts` centraliza redirecciones `/login`, `/cpanel`, `/perfil`, `/actividades`, `/registro`.

### ADR-11: Migración de PK Numérica a Folio String (`folio_registro`)

- **Contexto:** PK `folio_registro VARCHAR(15)` con default `('ANI26-'::text || lpad(nextval('usuarios_folio_seq'::regclass)::text,4,'0'::text))`.
- **Decisión:** Todas las FK (`depositos`, `facturaciones`, `accesos`, `inscripcion_actividades`, `actividad_ponentes`, `grupos_registro.folio_registro_responsable`) referencian `folio_registro`.
- **Consecuencia:** Repos operan con `string`; `FolioRegistro` VO valida formato `ANI26-XXXX`.

### ADR-12: Nodemailer como Proveedor de Correo

- **Contexto:** Gmail SMTP vía `NodemailerEmailService` (`src/infrastructure/services/email/NodemailerEmailService.ts:13` con `service:'gmail'`).
- **Decisión:** 7 métodos en `IEmailService` (`src/application/ports/IEmailService.ts:35`): confirmación registro/actividades, constancia ponente/participante, notificación ponente, grupo rápido.
- **Consecuencia:** Container usa `GMAIL_USER` + `GMAIL_APP_PASSWORD`.

### ADR-13: Registro de Actividades como Dato Opcional en RegistroUsuarioDTO + Validación de Cupo con FOR UPDATE

- **Contexto:** Actividades opcionales con cupo limitado.
- **Decisión:** `RegistroUsuarioDTO.actividadesIds?: number[]` + `PrismaInscripcionActividadRepository.crearMuchasConValidacion` con `SELECT ... FOR UPDATE` y `COUNT` atómico por actividad.
- **Consecuencia:** Retorna `{ok, sinCupo}`; no bloquea otras actividades si una está llena.

### ADR-14: Precios Escalonados (`precios_inscripcion`)

- **Contexto:** Costo dinámico según fecha límite.
- **Decisión:** Modelo `precios_inscripcion (id, fecha_limite, costo, costo_miembro, orden, activo)` + `IPrecioInscripcionRepository` + `GestionarPrecios` (máx 3 niveles, validación costo>0) + UI en `/registro` y `/cpanel/configuracion` (`src/shared/types/catalogos.ts:22`, `src/infrastructure/repositories/PrismaPrecioInscripcionRepository.ts:31`). `RegistroForm.tsx:82` calcula `total = costoBase + costoMiembro * nMiembros` y auto-rellena `monto`.
- **Consecuencia:** CPanel puede crear/actualizar/eliminar precios; `obtenerVigente()` usa `fecha_limite <= ahora` order desc.

### ADR-15: Proxy como Middleware de Auth (Next.js 16)

- **Contexto:** Next.js 16 renombra `middleware.ts` a `proxy.ts`.
- **Decisión:** `src/proxy.ts:1` usa `NextAuth(authConfig)` y `matcher: '/((?!api|_next/static|...).*)'` para centralizar protección.
- **Consecuencia:** No hay `middleware.ts`; toda lógica de auth vive en `proxy.ts` + `auth.config.ts`.

---

## Apéndice A: Mapeo Dominio ↔ Base de Datos

| Entidad de Dominio   | Tabla PostgreSQL       | Notas                                        |
|-----------------------|------------------------|----------------------------------------------|
| `Usuario`             | `usuarios`             | PK `folio_registro ANI26-XXXX` (secuencia)   |
| `Deposito`            | `depositos`            | `archivo_url/nombre/mime/tamanio` + `proposito` + `notas` |
| `Facturacion`         | `facturaciones`        | Datos fiscales                               |
| `GrupoRegistro`       | `grupos_registro` + `usuarios.id_grupo_registro` | Token + miembros dummy |
| `Acceso`              | `accesos`              | `email unique`, `password` bcrypt, `folio_registro` nullable, `rol` |
| `Titulo` (catálogo)   | `titulos`              | FK de `usuarios.id_titulo`                   |
| `Estado` (catálogo)   | `estados`              | `id_entidad_federativa`                      |
| `Institucion` (cat)   | `instituciones`        |                                              |
| `TipoUsuario` (cat)   | `tipo_usuario`         | Consultable, no FK directa actual de Usuario |
| `TipoActividad` (cat) | `tipo_actividad`       |                                              |
| `PrecioInscripcion`   | `precios_inscripcion`  | `fecha_limite, costo, costo_miembro, orden, activo` |
| `Actividad`            | `actividades`          | `costo, cupo_maximo, fecha_inicio/fin`       |
| `InscripcionActividad` | `inscripcion_actividades` | `folio_registro, id_actividad, url_constancia` UNIQUE |
| `Ponente`              | `actividad_ponentes`   | `id_actividad, folio_registro_ponente` PK compuesta |
| `Cargo`                | `cargos`               | Existe en BD pero no expuesto por catálogo actualmente |

## Apéndice B: Variables de Entorno Esperadas

```env
# ── Base de Datos (Supabase / PostgreSQL) ──
DATABASE_URL="postgresql://postgres.[REF]:[PASS]@aws-1-us-east-2.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.[REF]:[PASS]@aws-1-us-east-2.pooler.supabase.com:5432/postgres"

# ── Supabase: Storage ──
NEXT_PUBLIC_SUPABASE_URL="https://[REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# ── Email (Nodemailer: Gmail SMTP) ──
GMAIL_USER="tu_usuario@gmail.com"
GMAIL_APP_PASSWORD="tu_app_password_de_16_caracteres"
EMAIL_FROM="ANIEI 2026 <registro@dominio.com>"

# ── Auth.js (NextAuth v5) ──
AUTH_SECRET="tu_secreto_para_auth_js"

# ── App ──
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="https://aniei-registro-2026.vercel.app" # para QR de grupo

# ── Legacy (ya no usados) ──
# ENABLE_GROUP_REGISTRATION no se usa (reemplazado por flujo grupo rápido autenticado)
```

> `DATABASE_URL` (pooler 6543) es la usada por `@prisma/adapter-pg` en `src/infrastructure/database/client.ts:11`. `DIRECT_URL` solo para CLI/migraciones Prisma.

## Apéndice C: Rutas y Páginas (implementación real)

| Ruta | Archivo | Protegida | Descripción |
|------|---------|-----------|-------------|
| `/` | `app/page.tsx` | No | Landing |
| `/login` | `app/login/page.tsx` | No (redirige si ya auth) | Login Credentials |
| `/registro` | `app/registro/page.tsx` | Redirige a `/perfil` si ya auth (`proxy.ts:29`) | Wizard 3 pasos |
| `/perfil` | `app/perfil/page.tsx` | Sí (`proxy.ts:47`) | Perfil + actividades + historial depósitos |
| `/perfil/grupo/registro` | `app/perfil/grupo/registro/page.tsx` | Sí | Grupo rápido |
| `/grupo-completar/[token]` | `app/grupo-completar/[token]/page.tsx` | No | Lista pendientes/completados |
| `/grupo-completar/[token]/usuario/[folio]` | `app/grupo-completar/[token]/usuario/[folio]/page.tsx` | No | Completar miembro |
| `/actividades` | `app/actividades/page.tsx` | Sí (`proxy.ts:52`) | Listado actividades |
| `/actividades/checkout` | `app/actividades/checkout/page.tsx` | Sí | Checkout inscripción actividades |
| `/cpanel` | `app/cpanel/page.tsx` | `ADMIN` (`proxy.ts:37`) | Gestión usuarios |
| `/cpanel/actividades` | `app/cpanel/actividades/page.tsx` | `ADMIN` | CRUD actividades |
| `/cpanel/actividades/[id]` | `app/cpanel/actividades/[id]/page.tsx` | `ADMIN` | Detalle + ponentes |
| `/cpanel/configuracion` | `app/cpanel/configuracion/page.tsx` | `ADMIN` | Precios |
| `/cpanel/usuarios/[folio]` | `app/cpanel/usuarios/[folio]/page.tsx` | `ADMIN` | Depósitos usuario |
| `/constancia/[folio]` | `app/constancia/[folio]/page.tsx` | No | Vista constancia |
| `/api/auth/[...nextauth]` | `app/api/auth/[...nextauth]/route.ts` | No | Auth.js handlers |
| `/api/constancia/[folio]` | `app/api/constancia/[folio]/route.ts` | No | Descarga PDF |
