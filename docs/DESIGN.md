# PLAN & DESIGN — Sistema de Registro ANIEI 2026

> **Estado:** En desarrollo activo (MVP funcional con módulos expandidos)  
> **Stack:** Next.js 16 (App Router) · React 19 · PostgreSQL (Supabase) · Prisma 7 · TypeScript · Zod 4 · Tailwind CSS 4 · NextAuth v5 · Nodemailer  
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
12. [Módulo de Registro Grupal](#12-módulo-de-registro-grupal)
13. [Módulo de Actividades](#13-módulo-de-actividades)
14. [Módulo de Autenticación y CPanel](#14-módulo-de-autenticación-y-cpanel)
15. [Estrategia de Infraestructura Intercambiable](#15-estrategia-de-infraestructura-intercambiable)
16. [Data Mapper Pattern (ORM ↔ Dominio)](#16-data-mapper-pattern-orm--dominio)
17. [Decisiones de Diseño (ADRs)](#17-decisiones-de-diseño-adrs)

---

## 1. Visión General

Sistema web de inscripción al congreso ANIEI 2026 que permite:

- **Registro individual** de asistentes al congreso con selección de actividades.
- **Registro grupal** (una persona inscribe N personas de la misma institución).
- **Confirmación por correo** electrónico tras el registro exitoso.
- **Generación de constancia PDF** de inscripción, participación y ponencia.
- **Panel de administración (CPanel)** para gestión de usuarios, actividades, ponentes y envío de constancias.
- **Autenticación** de administradores via Auth.js (NextAuth v5) con credenciales locales.
- **Independencia de proveedores** de infraestructura (BD, correo, almacenamiento de archivos).

El sistema se construye sobre Next.js aprovechando **Server Actions** como punto de entrada al backend, colocando frontend y backend en el mismo repositorio pero con separación lógica estricta entre capas.

---

## 2. Requisitos Funcionales

| ID    | Requisito                                                                 | Prioridad |
|-------|---------------------------------------------------------------------------|-----------|
| RF-01 | Registro individual de asistente (datos personales + institución)         | Alta      |
| RF-02 | Carga de comprobante de pago (imagen/PDF) durante el registro              | Alta      |
| RF-03 | Envío de correo de confirmación de inscripción                            | Alta      |
| RF-04 | Generación y almacenamiento de constancia PDF de inscripción               | Alta      |
| RF-05 | Registro grupal: una persona registra N asistentes de su misma institución (un solo comprobante, feedback de costo total) | Media     |
| RF-06 | Solicitud de facturación                                                  | Media     |
| RF-07 | Verificación de inscripción (flujo admin o automático)                    | Media     |
| RF-08 | Inscripción a actividades del congreso (talleres, cursos, etc.)           | Media     |
| RF-09 | Gestión de ponentes por actividad                                         | Media     |
| RF-10 | Generación de constancias de participación y ponencia                     | Media     |
| RF-11 | Panel de administración para gestión de usuarios y actividades            | Alta      |
| RF-12 | Autenticación de administradores con credenciales locales                 | Alta      |
| RF-13 | Envío de constancias desde el CPanel por el administrador                 | Media     |

---

## 3. Requisitos No Funcionales

| ID     | Requisito                                                                               |
|--------|-----------------------------------------------------------------------------------------|
| RNF-01 | La capa de dominio y aplicación **NO** deben depender de frameworks ni librerías externas |
| RNF-02 | Cambiar de proveedor de BD (Supabase → VPS PostgreSQL) no debe afectar casos de uso      |
| RNF-03 | Cambiar proveedor de correo (Nodemailer → SendGrid → SMTP propio) requiere solo un adaptador |
| RNF-04 | Cambiar almacenamiento (Supabase Storage → S3 → filesystem) requiere solo un adaptador    |
| RNF-05 | El módulo de registro grupal debe poder activarse/desactivarse sin modificar el flujo base |
| RNF-06 | El sistema debe ser desplegable en Vercel, Docker (VPS) o cualquier plataforma Node.js     |
| RNF-07 | La autenticación no debe depender de un proveedor externo (Auth.js con credenciales locales) |

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
│  │    (CERO dependencias externas)                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         ▲ implementa                             │
│  ┌──────────────────────┴────────────────────────────────────┐  │
│  │              INFRASTRUCTURE LAYER                          │  │
│  │    database/     → Prisma schema, client, migraciones     │  │
│  │    mappers/      → Data Mappers (PrismaType ↔ Entidad)   │  │
│  │    repositories/ → Implementaciones concretas (Prisma)    │  │
│  │    services/     → Email, PDF, Storage (adapters)         │  │
│  │    config/       → Dependency Injection container         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### ¿Cómo encajan los Server Actions?

En Clean Architecture tradicional (Express, Nest), un **Controller** recibe el request HTTP, lo parsea, y llama al Use Case. En Next.js con App Router:

- Los **Server Actions** (`"use server"`) reemplazan a los controllers.
- Reciben datos del formulario (FormData o argumentos tipados).
- Validan input con Zod (capa de presentación).
- Instancian el Use Case inyectando las dependencias (o usan un container).
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
├── schema.prisma                  # Esquema Prisma (fuente de verdad BD)
└── migrations/                    # Historial de migraciones

prisma.config.ts                   # Configuración Prisma (usa DIRECT_URL)

src/
├── app/                          # ── PRESENTATION LAYER (Next.js) ──
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page (redirect autenticado)
│   ├── globals.css
│   ├── login/
│   │   ├── page.tsx              # Página de login de administradores
│   │   └── actions/              # Server Actions de autenticación
│   ├── api/
│   │   ├── auth/[...nextauth]/
│   │   │   └── route.ts          # API Routes de NextAuth v5
│   │   └── constancia/
│   │       └── [folio]/
│   │           └── route.ts      # API Route: descarga PDF por folio
│   ├── registro/
│   │   ├── page.tsx              # Server Component: carga catálogos y actividades
│   │   ├── components/           # Componentes UI del registro
│   │   │   ├── RegistroForm.tsx  # Client Component: wizard multi-paso (6 pasos)
│   │   │   └── steps/
│   │   │       ├── StepDatosGenerales.tsx
│   │   │       ├── StepActividades.tsx
│   │   │       ├── StepGrupo.tsx
│   │   │       ├── StepPago.tsx
│   │   │       ├── StepFacturacion.tsx
│   │   │       └── StepCheckout.tsx
│   │   └── actions/
│   │       └── registrar-usuario.action.ts  # Server Action (individual + grupal)
│   ├── confirmacion/
│   │   └── page.tsx
│   ├── constancia/
│   │   └── [folio]/
│   │       └── page.tsx              # Vista de constancia con link a descarga
│   ├── actividades/
│   │   ├── page.tsx                  # Selección de actividades
│   │   └── checkout/
│   │       └── page.tsx              # Checkout de pago de actividades
│   ├── grupo-completar/
│   │   └── [token]/
│   │       └── page.tsx              # Completar registro de miembros de grupo
│   ├── perfil/
│   │   ├── page.tsx                  # Perfil de usuario autenticado
│   │   └── grupo/registro/
│   │       └── page.tsx              # Registro rápido de grupo
│   └── cpanel/                       # ── Panel de Administración ──
│       ├── layout.tsx               # Layout con navegación admin
│       ├── page.tsx                  # Gestión de usuarios
│       ├── configuracion/
│       │   └── page.tsx              # Configuración del sistema
│       └── actividades/
│           ├── page.tsx              # Listado de actividades
│           └── [id]/
│               └── page.tsx          # Detalle + gestión de ponentes
│
├── core/                         # ── DOMAIN LAYER (puro TypeScript) ──
│   ├── entities/
│   │   ├── Usuario.ts
│   │   ├── Deposito.ts           # Comprobante de pago (archivo subido)
│   │   ├── Facturacion.ts
│   │   ├── GrupoRegistro.ts      # Entidad para registro grupal
│   │   └── Acceso.ts             # Entidad de autenticación/roles
│   ├── value-objects/
│   │   ├── Email.ts
│   │   ├── Telefono.ts
│   │   ├── FolioRegistro.ts      # PK string de usuario (e.g., ANI26-0001)
│   │   ├── CodigoBarras.ts
│   │   ├── Monto.ts
│   │   └── ArchivoComprobante.ts # Validación de tipo/tamaño de archivo
│   ├── errors/
│   │   ├── RegistroError.ts
│   │   ├── ComprobanteError.ts
│   │   └── GrupoRegistroError.ts
│   └── enums/
│       └── Genero.ts
│
├── application/                  # ── APPLICATION LAYER ──
│   ├── ports/                    # Interfaces (contratos) = 13 puertos
│   │   ├── IUsuarioRepository.ts
│   │   ├── IDepositoRepository.ts
│   │   ├── IFacturacionRepository.ts
│   │   ├── ICatalogoRepository.ts
│   │   ├── IAccesoRepository.ts
│   │   ├── IActividadRepository.ts
│   │   ├── IInscripcionActividadRepository.ts
│   │   ├── IPonentesRepository.ts
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
│   │   ├── LoginCpanelUseCase.ts
│   │   ├── ObtenerAccesoArchivo.ts
│   │   └── ObtenerUsuariosForAdmin.ts
│   └── dtos/
│       ├── RegistroUsuarioDTO.ts       # Incluye ArchivoDTO, DepositoDTO
│       ├── RegistrarGrupoRapidoDTO.ts
│       ├── FacturacionDTO.ts
│       ├── ActividadDTO.ts
│       ├── InscripcionActividadDTO.ts
│       ├── AuthSessionDTO.ts
│       ├── UsuarioForAdminDTO.ts
│       ├── PaginatedResult.ts
│       ├── ResultadoRegistro.ts
│       └── ResultadoRegistroGrupo.ts
│
├── generated/                    # ── CÓDIGO GENERADO ──
│   └── prisma/                   # Cliente Prisma generado
│
├── infrastructure/               # ── INFRASTRUCTURE LAYER ──
│   ├── database/
│   │   └── client.ts                     # Singleton PrismaClient (PrismaPg adapter)
│   ├── mappers/                          # ── DATA MAPPERS ──
│   │   ├── UsuarioMapper.ts
│   │   ├── DepositoMapper.ts
│   │   └── FacturacionMapper.ts
│   ├── repositories/
│   │   ├── PrismaUsuarioRepository.ts
│   │   ├── PrismaDepositoRepository.ts
│   │   ├── PrismaFacturacionRepository.ts
│   │   ├── PrismaCatalogoRepository.ts
│   │   ├── PrismaAccesoRepository.ts
│   │   ├── PrismaActividadRepository.ts
│   │   ├── PrismaInscripcionActividadRepository.ts
│   │   └── PrismaPonentesRepository.ts
│   ├── services/
│   │   ├── email/
│   │   │   ├── NodemailerEmailService.ts   # Adaptador Gmail SMTP
│   │   │   └── templates/
│   │   │       ├── confirmacion.ts
│   │   │       ├── constancia.ts
│   │   │       ├── confirmacion-actividades.ts
│   │   │       └── notificacion-ponente.ts
│   │   ├── pdf/
│   │   │   ├── ReactPdfService.ts          # Adaptador @react-pdf/renderer
│   │   │   └── templates/
│   │   │       ├── ConstanciaTemplate.tsx
│   │   │       ├── ConstanciaParticipanteTemplate.tsx
│   │   │       ├── ConstanciaPonenteTemplate.tsx
│   │   │       └── HojaRegistroGrupoTemplate.tsx
│   │   ├── storage/
│   │   │   └── SupabaseStorageService.ts   # Adaptador Supabase Storage
│   │   ├── auth/
│   │   │   └── AuthJsAuthService.ts        # Adaptador Auth.js (NextAuth v5)
│   │   └── PrismaAdminQueryService.ts      # Servicio de consultas admin
│   └── config/
│       ├── container.ts                    # Dependency Injection (factory)
│       └── supabase/                       # Clientes Supabase (client, server)
│
└── shared/                       # ── UTILIDADES COMPARTIDAS ──
    ├── types/
    │   └── catalogos.ts              # Cargo, Estado, Institucion, TipoUsuario, Titulo, TipoActividad
    ├── validation/                   # Schemas Zod v4 (validación de input)
    │   └── registro.schema.ts
    └── constants/
```

---

## 6. Diagrama de Arquitectura por Capas

```mermaid
graph TB
    subgraph Presentation["🖥️ Presentation Layer (Next.js App Router)"]
        Pages["Pages & Layouts"]
        SC["Server Components"]
        CC["Client Components<br/>(Formularios)"]
        SA["Server Actions<br/>(Controllers)"]
    end

    subgraph Application["⚙️ Application Layer"]
        UC["Use Cases<br/>RegistrarUsuario<br/>RegistrarGrupoRapido<br/>EnviarConfirmacion<br/>GenerarConstancia"]
        DTO["DTOs"]
        Ports["Ports (Interfaces)<br/>IUsuarioRepository<br/>ICatalogoRepository<br/>IEmailService<br/>IPdfService<br/>IStorageService"]
    end

    subgraph Domain["🧠 Domain Layer (Pure TypeScript)"]
        Entities["Entities<br/>Usuario · Deposito<br/>Facturacion · GrupoRegistro"]
        VO["Value Objects<br/>Email · FolioRegistro<br/>Monto · CodigoBarras<br/>ArchivoComprobante"]
        DErr["Domain Errors"]
    end

    subgraph Infrastructure["🔌 Infrastructure Layer (Adapters)"]
        Repos["Repositories<br/>PrismaUsuarioRepo<br/>PrismaDepositoRepo<br/>PrismaActividadRepo<br/>PrismaAccesoRepo"]
        Mappers["Data Mappers<br/>UsuarioMapper<br/>DepositoMapper<br/>FacturacionMapper"]
        ORM["Prisma ORM<br/>(PrismaClient)"]
        EmailSvc["Email Adapters<br/>Nodemailer · SendGrid"]
        PdfSvc["PDF Adapters<br/>ReactPdf · Puppeteer"]
        StoreSvc["Storage Adapters<br/>Supabase · S3 · Local"]
        AuthSvc["Auth Adapters<br/>Auth.js · Supabase"]
        AdminSvc["Admin Services<br/>PrismaAdminQueryService"]
        DB[("PostgreSQL 17")]
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
    ORM -->|"SQL"| DB

    style Domain fill:#1a1a2e,stroke:#e94560,color:#fff
    style Application fill:#16213e,stroke:#0f3460,color:#fff
    style Presentation fill:#0f3460,stroke:#533483,color:#fff
    style Infrastructure fill:#1a1a2e,stroke:#533483,color:#fff
```

---

## 7. Modelo de Dominio

### 7.1 Diagrama de Clases del Dominio (Entidades y Value Objects)

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
        -idCargo: number
        -idTipoUsuario: number
        -idInstitucion: number
        -idEntidadFederativa: number
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
        +static create(props): Deposito
    }

    class Facturacion {
        -idFacturacion: number | null
        -folioRegistro: string
        -razonSocial: string
        -rfc: string
        -calle: string
        -numExterior: string
        -numInterior: string | null
        -colonia: string
        -municipio: string
        -codigoPostal: string
        -idEntidadFederativaRfc: number
        +static create(props): Facturacion
    }

    class GrupoRegistro {
        -responsable: Usuario
        -miembros: Usuario[]
        -idInstitucionCompartida: number
        -idEntidadFederativaCompartida: number
        -responsableYaRegistrado: boolean
        +static create(responsable, miembros, yaRegistrado?): GrupoRegistro
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
        MASCULINO
        FEMENINO
        OTRO
    }

    Usuario *-- Email
    Usuario *-- Telefono
    Usuario *-- CodigoBarras
    Deposito *-- Monto
    Deposito *-- ArchivoComprobante
    GrupoRegistro "1" *-- "1" Usuario : responsable
    GrupoRegistro "1" *-- "*" Usuario : miembros
    Acceso --> Usuario : folioRegistro
```

### 7.2 Catálogos

Los catálogos (`cargos`, `estados`, `instituciones`, `tipo_usuario`, `titulos`, `tipo_actividad`) se tratan como **datos de referencia** que se consultan por ID. No son entidades ricas del dominio; se modelan como tipos simples o interfaces de solo lectura:

```typescript
// No son clases con lógica, solo tipos para catálogos (src/shared/types/catalogos.ts)
interface Cargo { idCargo: number; descripcion: string }
interface Estado { idEntidadFederativa: number; nombre: string }
interface Institucion { idInstitucion: number; nombre: string; abreviatura: string | null }
interface TipoUsuario { idTipoUsuario: number; descripcion: string }
interface Titulo { idTitulo: number; descripcion: string }
interface TipoActividad { idTipoActividad: number; clave: string | null; descripcion: string; manejaEquipos: boolean; generaConstanciaParticipante: boolean }
```

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
    }

    class IFacturacionRepository {
        <<port>>
        +crear(facturacion: Facturacion): Promise~Facturacion~
        +buscarPorUsuario(folioRegistro: string): Promise~Facturacion | null~
    }

    class ICatalogoRepository {
        <<port>>
        +obtenerCargos(): Promise~Cargo[]~
        +obtenerEstados(): Promise~Estado[]~
        +obtenerInstituciones(): Promise~Institucion[]~
        +obtenerTiposUsuario(): Promise~TipoUsuario[]~
        +obtenerTiposActividad(): Promise~TipoActividad[]~
    }

    class IAccesoRepository {
        <<port>>
        +crear(acceso: Acceso): Promise~Acceso~
        +buscarPorEmail(email: string): Promise~Acceso | null~
        +actualizarRol(acceso: Acceso): Promise~Acceso~
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
        +inscribirUsuario(folioRegistro: string, idActividad: number): void
        +obtenerPorUsuario(folioRegistro: string): Promise~InscripcionActividadDTO[]~
    }

    class IPonentesRepository {
        <<port>>
        +crear(data): Promise~void~
        +listarPorActividad(idActividad: number): Promise~Ponente[]~
        +eliminar(idPonente: number): Promise~void~
    }

    class IAdminQueryService {
        <<port>>
        +obtenerUsuariosPaginado(params): PaginatedResult~UsuarioForAdminDTO~
        +obtenerUsuario(folioRegistro: string): UsuarioForAdminDTO
    }

    class IAuthService {
        <<port>>
        %% +signIn(credentials): Promise~{ success, error? }~
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

### 8.2 Dependency Injection Container

El container es una **simple factory** que instancia adaptadores concretos. Actualmente los adaptadores están hardcoded (un solo proveedor por servicio). No se necesita un framework DI complejo:

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
AUTH_SECRET               # Secreto para JWT de NextAuth
```

> **Nota:** Para agregar switching por variable de entorno (e.g. `EMAIL_PROVIDER=nodemailer|sendgrid`), se modificaría únicamente este archivo.

---

## 9. Casos de Uso

### 9.1 Diagrama de Clases de Use Cases

```mermaid
classDiagram
    class RegistrarUsuario {
        -usuarioRepo: IUsuarioRepository
        -depositoRepo: IDepositoRepository
        -storageService: IStorageService
        -emailService: IEmailService
        -pdfService: IPdfService
        -catalogoRepo: ICatalogoRepository
        -actividadRepo: IActividadRepository
        -inscripcionActividadRepo: IInscripcionActividadRepository
        +execute(dto: RegistroUsuarioDTO): Promise~ResultadoRegistro~
    }

    class RegistrarGrupoRapido {
        -usuarioRepo: IUsuarioRepository
        -depositoRepo: IDepositoRepository
        -storageService: IStorageService
        -emailService: IEmailService
        -pdfService: IPdfService
        -catalogoRepo: ICatalogoRepository
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
        +execute(filtros, pagina): Promise~PaginatedResult~UsuarioForAdminDTO~~
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
| **Actor**       | Asistente                                                                          |
| **Precondición**| El correo no está registrado previamente                                           |
| **Flujo**       | 1. Asistente llena formulario multi-paso (datos personales → selección de actividades → grupo opcional → datos de pago → facturación opcional → checkout) + adjunta comprobante de pago → 2. Validación (Zod: datos + archivo; Dominio: reglas de negocio) → 3. Subir comprobante a storage → 4. Crear entidad Usuario → 5. Crear entidad Deposito con URL → 6. Persistir usuario y comprobante → 7. Inscribir en actividades seleccionadas → 8. Generar constancia PDF → 9. Almacenar constancia → 10. Enviar correo de confirmación (el envío de constancia PDF se delega al administrador a través del CPanel) |
| **Postcondición**| Usuario creado, comprobante almacenado, correo enviado, constancia PDF generada y almacenada |
| **Error**       | Correo duplicado → `RegistroError.CORREO_DUPLICADO` · Archivo inválido → `ComprobanteError.TIPO_NO_PERMITIDO` |

#### UC-02: Registrar Grupo

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Responsable del grupo                                                              |
| **Precondición**| Módulo de grupo **activado** en configuración del sistema                          |
| **Flujo**       | 1. Responsable llena su formulario + datos de N miembros (cada miembro con su propio `tipo_usuario`) → 2. UI muestra feedback del **costo total** según número de integrantes → 3. Responsable adjunta **un solo comprobante** de pago que cubre a todo el grupo → 4. Campos compartidos (institución, estado) se heredan; `tipo_usuario` **NO se hereda** → 5. Se verifica si el responsable ya está registrado individualmente → 6. Se sube comprobante a storage → 7. Se crea `GrupoRegistro` → 8. Si el responsable ya existe, solo se persisten los miembros nuevos → 9. Se genera constancia para cada miembro nuevo → 10. Se envía correo de confirmación al responsable y a cada miembro (el envío de constancias se delega al administrador a través del CPanel) |
| **Postcondición**| Miembros nuevos creados, un comprobante grupal almacenado, correos de confirmación enviados, constancias generadas y almacenadas |
| **Variante**    | **Responsable ya registrado:** No se crea usuario duplicado; solo se registran los N miembros. **Responsable nuevo:** Se registra junto con los miembros (N+1 usuarios). |
| **Nota**        | No se requiere un comprobante individual por cada miembro del grupo. El `tipo_usuario` de cada miembro es independiente del responsable. |

#### UC-03: Generar Constancia

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Sistema (automático tras registro) o Asistente (descarga manual)                   |
| **Flujo**       | 1. Obtener datos del usuario por folio → 2. Renderizar PDF con template → 3. Subir a storage → 4. Retornar URL |

---

## 10. Diagramas de Secuencia

### 10.1 Registro Individual Completo

```mermaid
sequenceDiagram
    actor A as Asistente
    participant CC as Client Component<br/>(RegistroForm)
    participant SA as Server Action<br/>(registrar-usuario)
    participant Val as Zod Schema<br/>(Validación)
    participant UC as RegistrarUsuario<br/>(Use Case)
    participant Dom as Usuario<br/>(Entity)
    participant Comp as Deposito<br/>(Entity)
    participant Repo as IUsuarioRepository<br/>(Port → PrismaAdapter + Mapper)
    participant CompRepo as IDepositoRepository
    participant Store as IStorageService<br/>(Port → Adapter)
    participant PDF as IPdfService<br/>(Port → Adapter)
    participant Mail as IEmailService<br/>(Port → Adapter)
    participant DB as PostgreSQL

    A->>CC: Llena formulario + adjunta<br/>comprobante de pago (img/PDF)
    CC->>SA: submit (FormData con archivo)
    SA->>Val: validar(formData + file)
    
    alt Validación falla
        Val-->>SA: errors[]
        SA-->>CC: { success: false, errors }
        CC-->>A: Muestra errores
    end

    Val-->>SA: RegistroUsuarioDTO ✓ (incluye File)

    SA->>UC: execute(dto)
    
    UC->>Repo: buscarPorCorreo(dto.correo)
    Repo->>DB: SELECT ... WHERE correo = $1
    DB-->>Repo: null (no existe)
    Repo-->>UC: null ✓

    Note over UC,Store: Subir comprobante de pago a storage
    UC->>Store: subir("comprobantes/{uuid}.ext", fileBuffer, mime)
    Store-->>UC: urlComprobante

    UC->>Dom: Usuario.create(props)
    Dom-->>UC: usuario (entidad)

    UC->>Repo: crear(usuario)
    Repo->>DB: INSERT INTO usuarios ...
    DB-->>Repo: usuario con id
    Repo-->>UC: usuario persistido

    UC->>Comp: Deposito.create(folioRegistro, urlComprobante, archivo, monto)
    Comp-->>UC: comprobante (entidad)

    UC->>CompRepo: crear(comprobante)
    CompRepo->>DB: INSERT INTO depositos ...
    DB-->>CompRepo: comprobante persistido
    CompRepo-->>UC: ✓

    UC->>PDF: generarConstanciaInscripcion(datos)
    PDF-->>UC: pdfBuffer

    UC->>Store: subir("constancias/{folio}.pdf", buffer)
    Store-->>UC: urlConstancia

    UC->>Mail: enviarConfirmacionRegistro(correo, datos)
    Note over UC,Mail: El envío de constancia se delega al administrador<br/>(EnviarConfirmacion desde CPanel)

    UC-->>SA: { success: true, folio, urlConstancia }
    SA-->>CC: resultado
    CC-->>A: Pantalla de confirmación
```

### 10.2 Registro Grupal

```mermaid
sequenceDiagram
    actor R as Responsable
    participant CC as Client Component<br/>(GrupoForm)
    participant SA as Server Action<br/>(registrar-grupo)
    participant Val as Zod Schema
    participant UC as RegistrarGrupoRapido<br/>(Use Case)
    participant Dom as GrupoRegistro<br/>(Entity)
    participant Repo as IUsuarioRepository
    participant CompRepo as IDepositoRepository
    participant Store as IStorageService
    participant PDF as IPdfService
    participant Mail as IEmailService
    participant DB as PostgreSQL

    R->>CC: Llena datos propios +<br/>datos de N miembros<br/>(cada uno con su tipo_usuario)
    Note over CC: UI muestra feedback:<br/>"Costo total: $X × N = $Total"<br/>(tipo_usuario NO se hereda)
    R->>CC: Adjunta UN SOLO comprobante<br/>de pago (cubre a todo el grupo)
    CC->>SA: submit (FormData con archivo)
    SA->>Val: validar(formData + file)
    Val-->>SA: RegistrarGrupoRapidoDTO ✓

    SA->>UC: execute(dto)

    Note over UC: Verificar si el responsable<br/>ya está registrado
    UC->>Repo: buscarPorCorreo(responsable.correo)
    Repo->>DB: SELECT ...
    DB-->>Repo: usuario existente | null

    alt Responsable ya registrado
        Note over UC: Responsable existe →<br/>NO se crea duplicado.<br/>Solo se registran los miembros.
    else Responsable nuevo
        Note over UC: Responsable no existe →<br/>Se incluye en los registros nuevos.
    end

    Note over UC: Verificar que ningún correo<br/>de miembro esté ya registrado
    loop Para cada correo de miembros
        UC->>Repo: buscarPorCorreo(correo)
        Repo->>DB: SELECT ...
        DB-->>Repo: null ✓
    end

    Note over UC,Store: Subir comprobante grupal a storage
    UC->>Store: subir("comprobantes/{uuid}.ext", fileBuffer, mime)
    Store-->>UC: urlComprobante

    UC->>Dom: GrupoRegistro.create(responsable, miembros, yaRegistrado)
    Note over Dom: Campos institución, estado<br/>se heredan del responsable.<br/>tipo_usuario NO se hereda:<br/>cada miembro trae el suyo.

    Dom-->>UC: grupoRegistro

    UC->>Repo: crearMuchos(grupoRegistro.obtenerNuevosRegistros())
    Repo->>DB: INSERT INTO usuarios ... (batch, solo nuevos)
    DB-->>Repo: usuarios[]

    Note over UC: Crear comprobante grupal<br/>asociado al responsable (es_grupal = true)
    UC->>CompRepo: crear(comprobantePago)
    CompRepo->>DB: INSERT INTO depositos ...
    DB-->>CompRepo: ✓

    loop Para cada miembro nuevo registrado
        UC->>PDF: generarConstanciaInscripcion(datos)
        PDF-->>UC: pdfBuffer
        UC->>Store: subir("constancias/{folio}.pdf", buffer)
        Store-->>UC: url
    end

    UC->>Mail: enviarConfirmacionRegistro(responsable.correo, datosGrupo)
    
    Note over UC,Mail: El envío de constancias se delega al administrador<br/>(EnviarConfirmacion desde CPanel)

    UC-->>SA: { success: true, registros: N(+1), costoTotal }
    SA-->>CC: resultado
    CC-->>R: Confirmación grupal
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
    Container-->>SA: postgresUsuarioRepo
    SA->>Container: getEmailService()
    Container-->>SA: nodemailerEmailService
    SA->>Container: getPdfService()
    Container-->>SA: reactPdfService
    SA->>Container: getStorageService()
    Container-->>SA: supabaseStorageService

    SA->>UC: new RegistrarUsuario(repos, services)
    SA->>UC: execute(dto)
    UC-->>SA: resultado

    Note over SA: 2. Mapear resultado a<br/>response del action

    SA-->>CC: { success, data?, errors? }
```

---

## 11. Diagramas de Flujo

### 11.1 Flujo Principal de Inscripción

```mermaid
flowchart TD
    A([Inicio: Asistente accede a /registro]) --> B{¿Registro grupal<br/>habilitado?}
    
    B -->|Sí| C[Mostrar opción:<br/>Individual / Grupal]
    B -->|No| D[Mostrar formulario<br/>individual]
    
    C -->|Individual| D
    C -->|Grupal| E[Mostrar formulario grupal<br/>Responsable + N miembros]
    
    D --> F[Llenar campos:<br/>nombre, apellido, correo,<br/>teléfono, género, carrera,<br/>dependencia, institución,<br/>estado, cargo, tipo usuario<br/>+ adjuntar comprobante de pago]
    
    E --> G[Llenar campos responsable<br/>+ campos por miembro:<br/>nombre, apellido, correo,<br/>género, carrera, tipo_usuario]
    G --> G2[UI muestra costo total:<br/>precio × N integrantes]
    G2 --> G3[Responsable adjunta UN SOLO<br/>comprobante de pago grupal]
    
    F --> H{¿Validación OK?<br/>datos + archivo}
    G3 --> H
    
    H -->|No| I[Mostrar errores<br/>en formulario]
    I --> F
    I --> G
    
    H -->|Sí| J0{¿Es registro<br/>individual?}
    
    J0 -->|Sí| J{"¿Correo ya<br/>registrado?"}
    J -->|Sí| K[Error: correo<br/>duplicado]
    K --> F
    J -->|No| L
    
    J0 -->|No, es grupal| J1{"¿Responsable ya<br/>registrado?"}
    J1 -->|Sí| J2[Usar usuario existente<br/>como responsable.<br/>No crear duplicado.]
    J1 -->|No| J3[Incluir responsable<br/>en registros nuevos]
    
    J2 --> J4{"¿Algún correo de<br/>miembro ya registrado?"}
    J3 --> J4
    J4 -->|Sí| K2[Error: correo de<br/>miembro duplicado]
    K2 --> G
    J4 -->|No| L
    
    L[Subir comprobante<br/>de pago a storage]
    
    L --> M["Crear entidad(es)<br/>Usuario / GrupoRegistro<br/>+ Deposito<br/>(tipo_usuario individual por miembro)"]
    
    M --> N[Persistir en BD<br/>solo registros nuevos]
    
    N --> O[Generar constancia PDF<br/>para cada nuevo registro]
    
    O --> P[Almacenar PDF en storage]
    
    P --> Q["Enviar correo de confirmación<br/>(sin adjunto)"]
    
    Q --> R([Mostrar página de confirmación<br/>con folio y enlace a constancia])
```

### 11.2 Flujo de Decisión: Módulo Grupal

```mermaid
flowchart TD
    A[Server Action recibe request]--> B{Feature Flag<br/>ENABLE_GROUP_REGISTRATION}
    
    B -->|false| C[Solo procesar<br/>registro individual]
    
    B -->|true| D{"¿Request incluye<br/>miembros[]?"}
    
    D -->|No| C
    D -->|Sí| E[Instanciar<br/>RegistrarGrupoRapido UseCase]
    
    C --> F[Instanciar<br/>RegistrarUsuario UseCase]
    
    E --> G[Ejecutar flujo grupal]
    F --> H[Ejecutar flujo individual]
    
    G --> I[Resultado]
    H --> I
```

### 11.3 Flujo de Generación de Constancia PDF

```mermaid
flowchart LR
    A[Datos del<br/>Usuario] --> B[IPdfService<br/>.generarConstancia]
    B --> C[Buffer PDF<br/>en memoria]
    C --> D[IStorageService<br/>.subir]
    D --> E[URL pública<br/>o firmada]
    C --> F[IEmailService<br/>.enviarConstancia]
    F --> G[Correo con<br/>PDF adjunto]
```

---

## 12. Módulo de Registro Grupal

### 12.1 Diseño Modular

El registro grupal sigue el patrón **Feature Module** controlado por una **feature flag**:

```
ENABLE_GROUP_REGISTRATION=true | false
```

#### Principios de Modularidad

1. **Entidad dedicada** (`GrupoRegistro`): encapsula la lógica de herencia de campos compartidos.
2. **Use Case independiente** (`RegistrarGrupoRapido`): no modifica `RegistrarUsuario`, lo complementa.
3. **Server Action unificado**: `registrar-usuario.action.ts` maneja ambos flujos (individual y grupal) en un solo archivo.
4. **UI condicional**: el componente `GrupoForm` solo se renderiza si la feature flag está activa.
5. **Sin cambios en BD**: los miembros del grupo son `usuarios` regulares; la relación grupal se maneja a nivel de aplicación.
6. **Un solo comprobante grupal**: el responsable sube un único comprobante de pago que cubre a todo el grupo. La UI muestra el costo total como feedback.

#### Usuario ya registrado como responsable de grupo

Si un usuario **ya se registró individualmente**, no podrá volver a registrarse, pero **sí podrá registrar un grupo** (otros usuarios a su nombre). En este caso:

- El sistema detecta que el responsable ya existe en BD (por su correo).
- **No se crea un nuevo registro** para el responsable; se reutiliza el existente.
- Solo se registran los **nuevos miembros** del grupo.
- El comprobante grupal se asocia al usuario responsable existente con `es_grupal = true`.

Si el responsable **no está registrado**, se registra junto con los miembros (flujo N+1 original).

#### Herencia de Campos en Grupo

Cuando se registra un grupo, los siguientes campos del **responsable** se **heredan** automáticamente a los miembros:

| Campo heredado       | Motivo                                           |
|----------------------|--------------------------------------------------|
| `id_institucion`     | Todos provienen de la misma institución           |
| `id_entidad_federativa` | Se asume misma ubicación institucional        |
| `id_cargo`           | Se asume mismo cargo institucional                |

> **Nota:** `id_tipo_usuario` **NO se hereda**. Cada miembro del grupo especifica su propio tipo de usuario. Un profesor puede inscribir estudiantes, y estos deben registrarse con su tipo correspondiente (e.g., "Alumno"), no con el tipo del responsable.

Campos **individuales** que cada miembro debe proporcionar:

| Campo individual     | Motivo                                           |
|----------------------|--------------------------------------------------|
| `nombre`             | Identificación personal                           |
| `apellido`           | Identificación personal                           |
| `correo`             | Único por persona, para enviar constancia         |
| `genero`             | Dato personal individual                          |
| `carrera`            | Puede variar aunque sean de la misma institución  |
| `id_tipo_usuario`    | Cada miembro tiene su propio tipo (alumno, académico, etc.) |

### 12.2 Diagrama de la Entidad GrupoRegistro

```mermaid
classDiagram
    class GrupoRegistro {
        -responsable: Usuario
        -miembros: Usuario[]
        -idInstitucionCompartida: number
        -idEntidadCompartida: number
        -responsableYaRegistrado: boolean

        +static create(responsable: Usuario, miembrosData: MiembroInput[], responsableYaRegistrado?: boolean): GrupoRegistro
        +agregarMiembro(data: MiembroInput): void
        +removerMiembro(correo: Email): void
        +obtenerTodos(): Usuario[]
        +obtenerMiembros(): Usuario[]
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
        +idTipoUsuario: number
    }

    note for GrupoRegistro "Hereda id_institucion y\nid_entidad_federativa del responsable.\nNO hereda id_tipo_usuario:\ncada miembro define el suyo.\nSi el responsable ya está registrado,\nsolo se crean los miembros nuevos."

    GrupoRegistro --> MiembroInput : recibe datos mínimos
```

---

## 13. Módulo de Actividades

### 13.1 Visión General

El sistema permite la **inscripción a actividades** del congreso (talleres, cursos, conferencias) tanto en el flujo de registro individual como desde el checkout de actividades (`/actividades/checkout`). Además, el CPanel permite gestionar actividades y asignar **ponentes** a cada una.

### 13.2 Modelo de Datos

Las actividades se modelan usando Prisma con las siguientes tablas:

```
actividades (id_actividad, nombre, fecha, costo, id_tipo_actividad, ...)
├── tipo_actividad (id_tipo_actividad, clave, descripcion, maneja_equipos, genera_constancia_participante)
├── inscripcion_actividades (id_inscripcion, folio_registro, id_actividad, constancia_url, ...)
├── actividad_ponentes (id_ponente, id_actividad, nombre, apellido, correo, rol, ...)
├── asistencia_actividades (id_asistencia, folio_registro, id_actividad, ...)
└── equipos / equipo_integrantes (para actividades que manejan equipos)
```

### 13.3 Tipos de Actividad

Cada actividad pertenece a un `TipoActividad` que define su comportamiento:

| Propiedad                    | Descripción                                             |
|------------------------------|---------------------------------------------------------|
| `clave`                      | Identificador único del tipo (e.g., "TALLER", "CURSO")  |
| `manejaEquipos`              | Si `true`, permite formar equipos de participantes       |
| `generaConstanciaParticipante` | Si `true`, se genera constancia de participación         |

### 13.4 Puertos del Módulo de Actividades

| Puerto                              | Responsabilidad                                        |
|-------------------------------------|--------------------------------------------------------|
| `IActividadRepository`              | CRUD de actividades + listado de tipos                 |
| `IInscripcionActividadRepository`   | Inscribir/desinscribir usuarios en actividades         |
| `IPonentesRepository`               | Gestión de ponentes por actividad                      |

### 13.5 Casos de Uso de Actividades

| Caso de Uso                          | Descripción                                            |
|--------------------------------------|--------------------------------------------------------|
| `GestionarActividades`               | CRUD de actividades desde el CPanel                    |
| `GenerarConstanciaParticipanteUseCase` | Genera PDF de constancia de participación             |
| `GenerarConstanciaPonenteUseCase`    | Genera PDF de constancia de ponencia                   |
| `EnviarConstanciaParticipanteUseCase` | Envía constancia de participación por email            |
| `EnviarConstanciaPonenteUseCase`     | Envía constancia de ponencia por email                 |

### 13.6 Inscripción a Actividades

Al registrarse, un usuario puede seleccionar actividades opcionales:

- **Flujo individual:** El `RegistroUsuarioDTO` incluye `actividadesIds?: number[]`.
- **Flujo checkout:** Para usuarios ya registrados, pueden agregar actividades desde `/actividades/checkout`.
- Las inscripciones se guardan en `inscripcion_actividades` asociando `folio_registro` → `id_actividad`.
- Algunas actividades tienen costo adicional que se suma al monto del comprobante.

---

## 14. Módulo de Autenticación y CPanel

### 14.1 Autenticación con Auth.js (NextAuth v5)

La autenticación usa **NextAuth v5** con el proveedor de **Credentials** y almacenamiento local en PostgreSQL:

```
app/login/       → Formulario de login (público)
app/api/auth/    → API Routes de NextAuth (JWT sessions)
app/cpanel/      → Panel de administración (protegido por middleware)
```

**Flujo de autenticación:**
1. Administrador accede a `/login` e ingresa email + contraseña.
2. El Server Action instancia `LoginCpanelUseCase` que valida credenciales contra la tabla `accesos`.
3. NextAuth crea un JWT con los claims de sesión (rol, nombre, email).
4. El middleware `auth()` protege rutas `/cpanel/*`.

**Entidad `Acceso`:**
```typescript
class Acceso {
  idAcceso: number;
  email: string;
  rol: string;           // "admin" | "operador"
  nombre: string | null;
  isAdmin(): boolean;
}
```

**Puerto `IAuthService`:**
```typescript
interface IAuthService {
  signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string }>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<AuthSessionDTO | null>;
}
```

**Adaptador `AuthJsAuthService`:** Wrapper sobre las funciones de NextAuth (`signIn`, `signOut`, `auth`) para mantener la arquitectura hexagonal.

### 14.2 Panel de Administración (CPanel)

El CPanel (`/cpanel`) es un dashboard protegido para administradores con las siguientes secciones:

| Ruta                       | Funcionalidad                                              |
|----------------------------|------------------------------------------------------------|
| `/cpanel`                  | Gestión de usuarios: búsqueda, paginación, reenvío de constancias |
| `/cpanel/actividades`      | CRUD de actividades del congreso                           |
| `/cpanel/actividades/[id]` | Detalle de actividad + gestión de ponentes                 |
| `/cpanel/configuracion`    | Configuración del sistema (tipos de actividad, etc.)        |

**Funcionalidades del CPanel:**
- **Búsqueda y paginación** de usuarios (`ObtenerUsuariosForAdmin` via `IAdminQueryService`).
- **Reenvío de constancias** por email (`EnviarConfirmacion` — el admin dispara el envío manualmente).
- **Gestión de actividades**: crear, editar, listar actividades y sus tipos (`GestionarActividades`).
- **Gestión de ponentes**: agregar/eliminar ponentes por actividad (`IPonentesRepository`).
- **Acceso a archivos protegidos**: descarga de comprobantes de pago con URLs firmadas (`ObtenerAccesoArchivo`).

### 14.3 Servicio de Consultas Admin

El `IAdminQueryService` (implementado por `PrismaAdminQueryService`) proporciona consultas optimizadas para el CPanel:

```typescript
interface IAdminQueryService {
  obtenerUsuariosPaginado(params: {
    pagina: number;
    limite: number;
    busqueda?: string;
    verificado?: boolean;
  }): Promise<PaginatedResult<UsuarioForAdminDTO>>;
}
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
    end

    subgraph Actual["Adaptadores Actuales"]
        A1["PrismaUsuarioRepo<br/>(Prisma ORM + Data Mapper)"]
        A2["NodemailerEmailService<br/>(Gmail SMTP)"]
        A3["ReactPdfService"]
        A4["SupabaseStorageService"]
        A5["AuthJsAuthService<br/>(NextAuth v5)"]
        A6["PrismaActividadRepo"]
    end

    subgraph Futuro["Adaptadores Futuros"]
        F1["DrizzleUsuarioRepo<br/>KyselyUsuarioRepo"]
        F2["SendGridEmailService<br/>SMTP genérico"]
        F3["PuppeteerPdfService"]
        F4["S3StorageService<br/>LocalStorageService"]
        F5["SupabaseAuthService<br/>Custom OAuth"]
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

### 15.2 Ejemplo Conceptual del Container

```typescript
// infrastructure/config/container.ts

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

export function getEmailService(): IEmailService {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    const from = process.env.EMAIL_FROM || user;
    if (!user || !pass || !from) {
        throw new Error('GMAIL_USER, GMAIL_APP_PASSWORD y EMAIL_FROM deben estar configuradas');
    }
    return new NodemailerEmailService(user, pass, from);
}

export function getPdfService(): IPdfService {
    return new ReactPdfService();
}

export function getStorageService(): IStorageService {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas');
    }
    return new SupabaseStorageService(url, key);
}

export function getAdminQueryService(): IAdminQueryService {
    return new PrismaAdminQueryService(prisma);
}

export function getAuthService(): IAuthService {
    return new AuthJsAuthService();
}
```

### 15.3 Escenarios de Migración

| Escenario                         | Qué cambia                              | Qué NO cambia                  |
|-----------------------------------|------------------------------------------|---------------------------------|
| Supabase → VPS con PostgreSQL     | `DATABASE_URL` en `.env`                 | Use Cases, Domain, Presentation |
| Prisma → Drizzle                  | Repos, Mappers, esquema ORM              | Use Cases, Domain, Presentation |
| Nodemailer → SendGrid                 | Nuevo adapter `SendGridEmailService`     | Use Cases, Domain, Presentation |
| Supabase Storage → S3             | Nuevo adapter `S3StorageService`         | Use Cases, Domain, Presentation |
| Agregar nuevo proveedor de PDF    | Nuevo adapter implementando `IPdfService`| Use Cases, Domain, Presentation |
| Desactivar registro grupal        | `ENABLE_GROUP_REGISTRATION=false`        | Todo el resto del sistema       |

---

## 16. Data Mapper Pattern (ORM ↔ Dominio)

### 16.1 Concepto

El **Data Mapper** es la pieza que aísla el dominio del ORM. Cada Mapper traduce entre dos mundos:

- **`toDomain()`**: Convierte un objeto de Prisma (resultado de query) → Entidad de dominio (con Value Objects).
- **`toPersistence()`**: Convierte una entidad de dominio → Input de creación/actualización de Prisma.

El dominio **nunca** importa tipos de Prisma. Los repositorios son los únicos que conocen ambos mundos.

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

### 16.3 Ejemplo Conceptual de un Mapper

```typescript
// infrastructure/mappers/UsuarioMapper.ts

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
      codigoBarras: raw.codigo_barras
        ? CodigoBarras.create(raw.codigo_barras)
        : null,
      nombre: raw.nombre,
      apellido: raw.apellido,
      correo: Email.create(raw.correo),
      telefono: raw.telefono
        ? Telefono.create(raw.telefono, raw.lada, raw.extension)
        : null,
      genero: (raw.genero as Genero) ?? Genero.OTRO,
      carrera: raw.carrera,
      dependencia: raw.dependencia,
      idCargo: raw.id_cargo ?? 0,
      idTipoUsuario: raw.id_tipo_usuario ?? 0,
      idInstitucion: raw.id_institucion ?? 0,
      idEntidadFederativa: raw.id_entidad_federativa ?? 0,
      verificado: raw.verificado ?? false,
      fechaRegistro: raw.fecha_registro ?? new Date(),
    });
  }

  static toPersistence(usuario: Usuario) {
    return {
      ...(usuario.folioRegistro
        ? { folio_registro: usuario.folioRegistro.toString() }
        : {}),
      ...(usuario.codigoBarras
        ? { codigo_barras: usuario.codigoBarras.toString() }
        : {}),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo.toString(),
      telefono: usuario.telefono?.getNumero() ?? null,
      lada: usuario.telefono?.getLada() ?? null,
      extension: usuario.telefono?.getExtension() ?? null,
      genero: usuario.genero as string,
      carrera: usuario.carrera,
      dependencia: usuario.dependencia,
      id_cargo: usuario.idCargo,
      id_tipo_usuario: usuario.idTipoUsuario,
      id_institucion: usuario.idInstitucion,
      id_entidad_federativa: usuario.idEntidadFederativa,
      verificado: usuario.verificado,
    };
  }
}
```

### 16.4 Ejemplo Conceptual de un Repositorio con Prisma + Mapper

```typescript
// infrastructure/repositories/PrismaUsuarioRepository.ts

import { PrismaClient } from "@/generated/prisma/client";
import type { IUsuarioRepository } from "@/application/ports/IUsuarioRepository";
import type { Usuario } from "@/core/entities/Usuario";
import type { Email } from "@/core/value-objects/Email";
import type { FolioRegistro } from "@/core/value-objects/FolioRegistro";
import { UsuarioMapper } from "@/infrastructure/mappers/UsuarioMapper";

export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(usuario: Usuario): Promise<Usuario> {
    const data = UsuarioMapper.toPersistence(usuario);
    const created = await this.prisma.usuarios.create({ data });
    return UsuarioMapper.toDomain(created);
  }

  async buscarPorCorreo(correo: Email): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({
      where: { correo: correo.toString() },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({
      where: { folio_registro: id },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async buscarPorFolio(folio: FolioRegistro): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({
      where: { folio_registro: folio.toString() },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async crearMuchos(usuarios: Usuario[]): Promise<Usuario[]> {
    const results: Usuario[] = [];
    for (const usuario of usuarios) {
      const created = await this.crear(usuario);
      results.push(created);
    }
    return results;
  }

  async verificar(id: string): Promise<void> {
    await this.prisma.usuarios.update({
      where: { folio_registro: id },
      data: { verificado: true },
    });
  }

  async crearGrupoTransaccional(data: any) {
    return this.prisma.$transaction(async (tx) => {
      const resultados: any[] = [];
      for (const miembro of data.miembros) {
        const created = await tx.usuarios.create({ data: miembro });
        resultados.push(created);
      }
      return { usuariosIds: resultados, folios: resultados.map(r => r.folio_registro) };
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
        P["PrismaClient"]
        DB[("PostgreSQL")]
    end

    R -->|"toPersistence()"| M
    M -->|"datos primitivos"| P
    P -->|"SQL"| DB
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

- **Contexto:** Next.js App Router ofrece Server Actions que ejecutan código en el servidor directamente desde el cliente.
- **Decisión:** Usar Server Actions como la capa de "controladores" en vez de API Routes.
- **Razón:** Elimina la necesidad de fetch manual, tipado end-to-end, colocalización de form handling con la UI, y reduce boilerplate.
- **Consecuencia:** Los Server Actions **solo** validan input y orquestan la creación del Use Case; **nunca** contienen lógica de negocio.

### ADR-02: ORM + Data Mapper Pattern

- **Contexto:** Se necesita acceso a la base de datos con type-safety, migraciones automáticas y productividad, sin acoplar el dominio al ORM.
- **Decisión:** Usar **Prisma** como ORM dentro de la capa de infraestructura, combinado con un **Data Mapper** por entidad que convierte los objetos generados por Prisma (`PrismaUsuario`, `PrismaDeposito`, etc.) a las entidades puras del dominio (`Usuario`, `Deposito`, etc.) y viceversa.
- **Razón:** Prisma ofrece type-safety, migraciones, introspección del esquema y un excelente Developer Experience. El Data Mapper actúa como barrera de aislamiento: el dominio **nunca** importa ni conoce Prisma. Los repositorios usan Prisma internamente y exponen exclusivamente entidades de dominio.
- **Consecuencia:**
  - Cada repositorio tiene un mapper asociado (e.g., `UsuarioMapper`) con métodos `toDomain()` y `toPersistence()`.
  - La capa de dominio permanece pura (cero dependencias externas), cumpliendo Clean Architecture.
  - Si en el futuro se cambia de Prisma a Drizzle, Kysely, o queries raw, solo se reescriben los repositorios y mappers — los Use Cases y el dominio no se tocan.
  - El esquema de Prisma (`schema.prisma`) vive en `infrastructure/database/` y es la fuente de verdad del esquema de BD.

### ADR-03: Feature Flag para Registro Grupal

- **Contexto:** El registro grupal es una funcionalidad que puede o no requerirse en el flujo inicial.
- **Decisión:** Controlarlo con una variable de entorno `ENABLE_GROUP_REGISTRATION` que condiciona la UI y el routing del Server Action.
- **Razón:** Permite activar/desactivar sin redespliegue del código, solo cambiando la variable.
- **Consecuencia:** El código de grupo siempre existe en el bundle pero no se ejecuta si está deshabilitado.

### ADR-04: Value Objects para Validación de Dominio

- **Contexto:** Campos como `Email`, `Monto`, `FolioRegistro` tienen reglas de validación intrínsecas.
- **Decisión:** Modelarlos como Value Objects inmutables que validan en su constructor (`create` factory).
- **Razón:** La validación de negocio vive en el dominio, no en Zod ni en la BD. Zod valida forma (string, number), el dominio valida semántica (es un email válido, el monto es positivo).
- **Consecuencia:** Doble validación (Zod en action + VO en dominio) que garantiza integridad incluso si se usa el caso de uso desde otro contexto.

### ADR-05: Generación de PDF en el Servidor

- **Contexto:** Las constancias PDF deben generarse con un template consistente.
- **Decisión:** Generar PDFs del lado del servidor usando `@react-pdf/renderer` (o alternativa) dentro de un adapter.
- **Razón:** Control total sobre el template, no depende del navegador del usuario, se puede adjuntar al correo directamente.
- **Consecuencia:** El buffer del PDF se genera en memoria, se sube al storage y se adjunta al correo en un solo flujo.

### ADR-06: Comprobante de Pago como Archivo Adjunto en Entidad Deposito

- **Contexto:** El sistema requería originalmente el uso de la tabla `depositos` para la captura manual de datos bancarios (banco, sucursal, ciudad, referencia, monto). En paralelo existió una tabla `comprobantes_pago` que luego resultó redundante.
- **Decisión:** Mantener la tabla y entidad `Deposito`, pero actualizarla para permitir la **carga de un archivo** (imagen o PDF) del comprobante de pago directamente en el formulario de registro. El archivo se sube a `IStorageService` y sus metadatos (URL, mime, tamaño) se guardan directamente en `depositos`. La tabla `comprobantes_pago` fue eliminada.
- **Razón:** Simplifica el esquema eliminando duplicidad, reduce errores de captura manual, y consolida la fuente de verdad del pago para su verificación posterior.
- **Reglas:**
  - **Registro individual:** El asistente sube **un comprobante** junto con sus datos.
  - **Registro grupal:** El responsable sube **un único comprobante** que cubre a todo el grupo. La UI muestra feedback del costo total (precio × N+1 integrantes) para que el responsable sepa cuánto debe cubrir el comprobante.
  - **Verificación del pago:** Es un proceso **manual externo** fuera del alcance del módulo público. El acceso a los archivos comprobantes desde el CPanel está restringido explícitamente a los administradores (`ADR-10`).
- **Consecuencia:**
  - La entidad `Deposito` incorpora el Value Object `ArchivoComprobante` que valida tipo MIME (image/png, image/jpeg, application/pdf) y tamaño máximo.
  - El uso de URLs firmadas temporales para archivos protegidos requirió control de acceso (`ObtenerAccesoArchivo`).
  - La tabla `comprobantes_pago` fue descartada y todas las referencias migradas a repositorios y mappers de `Deposito`.

### ADR-07: tipo_usuario No Se Hereda en Registro Grupal

- **Contexto:** En el diseño original, al registrar un grupo, el `tipo_usuario` del responsable se heredaba automáticamente a todos los miembros (asumiendo que todos son del mismo tipo, e.g., "todos son estudiantes").
- **Decisión:** Cada miembro del grupo debe especificar su propio `tipo_usuario` de forma independiente. No se hereda del responsable.
- **Razón:** Un profesor puede inscribir a sus estudiantes, y estos no deben quedar registrados como "Académico". El tipo de usuario es un atributo individual que depende del rol real de cada persona, no del rol de quien los registra.
- **Consecuencia:**
  - El `MiembroInput` incluye el campo `idTipoUsuario`.
  - La entidad `GrupoRegistro` ya no tiene `idTipoUsuarioCompartido`.
  - El formulario grupal muestra un selector de `tipo_usuario` por cada miembro.
  - Solo se heredan `id_institucion` e `id_entidad_federativa`.

### ADR-08: Usuario Ya Registrado Puede Ser Responsable de Grupo

- **Contexto:** Un usuario que ya se registró individualmente no puede volver a registrarse (correo duplicado). Sin embargo, puede necesitar inscribir a otras personas (e.g., un profesor inscribe a sus alumnos).
- **Decisión:** Permitir que un usuario ya registrado actúe como responsable de un registro grupal sin crear un duplicado. En este caso, solo se registran los miembros nuevos del grupo.
- **Razón:** Es un caso de uso frecuente en instituciones educativas: un profesor o responsable institucional se registra primero individualmente y luego registra a su grupo de estudiantes/colegas.
- **Consecuencia:**
  - El Use Case `RegistrarGrupoRapido` primero verifica si el correo del responsable ya existe en BD.
  - Si existe, se reutiliza la entidad `Usuario` existente como responsable del `GrupoRegistro` (con flag `responsableYaRegistrado = true`).
  - Solo los miembros nuevos se crean en BD (`obtenerNuevosRegistros()` excluye al responsable existente).
  - El comprobante grupal se asocia al ID del usuario existente.
  - Los correos de miembros se siguen validando como únicos (no pueden estar previamente registrados).

### ADR-09: Delegación del Envío de Constancias al Administrador

- **Contexto:** Inicialmente el caso de uso de registro público generaba la constancia y la adjuntaba al correo de bienvenida; sin embargo, esto generaba bloqueos asíncronos y enviaba documentos que formalmente requerían verificación manual previa del pago real.
- **Decisión:** Mover la responsabilidad del envío de constancias al caso de uso `EnviarConfirmacion` ejecutado explícitamente desde el Panel de Administración.
- **Razón:** Disminuye el tiempo de respuesta del registro público, almacena la constancia tranquilamente en `IStorageService` y obliga a una revisión del pago antes de hacer llegar los documentos formales al asistente. Solo se envía confirmación de registro al asistente.
- **Consecuencia:**
  - `RegistrarUsuario` y `RegistrarGrupoRapido` continúan generando el PDF para almacenamiento, pero omiten el attachment del mail.
  - El Panel de Administración proporciona una acción (`reenviarConstanciaAction`) para instruir a `EnviarConfirmacion` descargar y enviar el documento bajo demanda.

### ADR-10: Migración de Autenticación a Auth.js (NextAuth)

- **Contexto:** Previamente, el sistema del CPanel utilizaba la capa externa de Supabase Auth, lo cual requería sincronizar identidades de la BD local con el servicio de Supabase o requería dos flujos, y no era portable.
- **Decisión:** Implementar **Auth.js** (NextAuth) basado directamente en persistencia de base de datos usando el adaptador de Prisma para administrar sesiones locales.
- **Razón:** Proporciona un entorno sin bloqueos de vendor-lockin, se coordina mejor con el App Router de Next.js (`auth()` functions o Middleware) para proteger el dashboard administrativo y unifica el rol de accesos utilizando la capa persistente PostgreSQL/Prisma.
- **Consecuencia:**
  - La tabla `accesos` fue actualizada para almacenar un campo `password` (con hashing) para administradores.
  - En consecuencia, el acceso a archivos de validación (`ObtenerAccesoArchivo`) o los listados (`ObtenerUsuariosForAdmin`) integran validación de rol de cuenta local obtenida mediante la sesión de Auth.js.

### ADR-11: Migración de PK Numérica a Folio String (`folio_registro`)

- **Contexto:** Originalmente el diseño usaba un `id_usuario` numérico auto-incremental como PK de `usuarios`, con un `folio_recibo` separado.
- **Decisión:** Migrar a `folio_registro` (VARCHAR(15)) como clave primaria única de `usuarios`, auto-generada por secuencia PostgreSQL (formato `ANI26-XXXX`).
- **Razón:** El folio es un identificador significativo y público para el asistente (aparece en constancias y correos). Tenerlo como PK simplifica las relaciones y evita un campo artificial adicional.
- **Consecuencia:**
  - Todas las tablas relacionadas (`depositos`, `facturaciones`, `accesos`, `inscripcion_actividades`) referencian `folio_registro` como FK.
  - Los repositorios y mappers operan con `string` en vez de `number` para identificar usuarios.
  - Se eliminó el Value Object `FolioRecibo` en favor de `FolioRegistro`.
  - La entidad `Usuario` ya no tiene `idUsuario` ni `folioRecibo`, solo `folioRegistro`.

### ADR-12: Nodemailer como Proveedor de Correo

- **Contexto:** El diseño original contemplaba Resend como proveedor de correo. En producción se migró a Gmail SMTP via Nodemailer.
- **Decisión:** Implementar `NodemailerEmailService` como adaptador concreto, usando credenciales SMTP de Gmail (`GMAIL_USER`, `GMAIL_APP_PASSWORD`).
- **Razón:** Gmail SMTP es gratuito, confiable, y no requiere configuración de DNS adicional (DKIM, SPF) para dominios personalizados. Nodemailer es la librería estándar de Node.js para envío de correos.
- **Consecuencia:**
  - El container factory usa `GMAIL_USER` y `GMAIL_APP_PASSWORD` en vez de `RESEND_API_KEY`.
  - Se generaron templates HTML adicionales para actividades y notificaciones de ponentes.
  - El puerto `IEmailService` fue expandido de 2 a 7 métodos para cubrir todos los tipos de correo.

### ADR-13: Registro de Actividades como Dato Opcional en RegistroUsuarioDTO

- **Contexto:** El congreso ANIEI 2026 ofrece actividades paralelas (talleres, cursos) con costo adicional opcional.
- **Decisión:** Incluir `actividadesIds?: number[]` en el `RegistroUsuarioDTO` y procesar la inscripción como parte opcional del flujo de registro.
- **Razón:** Permite que el asistente seleccione actividades durante el registro sin fricción adicional, simplificando el flujo de usuario.
- **Consecuencia:**
  - `RegistrarUsuario` ahora depende también de `IActividadRepository` e `IInscripcionActividadRepository`.
  - El wizard de registro (6 pasos) incluye `StepActividades` para selección.
  - El costo de actividades se suma al monto del comprobante en el checkout.

---

## Apéndice A: Mapeo Dominio ↔ Base de Datos

| Entidad de Dominio   | Tabla PostgreSQL       | Notas                                        |
|-----------------------|------------------------|----------------------------------------------|
| `Usuario`             | `usuarios`             | Entidad principal                            |
| `Deposito`            | `depositos`            | Contiene info del comprobante subido (URL)   |
| `Facturacion`         | `facturaciones`        | Datos fiscales                               |
| `GrupoRegistro`       | — (no tiene tabla)     | Concepto de aplicación, no de BD             |
| `Acceso`              | `accesos`              | Credenciales administrativas (Auth.js)       |
| `Cargo` (catálogo)    | `cargos`               | Lectura solamente                            |
| `Estado` (catálogo)   | `estados`              | Lectura solamente                            |
| `Institucion` (cat)   | `instituciones`        | Lectura solamente                            |
| `TipoUsuario` (cat)   | `tipo_usuario`         | Lectura solamente                            |
| `TipoActividad` (cat)  | `tipo_actividad`       | Lectura solamente                            |
| `Actividad`            | `actividades`          | Actividades del congreso                     |
| `InscripcionActividad` | `inscripcion_actividades` | Relación usuario-actividad                |
| `Ponente`              | `actividad_ponentes`   | Ponentes de actividades                      |

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

# ── Feature Flags ──
ENABLE_GROUP_REGISTRATION="true"     # "true" | "false"

# ── App ──
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Nota:** El `DIRECT_URL` es usado por `@prisma/adapter-pg` (PrismaPg) en `infrastructure/database/client.ts` para la conexión directa sin pooler. El `DATABASE_URL` es la URL del pooler para uso general de Prisma CLI.
