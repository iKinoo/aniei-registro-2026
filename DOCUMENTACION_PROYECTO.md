# 📚 Sistema de Registro e Inscripción ANIEI

## Descripción General

El **Sistema ANIEI** es una aplicación web desarrollada en **PHP** con **MySQL** para gestionar el registro de participantes e inscripciones a actividades del **Congreso Nacional de la ANIEI** (Asociación Nacional de Instituciones de Educación en Informática).

Este sistema permite:
- Registro de participantes (individuales o en grupos)
- Inscripción a actividades del congreso (talleres, conferencias, ponencias)
- Gestión de pagos y depósitos
- Control de acceso mediante códigos de barras
- Generación de reportes y constancias en PDF
- Panel de administración para gestionar usuarios y actividades

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │   HTML/CSS  │  │  JavaScript │  │   jQuery    │              │
│  │  Templates  │  │ Validaciones│  │  UI/Plugins │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND (PHP)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Módulos Principales                    │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │  Registro  │ │Inscripción │ │  Reportes  │            │   │
│  │  │ Usuarios   │ │ Actividades│ │    PDF     │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │  Control   │ │  Gestión   │ │  Código    │            │   │
│  │  │  Acceso    │ │   Grupos   │ │  Barras    │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Funciones/Librerías                          │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │   │
│  │  │basedatos.php│ │funciones.php│ │   FPDF    │            │   │
│  │  │(Conexión DB)│ │(Utilidades) │ │(Gen. PDF) │            │   │
│  │  └────────────┘ └────────────┘ └────────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (MySQL)                         │
│                    aniei_org_mx_rnd2011                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura de Directorios

```
aniei/
├── index.php                    # Página principal de bienvenida
├── precios.php                  # Información de precios y registro
├── precios2.php                 # Continuación del proceso de registro
├── aniei.html                   # Página informativa estática
│
├── cpanel/                      # Panel de Administración
│   ├── index.php               # Login del panel
│   ├── panel_control.php       # Dashboard principal
│   ├── loggin.php              # Autenticación
│   ├── cerrar_sesion.php       # Cerrar sesión
│   │
│   │   # Gestión de Usuarios
│   ├── usuarios_gestion.php    # Listar/buscar usuarios
│   ├── usuarios_gestion2.php   # Agregar usuarios
│   ├── agregarUsuario.php      # Procesar nuevo usuario
│   ├── editarUsuario.php       # Editar usuario
│   ├── eliminarUsuario.php     # Eliminar usuario
│   ├── buscar_usuario.php      # Búsqueda AJAX
│   │
│   │   # Gestión de Actividades
│   ├── actividades_gestion.php # Listar actividades
│   ├── actividades_gestion2.php# Agregar/editar actividades
│   ├── editarActividades.php   # Editar actividad
│   ├── eliminarActividad.php   # Eliminar actividad
│   ├── listaactividades.php    # Lista de actividades
│   │
│   │   # Gestión de Inscripciones
│   ├── inscripcion.php         # Inscribir a actividad
│   ├── inscripciones_gestion.php# Gestionar inscripciones
│   ├── inscripciones.php       # Listado de inscripciones
│   │
│   │   # Gestión de Grupos
│   ├── InterfazEdicionGrupo.php # Editar grupo
│   ├── InterfazMostrarGrupo.php # Ver grupo
│   │
│   │   # Códigos de Barras y Asistencia
│   ├── asignarCodigoBarra.php   # Asignar código de barras
│   ├── autocompleteCodigoBarra.php # Autocompletado
│   ├── registrarasistencia.php  # Registrar asistencia
│   ├── InterfazRegistroAsistencia.php
│   │
│   │   # Reportes y PDFs
│   ├── reportes_gestion.php    # Generación de reportes
│   ├── pdf.php                 # Generador PDF
│   ├── pdf1.php, pdf2.php, pdf3.php # Diferentes formatos PDF
│   └── folio2pdf.php           # PDF por folio
│
├── funciones/                   # Librerías y utilidades
│   ├── basedatos.php           # Conexión a MySQL
│   ├── configuracion.php       # Configuración DB
│   ├── funciones.php           # Funciones auxiliares
│   ├── calendario.php          # Utilidades de fecha
│   ├── paginator.inc.php       # Paginación de resultados
│   └── fpdf/                   # Librería FPDF para PDFs
│
├── css/                        # Hojas de estilo
│   ├── body.css               # Estilos generales
│   ├── exclusivo.css          # Estilos específicos
│   ├── formulario.css         # Estilos de formularios
│   └── jquery.*.css           # Estilos jQuery UI
│
├── js/                         # JavaScript
│   ├── jquery.js              # jQuery principal
│   ├── funciones.js           # Funciones generales
│   ├── formulario.js          # Validación de formularios
│   ├── validaciones.js        # Validaciones adicionales
│   └── ui.*.js                # jQuery UI
│
├── jquery/                     # jQuery y plugins
│   ├── jquery-1.2.6.js        # jQuery core
│   ├── plugins/               # Plugins adicionales
│   └── ui/                    # jQuery UI
│
├── img/                        # Imágenes del sistema
├── mini_icons/                 # Íconos pequeños
├── Templates/                  # Plantillas Dreamweaver
└── otros/
    └── aniei2008_database.sql  # Script de base de datos
```

