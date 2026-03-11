# PLAN & DESIGN — Sistema de Registro ANIEI 2026

> **Estado:** Fase de Planificación y Diseño  
> **Stack:** Next.js 15 (App Router) · PostgreSQL 17 · TypeScript  
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
13. [Estrategia de Infraestructura Intercambiable](#13-estrategia-de-infraestructura-intercambiable)
14. [Decisiones de Diseño (ADRs)](#14-decisiones-de-diseño-adrs)

---

## 1. Visión General

Sistema web de inscripción al congreso ANIEI 2026 que permite:

- **Registro individual** de asistentes al congreso.
- **Registro grupal** (una persona inscribe N personas de la misma institución).
- **Confirmación por correo** electrónico tras el registro exitoso.
- **Generación de constancia PDF** de inscripción/participación.
- **Independencia de proveedores** de infraestructura (BD, correo, almacenamiento de archivos).

El sistema se construye sobre Next.js aprovechando **Server Actions** como punto de entrada al backend, colocando frontend y backend en el mismo repositorio pero con separación lógica estricta entre capas.

---

## 2. Requisitos Funcionales

| ID    | Requisito                                                                 | Prioridad |
|-------|---------------------------------------------------------------------------|-----------|
| RF-01 | Registro individual de asistente (datos personales + institución)         | Alta      |
| RF-02 | Registro de depósito/comprobante de pago                                  | Alta      |
| RF-03 | Envío de correo de confirmación de inscripción                            | Alta      |
| RF-04 | Generación y envío de constancia PDF de inscripción                       | Alta      |
| RF-05 | Registro grupal: una persona registra N asistentes de su misma institución| Media     |
| RF-06 | Solicitud de facturación                                                  | Media     |
| RF-07 | Verificación de inscripción (flujo admin o automático)                    | Media     |

---

## 3. Requisitos No Funcionales

| ID     | Requisito                                                                               |
|--------|-----------------------------------------------------------------------------------------|
| RNF-01 | La capa de dominio y aplicación **NO** deben depender de frameworks ni librerías externas |
| RNF-02 | Cambiar de proveedor de BD (Supabase → VPS PostgreSQL) no debe afectar casos de uso      |
| RNF-03 | Cambiar proveedor de correo (Resend → SendGrid → SMTP propio) requiere solo un adaptador  |
| RNF-04 | Cambiar almacenamiento (Supabase Storage → S3 → filesystem) requiere solo un adaptador    |
| RNF-05 | El módulo de registro grupal debe poder activarse/desactivarse sin modificar el flujo base |
| RNF-06 | El sistema debe ser desplegable en Vercel, Docker (VPS) o cualquier plataforma Node.js     |

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
│  │    repositories/ → Implementaciones concretas (PG, etc.)  │  │
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
src/
├── app/                          # ── PRESENTATION LAYER (Next.js) ──
│   ├── layout.tsx
│   ├── page.tsx
│   ├── registro/
│   │   ├── page.tsx              # Página de registro individual
│   │   ├── components/           # Componentes UI del registro
│   │   │   ├── RegistroForm.tsx
│   │   │   ├── GrupoForm.tsx     # UI modular de registro grupal
│   │   │   └── ...
│   │   └── actions/
│   │       ├── registrar-usuario.action.ts    # Server Action
│   │       └── registrar-grupo.action.ts      # Server Action (modular)
│   ├── confirmacion/
│   │   └── page.tsx
│   └── constancia/
│       └── [folio]/
│           └── page.tsx
│
├── core/                         # ── DOMAIN LAYER (puro TypeScript) ──
│   ├── entities/
│   │   ├── Usuario.ts
│   │   ├── Deposito.ts
│   │   ├── Facturacion.ts
│   │   ├── Actividad.ts
│   │   ├── AsistenciaActividad.ts
│   │   └── GrupoRegistro.ts     # Entidad para registro grupal
│   ├── value-objects/
│   │   ├── Email.ts
│   │   ├── Telefono.ts
│   │   ├── FolioRecibo.ts
│   │   ├── CodigoBarras.ts
│   │   └── Monto.ts
│   ├── errors/
│   │   ├── RegistroError.ts
│   │   ├── DepositoError.ts
│   │   └── GrupoRegistroError.ts
│   └── enums/
│       └── Genero.ts
│
├── application/                  # ── APPLICATION LAYER ──
│   ├── ports/                    # Interfaces (contratos)
│   │   ├── IUsuarioRepository.ts
│   │   ├── IDepositoRepository.ts
│   │   ├── IFacturacionRepository.ts
│   │   ├── IEmailService.ts
│   │   ├── IPdfService.ts
│   │   └── IStorageService.ts
│   ├── use-cases/
│   │   ├── RegistrarUsuario.ts
│   │   ├── RegistrarGrupo.ts           # Modular
│   │   ├── RegistrarDeposito.ts
│   │   ├── EnviarConfirmacion.ts
│   │   ├── GenerarConstancia.ts
│   │   └── SolicitarFacturacion.ts
│   └── dtos/
│       ├── RegistroUsuarioDTO.ts
│       ├── RegistroGrupoDTO.ts
│       ├── DepositoDTO.ts
│       └── FacturacionDTO.ts
│
├── infrastructure/               # ── INFRASTRUCTURE LAYER ──
│   ├── repositories/
│   │   ├── PostgresUsuarioRepository.ts
│   │   ├── PostgresDepositoRepository.ts
│   │   └── PostgresFacturacionRepository.ts
│   ├── services/
│   │   ├── email/
│   │   │   ├── ResendEmailService.ts       # Adaptador Resend
│   │   │   ├── NodemailerEmailService.ts   # Adaptador SMTP genérico
│   │   │   └── SendGridEmailService.ts     # Adaptador SendGrid
│   │   ├── pdf/
│   │   │   ├── ReactPdfService.ts          # Adaptador @react-pdf/renderer
│   │   │   └── PuppeteerPdfService.ts      # Adaptador alternativo
│   │   └── storage/
│   │       ├── SupabaseStorageService.ts   # Adaptador Supabase Storage
│   │       ├── S3StorageService.ts         # Adaptador AWS S3
│   │       └── LocalStorageService.ts      # Adaptador filesystem local
│   ├── database/
│   │   ├── connection.ts                   # Pool de conexiones PG
│   │   └── migrations/
│   └── config/
│       └── container.ts                    # Dependency Injection / Factory
│
└── shared/                       # ── UTILIDADES COMPARTIDAS ──
    ├── types/                    # Tipos TypeScript compartidos
    ├── validation/               # Schemas Zod (validación de input)
    │   ├── registro.schema.ts
    │   └── grupo.schema.ts
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
        UC["Use Cases<br/>RegistrarUsuario<br/>RegistrarGrupo<br/>EnviarConfirmacion<br/>GenerarConstancia"]
        DTO["DTOs"]
        Ports["Ports (Interfaces)<br/>IUsuarioRepository<br/>IEmailService<br/>IPdfService<br/>IStorageService"]
    end

    subgraph Domain["🧠 Domain Layer (Pure TypeScript)"]
        Entities["Entities<br/>Usuario · Deposito<br/>Facturacion · GrupoRegistro"]
        VO["Value Objects<br/>Email · FolioRecibo<br/>Monto · CodigoBarras"]
        DErr["Domain Errors"]
    end

    subgraph Infrastructure["🔌 Infrastructure Layer (Adapters)"]
        Repos["Repositories<br/>PostgresUsuarioRepo<br/>PostgresDepositoRepo"]
        EmailSvc["Email Adapters<br/>Resend · Nodemailer · SendGrid"]
        PdfSvc["PDF Adapters<br/>ReactPdf · Puppeteer"]
        StoreSvc["Storage Adapters<br/>Supabase · S3 · Local"]
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

    Repos -->|"query/insert"| DB

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
        -idUsuario: number | null
        -folioRecibo: FolioRecibo | null
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
        +asignarFolio(folio: FolioRecibo): void
    }

    class Deposito {
        -idDeposito: number | null
        -idUsuario: number
        -bancoSucursal: string
        -ciudad: string
        -referencia: string
        -monto: Monto
        -fechaDeposito: Date
        -fechaRegistro: Date
        +static create(props): Deposito
    }

    class Facturacion {
        -idFacturacion: number | null
        -idUsuario: number
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
        +static create(responsable, miembros): GrupoRegistro
        +agregarMiembro(m: Usuario): void
        +obtenerTodos(): Usuario[]
        +totalIntegrantes(): number
    }

    class Email {
        <<value-object>>
        -valor: string
        +static create(email: string): Email
        +toString(): string
    }

    class FolioRecibo {
        <<value-object>>
        -valor: string
        +static create(folio: string): FolioRecibo
        +toString(): string
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

    class Telefono {
        <<value-object>>
        -numero: string
        -lada: string | null
        -extension: string | null
        +static create(num, lada?, ext?): Telefono
        +completo(): string
    }

    class Genero {
        <<enumeration>>
        MASCULINO
        FEMENINO
        OTRO
    }

    Usuario *-- Email
    Usuario *-- Telefono
    Usuario *-- FolioRecibo
    Usuario *-- CodigoBarras
    Deposito *-- Monto
    GrupoRegistro "1" *-- "1" Usuario : responsable
    GrupoRegistro "1" *-- "*" Usuario : miembros
```

### 7.2 Catálogos

Los catálogos (`cargos`, `estados`, `instituciones`, `tipo_usuario`) se tratan como **datos de referencia** que se consultan por ID. No son entidades ricas del dominio; se modelan como tipos simples o interfaces de solo lectura:

```typescript
// No son clases con lógica, solo tipos para catálogos
interface Cargo { idCargo: number; descripcion: string }
interface Estado { idEntidadFederativa: number; nombre: string }
interface Institucion { idInstitucion: number; nombre: string; abreviatura: string | null }
interface TipoUsuario { idTipoUsuario: number; descripcion: string }
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
        +buscarPorId(id: number): Promise~Usuario | null~
        +buscarPorFolio(folio: FolioRecibo): Promise~Usuario | null~
        +verificar(id: number): Promise~void~
    }

    class IDepositoRepository {
        <<port>>
        +crear(deposito: Deposito): Promise~Deposito~
        +buscarPorUsuario(idUsuario: number): Promise~Deposito[]~
        +buscarPorReferencia(ref: string): Promise~Deposito | null~
    }

    class IFacturacionRepository {
        <<port>>
        +crear(facturacion: Facturacion): Promise~Facturacion~
        +buscarPorUsuario(idUsuario: number): Promise~Facturacion | null~
    }

    class ICatalogoRepository {
        <<port>>
        +obtenerCargos(): Promise~Cargo[]~
        +obtenerEstados(): Promise~Estado[]~
        +obtenerInstituciones(): Promise~Institucion[]~
        +obtenerTiposUsuario(): Promise~TipoUsuario[]~
    }

    class IEmailService {
        <<port>>
        +enviarConfirmacionRegistro(destinatario: Email, datos: ConfirmacionData): Promise~void~
        +enviarConstancia(destinatario: Email, pdfBuffer: Buffer): Promise~void~
    }

    class IPdfService {
        <<port>>
        +generarConstanciaInscripcion(datos: ConstanciaData): Promise~Buffer~
    }

    class IStorageService {
        <<port>>
        +subir(ruta: string, buffer: Buffer, mime: string): Promise~string~
        +obtenerUrl(ruta: string): Promise~string~
        +eliminar(ruta: string): Promise~void~
    }

    class PostgresUsuarioRepo {
        <<adapter>>
    }
    class ResendEmailService {
        <<adapter>>
    }
    class ReactPdfService {
        <<adapter>>
    }
    class SupabaseStorageService {
        <<adapter>>
    }

    IUsuarioRepository <|.. PostgresUsuarioRepo
    IEmailService <|.. ResendEmailService
    IPdfService <|.. ReactPdfService
    IStorageService <|.. SupabaseStorageService
```

### 8.2 Dependency Injection Container

El container es una **simple factory** que decide qué adaptador concreto instanciar según variables de entorno. No se necesita un framework DI complejo:

```
container.ts
├── getUsuarioRepository()   → PostgresUsuarioRepository (o SupabaseUsuarioRepository)
├── getEmailService()        → ResendEmailService | NodemailerEmailService | ...
├── getPdfService()          → ReactPdfService | PuppeteerPdfService
└── getStorageService()      → SupabaseStorageService | S3StorageService | LocalStorageService
```

**Selección por variable de entorno:**

```
EMAIL_PROVIDER=resend | sendgrid | nodemailer
STORAGE_PROVIDER=supabase | s3 | local
PDF_PROVIDER=react-pdf | puppeteer
DB_PROVIDER=postgres-direct | supabase-client
```

---

## 9. Casos de Uso

### 9.1 Diagrama de Clases de Use Cases

```mermaid
classDiagram
    class RegistrarUsuario {
        -usuarioRepo: IUsuarioRepository
        -emailService: IEmailService
        -pdfService: IPdfService
        -storageService: IStorageService
        +execute(dto: RegistroUsuarioDTO): Promise~ResultadoRegistro~
    }

    class RegistrarGrupo {
        -usuarioRepo: IUsuarioRepository
        -emailService: IEmailService
        -pdfService: IPdfService
        -storageService: IStorageService
        +execute(dto: RegistroGrupoDTO): Promise~ResultadoRegistroGrupo~
    }

    class RegistrarDeposito {
        -depositoRepo: IDepositoRepository
        -usuarioRepo: IUsuarioRepository
        +execute(dto: DepositoDTO): Promise~Deposito~
    }

    class GenerarConstancia {
        -pdfService: IPdfService
        -storageService: IStorageService
        -usuarioRepo: IUsuarioRepository
        +execute(idUsuario: number): Promise~string~
    }

    class EnviarConfirmacion {
        -emailService: IEmailService
        -usuarioRepo: IUsuarioRepository
        +execute(idUsuario: number): Promise~void~
    }

    class SolicitarFacturacion {
        -facturacionRepo: IFacturacionRepository
        -usuarioRepo: IUsuarioRepository
        +execute(dto: FacturacionDTO): Promise~Facturacion~
    }

    RegistrarUsuario ..> IUsuarioRepository
    RegistrarUsuario ..> IEmailService
    RegistrarUsuario ..> IPdfService
    RegistrarUsuario ..> IStorageService

    RegistrarGrupo ..> IUsuarioRepository
    RegistrarGrupo ..> IEmailService
    RegistrarGrupo ..> IPdfService
    RegistrarGrupo ..> IStorageService

    RegistrarDeposito ..> IDepositoRepository
    GenerarConstancia ..> IPdfService
    GenerarConstancia ..> IStorageService
    EnviarConfirmacion ..> IEmailService
    SolicitarFacturacion ..> IFacturacionRepository
```

### 9.2 Descripción de Casos de Uso Principales

#### UC-01: Registrar Usuario (Inscripción Individual)

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Asistente                                                                          |
| **Precondición**| El correo no está registrado previamente                                           |
| **Flujo**       | 1. Asistente llena formulario → 2. Validación → 3. Crear entidad Usuario → 4. Persistir → 5. Generar constancia PDF → 6. Almacenar PDF → 7. Enviar correo de confirmación con constancia adjunta |
| **Postcondición**| Usuario creado, correo enviado, constancia PDF almacenada                         |
| **Error**       | Correo duplicado → `RegistroError.CORREO_DUPLICADO`                               |

#### UC-02: Registrar Grupo

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Responsable del grupo                                                              |
| **Precondición**| Módulo de grupo **activado** en configuración del sistema                          |
| **Flujo**       | 1. Responsable llena su formulario + datos de N miembros → 2. Campos compartidos (institución, estado) se heredan → 3. Se crea `GrupoRegistro` → 4. Se persisten todos los usuarios → 5. Se genera constancia para cada uno → 6. Se envía correo de confirmación al responsable y opcionalmente a cada miembro |
| **Postcondición**| N+1 usuarios creados, correos enviados, constancias generadas                     |

#### UC-03: Generar Constancia

| Campo           | Detalle                                                                            |
|-----------------|------------------------------------------------------------------------------------|
| **Actor**       | Sistema (automático tras registro) o Asistente (descarga manual)                   |
| **Flujo**       | 1. Obtener datos del usuario → 2. Renderizar PDF con template → 3. Subir a storage → 4. Retornar URL |

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
    participant Repo as IUsuarioRepository<br/>(Port → Adapter)
    participant PDF as IPdfService<br/>(Port → Adapter)
    participant Store as IStorageService<br/>(Port → Adapter)
    participant Mail as IEmailService<br/>(Port → Adapter)
    participant DB as PostgreSQL

    A->>CC: Llena formulario y envía
    CC->>SA: submit (FormData)
    SA->>Val: validar(formData)
    
    alt Validación falla
        Val-->>SA: errors[]
        SA-->>CC: { success: false, errors }
        CC-->>A: Muestra errores
    end

    Val-->>SA: RegistroUsuarioDTO ✓

    SA->>UC: execute(dto)
    
    UC->>Repo: buscarPorCorreo(dto.correo)
    Repo->>DB: SELECT ... WHERE correo = $1
    DB-->>Repo: null (no existe)
    Repo-->>UC: null ✓

    UC->>Dom: Usuario.create(props)
    Dom-->>UC: usuario (entidad)

    UC->>Repo: crear(usuario)
    Repo->>DB: INSERT INTO usuarios ...
    DB-->>Repo: usuario con id
    Repo-->>UC: usuario persistido

    UC->>PDF: generarConstanciaInscripcion(datos)
    PDF-->>UC: pdfBuffer

    UC->>Store: subir("constancias/{folio}.pdf", buffer)
    Store-->>UC: urlConstancia

    UC->>Mail: enviarConfirmacionRegistro(correo, datos)
    UC->>Mail: enviarConstancia(correo, pdfBuffer)
    Mail-->>UC: ✓ enviado

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
    participant UC as RegistrarGrupo<br/>(Use Case)
    participant Dom as GrupoRegistro<br/>(Entity)
    participant Repo as IUsuarioRepository
    participant PDF as IPdfService
    participant Store as IStorageService
    participant Mail as IEmailService
    participant DB as PostgreSQL

    R->>CC: Llena datos propios +<br/>datos de N miembros
    CC->>SA: submit (FormData)
    SA->>Val: validar(formData)
    Val-->>SA: RegistroGrupoDTO ✓

    SA->>UC: execute(dto)
    
    Note over UC: Verifica que ningún correo<br/>esté ya registrado

    loop Para cada correo en [responsable + miembros]
        UC->>Repo: buscarPorCorreo(correo)
        Repo->>DB: SELECT ...
        DB-->>Repo: null ✓
    end

    UC->>Dom: GrupoRegistro.create(responsable, miembros)
    Note over Dom: Campos institución, estado<br/>se heredan del responsable<br/>a los miembros

    Dom-->>UC: grupoRegistro

    UC->>Repo: crearMuchos(grupoRegistro.obtenerTodos())
    Repo->>DB: INSERT INTO usuarios ... (batch)
    DB-->>Repo: usuarios[]

    loop Para cada usuario registrado
        UC->>PDF: generarConstanciaInscripcion(datos)
        PDF-->>UC: pdfBuffer
        UC->>Store: subir("constancias/{folio}.pdf", buffer)
        Store-->>UC: url
    end

    UC->>Mail: enviarConfirmacionRegistro(responsable.correo, datosGrupo)
    
    loop Para cada miembro con correo
        UC->>Mail: enviarConstancia(miembro.correo, pdfBuffer)
    end

    UC-->>SA: { success: true, registros: N+1 }
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
    Container-->>SA: resendEmailService
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
    
    D --> F[Llenar campos:<br/>nombre, apellido, correo,<br/>teléfono, género, carrera,<br/>dependencia, institución,<br/>estado, cargo, tipo usuario]
    
    E --> G[Llenar campos responsable<br/>+ campos reducidos por miembro:<br/>nombre, apellido, correo,<br/>género, carrera]
    
    F --> H{¿Validación OK?}
    G --> H
    
    H -->|No| I[Mostrar errores<br/>en formulario]
    I --> F
    I --> G
    
    H -->|Sí| J{"¿Correo(s) ya<br/>registrado(s)?"}
    
    J -->|Sí| K[Error: correo<br/>duplicado]
    K --> F
    K --> G
    
    J -->|No| L["Crear entidad(es)<br/>Usuario / GrupoRegistro"]
    
    L --> M[Persistir en BD]
    
    M --> N[Generar constancia PDF]
    
    N --> O[Almacenar PDF en storage]
    
    O --> P[Enviar correo de confirmación<br/>+ constancia adjunta]
    
    P --> Q([Mostrar página de confirmación<br/>con folio y enlace a constancia])
```

### 11.2 Flujo de Decisión: Módulo Grupal

```mermaid
flowchart TD
    A[Server Action recibe request]--> B{Feature Flag<br/>ENABLE_GROUP_REGISTRATION}
    
    B -->|false| C[Solo procesar<br/>registro individual]
    
    B -->|true| D{"¿Request incluye<br/>miembros[]?"}
    
    D -->|No| C
    D -->|Sí| E[Instanciar<br/>RegistrarGrupo UseCase]
    
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
2. **Use Case independiente** (`RegistrarGrupo`): no modifica `RegistrarUsuario`, lo complementa.
3. **Server Action separado**: `registrar-grupo.action.ts` existe junto a `registrar-usuario.action.ts`.
4. **UI condicional**: el componente `GrupoForm` solo se renderiza si la feature flag está activa.
5. **Sin cambios en BD**: los miembros del grupo son `usuarios` regulares; la relación grupal se maneja a nivel de aplicación.

#### Herencia de Campos en Grupo

Cuando se registra un grupo, los siguientes campos del **responsable** se **heredan** automáticamente a los miembros:

| Campo heredado       | Motivo                                           |
|----------------------|--------------------------------------------------|
| `id_institucion`     | Todos provienen de la misma institución           |
| `id_entidad_federativa` | Se asume misma ubicación institucional        |
| `id_tipo_usuario`    | Mismo tipo (e.g., todos son "estudiantes")        |

Campos **individuales** que cada miembro debe proporcionar:

| Campo individual     | Motivo                                           |
|----------------------|--------------------------------------------------|
| `nombre`             | Identificación personal                           |
| `apellido`           | Identificación personal                           |
| `correo`             | Único por persona, para enviar constancia         |
| `genero`             | Dato personal individual                          |
| `carrera`            | Puede variar aunque sean de la misma institución  |

### 12.2 Diagrama de la Entidad GrupoRegistro

```mermaid
classDiagram
    class GrupoRegistro {
        -responsable: Usuario
        -miembros: Usuario[]
        -idInstitucionCompartida: number
        -idEntidadCompartida: number
        -idTipoUsuarioCompartido: number

        +static create(responsable: Usuario, miembrosData: MiembroInput[]): GrupoRegistro
        +agregarMiembro(data: MiembroInput): void
        +removerMiembro(correo: Email): void
        +obtenerTodos(): Usuario[]
        +obtenerMiembros(): Usuario[]
        +totalIntegrantes(): number
    }

    class MiembroInput {
        <<interface>>
        +nombre: string
        +apellido: string
        +correo: string
        +genero: Genero
        +carrera: string | null
    }

    note for GrupoRegistro "Hereda id_institucion,\nid_entidad_federativa y\nid_tipo_usuario del responsable\nhacia todos los miembros"

    GrupoRegistro --> MiembroInput : recibe datos mínimos
```

---

## 13. Estrategia de Infraestructura Intercambiable

### 13.1 Mapa de Proveedores

```mermaid
graph LR
    subgraph Puertos["Puertos (Interfaces)"]
        P1["IUsuarioRepository"]
        P2["IEmailService"]
        P3["IPdfService"]
        P4["IStorageService"]
    end

    subgraph Actual["Adaptadores Actuales"]
        A1["PostgresUsuarioRepo<br/>(pg pool directo)"]
        A2["ResendEmailService"]
        A3["ReactPdfService"]
        A4["SupabaseStorageService"]
    end

    subgraph Futuro["Adaptadores Futuros"]
        F1["SupabaseUsuarioRepo<br/>(supabase-js client)"]
        F2["SendGridEmailService<br/>NodemailerEmailService"]
        F3["PuppeteerPdfService"]
        F4["S3StorageService<br/>LocalStorageService"]
    end

    P1 -.-> A1
    P1 -.-> F1
    P2 -.-> A2
    P2 -.-> F2
    P3 -.-> A3
    P3 -.-> F3
    P4 -.-> A4
    P4 -.-> F4
```

### 13.2 Ejemplo Conceptual del Container

```
// infrastructure/config/container.ts (pseudocódigo)

function getEmailService(): IEmailService {
    switch (env.EMAIL_PROVIDER) {
        case "resend":    return new ResendEmailService(env.RESEND_API_KEY)
        case "sendgrid":  return new SendGridEmailService(env.SENDGRID_API_KEY)
        case "nodemailer": return new NodemailerEmailService(env.SMTP_CONFIG)
    }
}

function getStorageService(): IStorageService {
    switch (env.STORAGE_PROVIDER) {
        case "supabase": return new SupabaseStorageService(env.SUPABASE_URL, env.SUPABASE_KEY)
        case "s3":       return new S3StorageService(env.AWS_CONFIG)
        case "local":    return new LocalStorageService(env.LOCAL_STORAGE_PATH)
    }
}
```

### 13.3 Escenarios de Migración

| Escenario                         | Qué cambia                              | Qué NO cambia                  |
|-----------------------------------|------------------------------------------|---------------------------------|
| Supabase → VPS con PostgreSQL     | `connection.ts` (connection string)      | Use Cases, Domain, Presentation |
| Resend → SendGrid                 | Nuevo adapter `SendGridEmailService`     | Use Cases, Domain, Presentation |
| Supabase Storage → S3             | Nuevo adapter `S3StorageService`         | Use Cases, Domain, Presentation |
| Agregar nuevo proveedor de PDF    | Nuevo adapter implementando `IPdfService`| Use Cases, Domain, Presentation |
| Desactivar registro grupal        | `ENABLE_GROUP_REGISTRATION=false`        | Todo el resto del sistema       |

---

## 14. Decisiones de Diseño (ADRs)

### ADR-01: Server Actions como Controllers

- **Contexto:** Next.js App Router ofrece Server Actions que ejecutan código en el servidor directamente desde el cliente.
- **Decisión:** Usar Server Actions como la capa de "controladores" en vez de API Routes.
- **Razón:** Elimina la necesidad de fetch manual, tipado end-to-end, colocalización de form handling con la UI, y reduce boilerplate.
- **Consecuencia:** Los Server Actions **solo** validan input y orquestan la creación del Use Case; **nunca** contienen lógica de negocio.

### ADR-02: No usar ORM

- **Contexto:** ORMs como Prisma o Drizzle acoplan la capa de persistencia al esquema.
- **Decisión:** Usar un query builder ligero (e.g., `pg` directo con queries parametrizadas, o Kysely para type safety) dentro de los adapters del repositorio.
- **Razón:** Mantener los repositories como adapters puros que podrían intercambiarse por cualquier fuente de datos.
- **Consecuencia:** Los adapters de repositorio mapean filas SQL a entidades de dominio manualmente (hidratación).

### ADR-03: Feature Flag para Registro Grupal

- **Contexto:** El registro grupal es una funcionalidad que puede o no requerirse en el flujo inicial.
- **Decisión:** Controlarlo con una variable de entorno `ENABLE_GROUP_REGISTRATION` que condiciona la UI y el routing del Server Action.
- **Razón:** Permite activar/desactivar sin redespliegue del código, solo cambiando la variable.
- **Consecuencia:** El código de grupo siempre existe en el bundle pero no se ejecuta si está deshabilitado.

### ADR-04: Value Objects para Validación de Dominio

- **Contexto:** Campos como `Email`, `Monto`, `FolioRecibo` tienen reglas de validación intrínsecas.
- **Decisión:** Modelarlos como Value Objects inmutables que validan en su constructor (`create` factory).
- **Razón:** La validación de negocio vive en el dominio, no en Zod ni en la BD. Zod valida forma (string, number), el dominio valida semántica (es un email válido, el monto es positivo).
- **Consecuencia:** Doble validación (Zod en action + VO en dominio) que garantiza integridad incluso si se usa el caso de uso desde otro contexto.

### ADR-05: Generación de PDF en el Servidor

- **Contexto:** Las constancias PDF deben generarse con un template consistente.
- **Decisión:** Generar PDFs del lado del servidor usando `@react-pdf/renderer` (o alternativa) dentro de un adapter.
- **Razón:** Control total sobre el template, no depende del navegador del usuario, se puede adjuntar al correo directamente.
- **Consecuencia:** El buffer del PDF se genera en memoria, se sube al storage y se adjunta al correo en un solo flujo.

---

## Apéndice A: Mapeo Dominio ↔ Base de Datos

| Entidad de Dominio | Tabla PostgreSQL       | Notas                                        |
|---------------------|------------------------|----------------------------------------------|
| `Usuario`           | `usuarios`             | Entidad principal                            |
| `Deposito`          | `depositos`            | Comprobante de pago                          |
| `Facturacion`       | `facturaciones`        | Datos fiscales                               |
| `GrupoRegistro`     | — (no tiene tabla)     | Concepto de aplicación, no de BD             |
| `Cargo` (catálogo)  | `cargos`               | Lectura solamente                            |
| `Estado` (catálogo) | `estados`              | Lectura solamente                            |
| `Institucion` (cat) | `instituciones`        | Lectura solamente                            |
| `TipoUsuario` (cat) | `tipo_usuario`         | Lectura solamente                            |

## Apéndice B: Variables de Entorno Esperadas

```env
# ── Base de Datos ──
DATABASE_URL=postgresql://user:pass@host:5432/aniei2026
DB_PROVIDER=postgres-direct          # postgres-direct | supabase-client

# ── Email ──
EMAIL_PROVIDER=resend                # resend | sendgrid | nodemailer
RESEND_API_KEY=re_...
# SENDGRID_API_KEY=SG...
# SMTP_HOST=... SMTP_PORT=... SMTP_USER=... SMTP_PASS=...

# ── Storage ──
STORAGE_PROVIDER=supabase            # supabase | s3 | local
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...
# AWS_ACCESS_KEY_ID=... AWS_SECRET_ACCESS_KEY=... S3_BUCKET=...
# LOCAL_STORAGE_PATH=./uploads

# ── PDF ──
PDF_PROVIDER=react-pdf               # react-pdf | puppeteer

# ── Feature Flags ──
ENABLE_GROUP_REGISTRATION=true       # true | false

# ── General ──
NEXT_PUBLIC_APP_URL=https://registro.aniei.org.mx
```