---

## 🗄️ Modelo de Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│    ACCESOS      │       │    USUARIOS     │       │   DEPOSITOS     │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ id_acceso (PK)  │       │ id_usuario (PK) │◄──────│ id_deposito (PK)│
│ username        │       │ folio_recibo    │       │ id_usuario (FK) │
│ contrasena      │       │ titulo          │       │ ciudad          │
│ tipo            │       │ nombre          │       │ sucursal        │
└─────────────────┘       │ apellido        │       │ fecha           │
                          │ id_cargo (FK)   │       │ hora            │
┌─────────────────┐       │ id_tipousuario  │       │ referencia      │
│    CARGOS       │       │ carrera         │       │ monto           │
├─────────────────┤       │ id_institucion  │       └─────────────────┘
│ id_cargo (PK)   │◄──────│ institucion     │
│ descripcion     │       │ dependencia     │       ┌─────────────────┐
└─────────────────┘       │ id_entidadfed   │──────►│    ESTADOS      │
                          │ correo          │       ├─────────────────┤
┌─────────────────┐       │ lada            │       │ id_entidadfed   │
│ TIPO_USUARIO    │       │ telefono        │       │ nombre          │
├─────────────────┤       │ extension       │       └─────────────────┘
│ id_tipousuario  │◄──────│ codigo_barras   │
│ descripcion     │       │ grupo_padre     │       ┌─────────────────┐
└─────────────────┘       │ asistio         │       │ FACTURACIONES   │
                          │ genero          │       ├─────────────────┤
                          │ fecha_registro  │       │ id_facturacion  │
                          │ id_costo (FK)   │       │ id_usuario (FK) │
                          └────────┬────────┘       │ razon           │
                                   │                │ rfc             │
              ┌────────────────────┼──────────────┐ │ calle, etc.     │
              │                    │              │ └─────────────────┘
              ▼                    ▼              │
┌─────────────────┐       ┌─────────────────┐     │  ┌─────────────────┐
│ INSCRIPCIONES   │       │  ACTIVIDADES    │     │  │    COSTOS       │
├─────────────────┤       ├─────────────────┤     │  ├─────────────────┤
│ id_inscripcion  │       │ id_actividad(PK)│     └─►│ id_costo (PK)   │
│ id_actividad(FK)│──────►│ nombre          │        │ id_tipousuario  │
│ id_usuario (FK) │       │ id_tipoactividad│        │ costo           │
└─────────────────┘       │ id_ponente (FK) │        └─────────────────┘
                          │ id_ponente2     │
                          │ id_ponente3     │       ┌─────────────────┐
                          │ cupo            │       │ TIPO_ACTIVIDAD  │
                          │ hora_inicio     │       ├─────────────────┤
                          │ hora_final      │◄──────│ id_tipo (PK)    │
                          │ institucion     │       │ descripcion     │
                          │ id_sala (FK)    │       └─────────────────┘
                          │ id_fechaevento  │
                          └────────┬────────┘       ┌─────────────────┐
                                   │                │     SALAS       │
                                   └───────────────►├─────────────────┤
                                                    │ id_sala (PK)    │
┌─────────────────┐       ┌─────────────────┐       │ nombre          │
│ INSTITUCIONES   │       │  FECHA_EVENTOS  │       │ ubicacion       │
├─────────────────┤       ├─────────────────┤       └─────────────────┘
│ id_institucion  │       │ id_fechaevento  │
│ nombre          │       │ fecha           │
└─────────────────┘       └─────────────────┘
```

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `accesos` | Credenciales de acceso al sistema |
| `usuarios` | Participantes registrados (incluye grupos) |
| `actividades` | Talleres, conferencias, ponencias del congreso |
| `inscripciones` | Relación usuarios-actividades |
| `depositos` | Información de pagos/depósitos bancarios |
| `facturaciones` | Datos fiscales para facturación |
| `estados` | Catálogo de entidades federativas |
| `instituciones` | Catálogo de instituciones educativas |
| `cargos` | Catálogo de cargos (Alumno, Profesor, etc.) |
| `costos` | Precios según tipo de participante |
| `tipoactividad` | Tipos: Taller, Conferencia, Ponencia, etc. |
| `salas` | Ubicaciones físicas del evento |

---

## 🔄 Flujos de Proceso

### Flujo de Registro de Participante

```
┌──────────────┐
│   INICIO     │
└──────┬───────┘
       ▼
┌──────────────────┐
│  Usuario visita  │
│    index.php     │
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Selecciona tipo: │
│ - Ver precios    │
│ - Registrarse    │
└──────┬───────────┘
       ▼
┌──────────────────┐
│   precios.php    │
│ Muestra costos   │
│ según categoría  │
└──────┬───────────┘
       ▼
┌──────────────────┐     ┌──────────────────┐
│ Completa datos:  │     │ ¿Registrar grupo?│
│ - Personales     │────►│   (Opcional)     │
│ - Institución    │     └──────────────────┘
│ - Depósito       │
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Selecciona       │
│ actividades      │
│ (talleres, etc.) │
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Validación de    │
│ horarios (no     │
│ traslapes)       │
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Genera folio:    │
│ A00001, A00002...│
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Envía correo de  │
│ confirmación     │
└──────┬───────────┘
       ▼
┌──────────────┐
│     FIN      │
└──────────────┘
```

### Flujo de Administración

```
┌──────────────┐
│   INICIO     │
└──────┬───────┘
       ▼
┌──────────────────┐
│  cpanel/index    │
│  Login Admin     │
└──────┬───────────┘
       ▼
┌──────────────────┐
│ Validar usuario  │──────► ¿Válido? ───NO──► Error
│ y contraseña     │                          │
└──────┬───────────┘                          │
       │ SÍ                                   │
       ▼                                      │
┌──────────────────┐                          │
│ panel_control    │◄─────────────────────────┘
│   Dashboard      │
└──────┬───────────┘
       │
       ├───────────────────────────────────────┐
       │                                       │
       ▼                                       ▼
┌──────────────────┐                 ┌──────────────────┐
│ GESTIÓN USUARIOS │                 │ GESTIÓN          │
│ - Registrar      │                 │ ACTIVIDADES      │
│ - Editar         │                 │ - Agregar        │
│ - Eliminar       │                 │ - Editar         │
│ - Buscar         │                 │ - Eliminar       │
└──────────────────┘                 └──────────────────┘
       │                                       │
       ├───────────────────────────────────────┤
       │                                       │
       ▼                                       ▼
┌──────────────────┐                 ┌──────────────────┐
│ INSCRIPCIONES    │                 │ REPORTES         │
│ - Inscribir      │                 │ - Listados       │
│ - Modificar      │                 │ - PDF            │
│ - Cancelar       │                 │ - Estadísticas   │
└──────────────────┘                 └──────────────────┘
       │
       ▼
┌──────────────────┐
│ CÓDIGO BARRAS    │
│ - Asignar        │
│ - Registrar      │
│   asistencia     │
└──────────────────┘
```

---

## 👤 Tipos de Usuario

```
┌─────────────────────────────────────────────────────────────┐
│                    TIPOS DE USUARIO                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐      ┌─────────────────┐               │
│  │  ADMINISTRADOR  │      │    ASISTENTE    │               │
│  │    (tipo = 1)   │      │    (tipo = 0)   │               │
│  ├─────────────────┤      ├─────────────────┤               │
│  │ - Gestión total │      │ - Lector código │               │
│  │ - CRUD usuarios │      │   de barras     │               │
│  │ - CRUD activid. │      │ - Registro de   │               │
│  │ - Reportes      │      │   asistencia    │               │
│  │ - Inscripciones │      │                 │               │
│  └─────────────────┘      └─────────────────┘               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                 TIPOS DE PARTICIPANTE                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │  ALUMNO   │  │ PROFESOR  │  │  PONENTE  │               │
│  │ $775-850  │  │ $1000-1100│  │ $1650-1850│               │
│  └───────────┘  └───────────┘  └───────────┘               │
│                                                              │
│  ┌───────────────────────────────────────────┐              │
│  │              GRUPO DE ALUMNOS             │              │
│  │  (1 titular + N integrantes)              │              │
│  │  Descuento especial por grupo             │              │
│  └───────────────────────────────────────────┘              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Tipos de Actividades

```
┌─────────────────────────────────────────────────────────────┐
│                  TIPOS DE ACTIVIDADES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  Sesiones prácticas con cupo limitado      │
│  │   TALLER    │  Horario específico, validación de         │
│  │  (tipo 1)   │  disponibilidad y no traslape              │
│  └─────────────┘                                            │
│                                                              │
│  ┌─────────────┐  Seminarios de medio día                   │
│  │  SEMINARIO  │  Cupo limitado por sala                    │
│  │  (tipo 2)   │                                            │
│  └─────────────┘                                            │
│                                                              │
│  ┌─────────────┐  Presentaciones magistrales                │
│  │ CONFERENCIA │  Gran capacidad, ponentes invitados        │
│  │  (tipo 3)   │                                            │
│  └─────────────┘                                            │
│                                                              │
│  ┌─────────────┐  Presentación de papers/investigación      │
│  │  PONENCIA   │  Incluye publicación en memorias           │
│  │  (tipo 4)   │                                            │
│  └─────────────┘                                            │
│                                                              │
│  ┌─────────────┐  Demos de productos/servicios              │
│  │   DEMO      │  Por empresas patrocinadoras               │
│  │  (tipo 11)  │                                            │
│  └─────────────┘                                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Backend** | PHP | ~5.x |
| **Base de Datos** | MySQL | ~5.0 |
| **Frontend** | HTML 4.01 | - |
| **Estilos** | CSS 2 | - |
| **JavaScript** | jQuery | 1.2.6 |
| **UI Components** | jQuery UI | - |
| **PDF Generator** | FPDF | - |
| **IDE** | Dreamweaver | (Templates .dwt) |

---

## ⚠️ Notas de Seguridad

> **IMPORTANTE:** Este sistema fue desarrollado aproximadamente en 2007-2008 y contiene prácticas de seguridad obsoletas:

1. **SQL Injection**: Las consultas SQL no utilizan prepared statements
2. **Funciones obsoletas**: Usa `mysql_*` (deprecadas desde PHP 5.5)
3. **Contraseñas**: Usa MD5 simple (inseguro)
4. **XSS**: No hay sanitización completa de entradas

### Recomendaciones de Modernización

```
┌─────────────────────────────────────────────────────────────┐
│              MIGRACIÓN RECOMENDADA                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  mysql_* ──────────────────────► PDO / mysqli               │
│  MD5     ──────────────────────► password_hash()            │
│  PHP 5   ──────────────────────► PHP 8.x                    │
│  jQuery 1.2 ───────────────────► jQuery 3.x o Vanilla JS    │
│  HTML 4  ──────────────────────► HTML5                      │
│  Sin CSRF ─────────────────────► Tokens CSRF                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Configuración

### Archivo de Configuración de Base de Datos
`funciones/configuracion.php`

```php
define('DB_NAME', 'aniei_org_mx_rnd2011');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_HOST', 'localhost');
```

---

## 🚀 Instalación

1. Configurar servidor web (Apache) con PHP
2. Crear base de datos MySQL
3. Importar `otros/aniei2008_database.sql`
4. Configurar `funciones/configuracion.php`
5. Acceder a `http://localhost/aniei/`

---

## 📊 Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| Archivos PHP | ~50 |
| Tablas en BD | ~15 |
| Líneas de código | ~10,000+ |
| Año de desarrollo | 2007-2008 |

---

*Documentación generada el 31 de enero de 2026*
