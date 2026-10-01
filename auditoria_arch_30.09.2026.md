# Auditoría de arquitectura limpia/hexagonal — 30.09.2026

## Dictamen del estado inicial

**Cumplimiento parcial.** El dominio mantiene su independencia y existe una estructura útil de puertos/adaptadores. Sin embargo, la aplicación depende de implementaciones concretas en los registros individual y grupal, y la presentación contiene persistencia y orquestación de negocio. La separación de carpetas no equivale todavía a la inversión de dependencias descrita en `AGENTS.md` y `docs/DESIGN.md`.

La prioridad es eliminar las dependencias de infraestructura en aplicación y hacer efectiva la inyección de servicios y transacciones. Después se deben extraer los flujos implementados en controllers. No se recomienda introducir interfaces para todas las clases: entidades, value objects y casos de uso pueden instanciarse directamente; los recursos externos requieren puertos.

## Alcance y método

Revisión estática de `src/core`, `src/application` (DTOs, puertos y casos de uso), `src/infrastructure` (repositorios, servicios, mappers y composición), `src/app`, integración de autenticación y utilidades compartidas. Se contrastaron imports estáticos/dinámicos, constructores, retornos del contenedor, transacciones y llamadas de presentación con las reglas del repositorio. También se revisaron `AGENTS.md`, `docs/DESIGN.md`, `package.json` y `eslint.config.mjs`.

Las referencias indican archivos y líneas del estado auditado; pueden desplazarse tras una refactorización. No se modificó código funcional, no se aplicaron migraciones y no se ejercitaron registros, pagos ni envíos de correo. Los riesgos de ejecución señalados son inferencias del código, no fallos reproducidos contra la BD.

Prioridades: **P1** para límites rotos en flujos principales o contratos transaccionales; **P2** para portabilidad, organización de contratos y prevención de reincidencias. No se asigna un porcentaje artificial de cumplimiento.

## Hallazgos

### ARQ-01 · P1 · Aplicación construye adaptadores concretos

**Evidencia:** `src/application/use-cases/RegistrarUsuario.ts:23` importa `BcryptPasswordHasher`; su constructor, línea 38, lo crea como valor por defecto de `IPasswordHasher`. `RegistrarGrupoRapido.ts:14` y su constructor, línea 24, repiten el patrón. Ambos asignan a `IIdGenerator` una implementación inline con `crypto.randomUUID()`.

**Impacto:** el tipo interfaz no elimina el acoplamiento si la implementación se importa y construye dentro del consumidor. Cargar estos casos de uso arrastra bcrypt; sus dependencias no se resuelven completamente desde la composición. Sustituir hashing o generación de IDs requiere tocar aplicación.

**Corrección:** exigir `IPasswordHasher` e `IIdGenerator` por constructor, implementar la generación en infraestructura y añadir getters con retorno de puerto en `container.ts`. Inyectarlos en todos los puntos de entrada. No usar adaptadores por defecto como compatibilidad.

### ARQ-02 · P1 · Fallback transaccional importa Prisma desde aplicación y se usa actualmente

**Evidencia:** `RegistrarUsuario.ts:154` y `RegistrarGrupoRapido.ts:101` importan dinámicamente el cliente Prisma, repositorios concretos y `PrismaFolioGenerator` cuando falta `txManager`. Los callbacks/contextos usan `any`. `RegistrarUsuario.ts:25,177` también importa y ejecuta `mapPrismaError`.

Las construcciones en `src/app/registro/actions/registrar-usuario.action.ts:199,267` y `src/app/perfil/grupo/registro/actions.ts:145` omiten hashing, generación de IDs y transaction manager. Por tanto, el fallback no es únicamente código inactivo: esos puntos de entrada seleccionan esa rama. `container.ts` ya ofrece `getTransactionManager()`, pero no se usa en esas construcciones.

**Impacto:** aplicación conoce ORM, ensamblaje de repositorios y errores de proveedor; hay dos implementaciones de composición transaccional. `any` oculta incompatibilidades del contexto.

**Corrección:** hacer obligatorio `ITransactionManager`, eliminar las importaciones y la ruta alternativa, tipar callbacks con `TransactionContext` y traducir los errores en adaptadores. La presentación también importa `mapPrismaError` en `registrar-usuario.action.ts:9,313`; debe recibir errores de aplicación/dominio.

### ARQ-03 · P1 · Repositorio transaccional intenta abrir otra transacción

**Evidencia:** `src/infrastructure/repositories/PrismaUsuarioRepository.ts:77` ejecuta `this.prisma.$transaction` en `crearGrupoTransaccional`. Tanto el fallback de `RegistrarGrupoRapido` como `src/infrastructure/database/PrismaTransactionManager.ts:14` construyen este repositorio con el cliente `tx` de una transacción interactiva. El manager convierte ese cliente con `as any` y suprime un error con `@ts-expect-error`.

**Impacto:** un cliente transaccional no expone la misma API que un `PrismaClient`, incluida `$transaction`. La llamada anidada puede fallar al ejecutar el registro grupal; es un riesgo identificado estáticamente. No basta con empezar a pasar el manager existente: hay que corregir también el repositorio.

**Corrección:** distinguir explícitamente cliente raíz y cliente transaccional en infraestructura. Bajo el manager, `crearGrupoTransaccional` debe reutilizar la transacción recibida. Mantener una sola responsabilidad para delimitar atomicidad y retirar casts/supresiones que ocultan el contrato incorrecto.

### ARQ-04 · P1 · Persistencia directa en presentación

Se detectaron **17 archivos de `src/app`** que importan el singleton Prisma. La deuda excede las «algunas páginas» descritas previamente en `AGENTS.md`: incluye actions y un Route Handler.

| Archivo | Línea de importación |
|---------|----------------------|
| `src/app/actividades/actions.ts` | 4 |
| `src/app/actividades/checkout/actions.ts` | 5 |
| `src/app/actividades/checkout/page.tsx` | 3 |
| `src/app/api/archivos/[...path]/route.ts` | 5 |
| `src/app/cpanel/actions.ts` | 8 |
| `src/app/cpanel/actividades/ponentes.actions.ts` | 4 |
| `src/app/cpanel/reportes/actions.ts` | 4 |
| `src/app/cpanel/usuarios/[folio]/editar/actions.ts` | 4 |
| `src/app/cpanel/usuarios/[folio]/editar/page.tsx` | 3 |
| `src/app/cpanel/usuarios/[folio]/page.tsx` | 3 |
| `src/app/grupo-completar/[token]/page.tsx` | 2 |
| `src/app/grupo-completar/[token]/usuario/[idUsuario]/actions.ts` | 4 |
| `src/app/grupo-completar/[token]/usuario/[idUsuario]/page.tsx` | 1 |
| `src/app/perfil/actions.ts` | 4 |
| `src/app/perfil/grupo/registro/actions.ts` | 4 |
| `src/app/perfil/grupo/registro/page.tsx` | 3 |
| `src/app/perfil/page.tsx` | 3 |

**Ejemplos confirmados:** `cpanel/actions.ts:69,78` consulta y borra dentro de una transacción; `cpanel/usuarios/[folio]/editar/actions.ts:28` actualiza usuarios; `cpanel/reportes/actions.ts:20` agrupa usuarios; `actividades/checkout/actions.ts:26` consulta y mapea resultados Prisma a DTOs.

**Impacto:** los controllers conocen tablas, relaciones, campos snake_case y conversiones del ORM. Cambiar persistencia afecta presentación, y los casos de uso no representan todos los flujos.

**Corrección:** trasladar consultas a repositorios/servicios de consulta detrás de puertos y escrituras a casos de uso. DTOs y mappers deben aislar la forma de persistencia. Los guards y la adaptación HTTP/UI permanecen en presentación.

### ARQ-05 · P1 · Obtener interfaces del contenedor no sustituye al caso de uso

**Evidencia:** `src/app/actividades/checkout/actions.ts:78` (`confirmarInscripcionesAction`) coordina almacenamiento, creación de `Deposito`/`Facturacion`, inscripción, manejo de cupo, cálculo de totales y correo. `src/app/cpanel/actividades/ponentes.actions.ts:111` (`registrarPonenteAction`) crea usuario, acceso y vínculo con actividad, genera contraseña y llama a `bcrypt.hash`. `src/app/grupo-completar/[token]/usuario/[idUsuario]/actions.ts:29` implementa actualización transaccional, hashing y correo.

`src/app/api/constancia/[folio]/route.ts` y `src/app/constancia/[folio]/page.tsx` también consultan usuario/catálogos y construyen datos de constancia directamente; ya existe `GenerarConstancia` que puede servir de referencia, sin asumir que cubre idénticos requisitos.

**Impacto:** hay dependencias abstraídas, pero las decisiones de aplicación siguen en controllers. En checkout se persiste el depósito antes de validar facturación y antes del resultado de cupos, sin una unidad transaccional global ni compensación visible del archivo en ese flujo. Esto permite estados parciales según la ruta de error; no se reprodujo en runtime.

**Corrección:** extraer casos de uso específicos de checkout, registro de ponentes y completar registro. Validar la entrada antes de efectos, definir qué resultados parciales permite el negocio y coordinar atomicidad/compensaciones a través de puertos.

### ARQ-06 · P1 · Transporte de archivos acoplado a filesystem y autorización duplicada

**Evidencia:** `src/app/api/archivos/[...path]/route.ts:2,3,5,6` importa `readFile`, `path`, Prisma y `verificarFirma` de `LocalFilesystemStorageService`. La ruta resuelve `STORAGE_LOCAL_DIR`, verifica firma, consulta propiedad y lee el disco sin `IStorageService`. `src/app/perfil/actions.ts` implementa otra comprobación de propiedad. `ObtenerAccesoArchivo` existe, pero actualmente solo permite administradores.

**Impacto:** el cambio de proveedor de storage no se encapsula completamente; las políticas de acceso están repartidas entre controllers y un caso de uso con alcance diferente.

**Corrección:** definir un flujo de acceso/descarga autorizado con puertos para propiedad y validación de enlaces. Mantener normalización de rutas y lectura física en el adaptador filesystem. El handler conserva lectura de parámetros y respuesta HTTP. No reutilizar el caso de uso administrativo sin ampliar y verificar expresamente su política.

### ARQ-07 · P2 · Aplicación depende de Node.js indirectamente y en contratos binarios

**Evidencia:** ambos registros importan `src/shared/security/password.ts`, que depende de `crypto.randomInt`. `src/application/dtos/RegistroUsuarioDTO.ts:7`, `IStorageService.ts:15,18`, `IEmailService.ts:37,40,41` e `IPdfService.ts:54-60` usan `Buffer`.

**Impacto:** la regla de TS puro se rompe mediante una dependencia transitiva; los contratos binarios requieren tipos/runtime de Node. Esto es distinto de una dependencia de framework, pero limita portabilidad y aislamiento.

**Corrección:** añadir un puerto para generación segura de contraseñas cuyo adaptador reutilice la utilidad existente. Usar `Uint8Array` en contratos internos y convertir a `Buffer` en adaptadores cuando lo exijan las bibliotecas.

### ARQ-08 · P2 · Contratos internos ubicados en shared

**Evidencia:** `ICatalogoRepository`, `IActividadRepository`, `IPrecioInscripcionRepository`, `ITipoParticipanteRepository` y los casos de uso `GestionarActividades`, `GestionarPrecios`, `GestionarTiposParticipante` importan `src/shared/types/catalogos.ts`.

**Impacto:** ese archivo es actualmente TS puro, por lo que no supone contaminación de framework hoy. Sin embargo, la propiedad de contratos de aplicación queda fuera del límite declarado y facilita introducir dependencias transitivas futuras.

**Corrección:** mover estos contratos a DTOs de aplicación o tipos de dominio según su significado. Presentación e infraestructura deben consumir la definición interna. No confundir este hallazgo con el acoplamiento concreto de ARQ-01/02.

### ARQ-09 · P2 · Autenticación integra persistencia y hashing directamente

**Evidencia:** `src/auth.ts:3,4,24,32` importa bcrypt y Prisma para implementar `authorize`. `AuthJsAuthService` implementa `IAuthService` y usa las funciones exportadas de `auth.ts`.

**Evaluación:** depender de NextAuth en este archivo es válido como integración externa. La consulta y comparación de credenciales podrían delegarse a un servicio/caso de uso con puertos para hacer coherente la abstracción de hashing; no es una violación de pureza de `core`/`application` por sí misma. Evitar que una futura composición introduzca un ciclo `auth → container → AuthJsAuthService → auth`.

**Corrección:** separar verificación de credenciales de la configuración NextAuth y definir cuidadosamente la composición sin ciclos.

### ARQ-10 · P2 · Las reglas arquitectónicas no tienen control automático

**Evidencia:** `eslint.config.mjs` solo incorpora presets de Next.js/TypeScript y exclusiones; no define restricciones de imports por capa. `package.json` no incluye un comando de comprobación arquitectónica. Los controles existentes aceptan imports entre capas aunque algunos `any` fallen en lint.

**Impacto:** typecheck/build pueden pasar con inversión de dependencias rota. Un `AGENTS.md` claro mejora las instrucciones, pero no garantiza que todos los agentes o cambios las cumplan.

**Corrección:** añadir posteriormente reglas ESLint por carpeta y una comprobación del grafo que cubra aliases, rutas relativas, imports de tipos y dinámicos. Gestionar deuda con excepciones concretas y temporales; impedir nuevas infracciones sin silenciar categorías enteras. Esta auditoría no cambia configuración ni incorpora ese control automático.

## Aspectos conformes y límites legítimos

- No se encontraron imports externos ni dependencias hacia aplicación/infraestructura/presentación en `core`; sus entidades/value objects aplican reglas intrínsecas con TS puro.
- Los casos de uso de gestión, consulta administrativa y constancias revisados reciben repositorios/servicios mediante puertos. La mayoría de dependencias de aplicación siguen la dirección correcta, con las excepciones descritas.
- Los repositorios Prisma, servicios de correo/PDF/storage/auth, generador de folios y manager transaccional declaran implementar sus interfaces. Esto es una base adecuada, aunque no corrige los consumidores que evitan esos puertos.
- Los getters de `container.ts` declaran interfaces como retorno. Construir `Prisma*`, `NodemailerEmailService` o `ReactPdfService` allí es correcto. También es válido construir repositorios ligados a `tx` dentro del adaptador de transacciones si sus contratos son compatibles.
- Instanciar `new GestionarPrecios(...)`, entidades de dominio o value objects en el flujo adecuado no requiere clases abstractas adicionales. Las interfaces TS existentes son suficientes para inversión de dependencias.

## Orden recomendado de corrección y aceptación

1. **ARQ-01/02/03:** resolver primero el contrato transaccional del repositorio grupal; completar getters de hashing/IDs/contraseñas, exigir puertos y conectar todos los registros al manager. Aceptación: aplicación no importa infraestructura, no construye adaptadores ni contiene fallback Prisma; el registro real individual/grupal y rollback funcionan.
2. **ARQ-04/05:** extraer escrituras y coordinación de checkout, completar registro, ponentes y administración; después consultas de páginas/reportes. Aceptación: `src/app` no importa el cliente ni tipos Prisma y los controllers invocan casos de uso con DTOs.
3. **ARQ-06/09:** unificar acceso a archivos y delegar credenciales respetando las políticas actuales y sin ciclos de composición. Verificar propietario, administrador, firma vencida, ruta inválida y proveedor de almacenamiento.
4. **ARQ-07/08/10:** trasladar contratos puros, neutralizar binarios y añadir verificación de límites. Aceptación: toda dependencia transitiva de core/aplicación respeta la dirección y los controles detectan infracciones nuevas.

Cada corrección funcional requiere typecheck, lint, build y prueba del flujo en desarrollo. No ampliar esta auditoría documental a una refactorización funcional sin encargo.

## Revisión de AGENTS.md

Se reforzó el documento raíz existente `AGENTS.md` (la capitalización importa en Linux). Ahora distingue dependencias permitidas por capa, imports dinámicos/de tipos, inyección obligatoria sin adaptadores por defecto, papel del contenedor, controllers sin persistencia ni negocio, tipos/binarios internos y transacciones sin fallback ni `any`.

La antigua referencia a «algunas páginas» con Prisma se sustituyó por una descripción de deuda que incluye actions, rutas y casos de uso; se explicita que no autoriza replicarla. También se exige revisión arquitectónica antes de cerrar cambios y comunicar fallos reales de verificación. Estas instrucciones no reparan por sí solas los hallazgos ni constituyen un mecanismo automático de enforcement.

## Verificación del estado inicial auditado

- `npx tsc --noEmit`: correcto (exit 0).
- `npm run lint`: falla con **57 errores y 30 advertencias** preexistentes en código no modificado; incluye `no-explicit-any`, reglas React y variables sin uso.
- `npm run build`: falla por error interno de Turbopack al procesar `src/app/logout/page.module.css`: creación de proceso/apertura de puerto bloqueada (`Operation not permitted`). El reintento solicitado con permisos escalados devolvió el mismo error; no se obtuvo un build en verde.
- Flujo real en `npm run dev`: no probado; el cambio es exclusivamente documental y no incorpora un flujo funcional nuevo. Los riesgos transaccionales requieren una prueba posterior contra BD.

Los comandos verifican el estado del repositorio, no certifican cumplimiento de arquitectura. El único alcance de cambios de esta tarea es este reporte y `AGENTS.md`.


## Seguimiento — adecuaciones aplicadas el 30.09.2026

El dictamen y las referencias anteriores documentan el estado inicial. Tras autorizar las adecuaciones se refactorizó el código funcional; las líneas históricas ya no describen necesariamente el estado actual.

| Hallazgo | Adecuación |
|----------|------------|
| ARQ-01 | Hashing, IDs y contraseñas se inyectan por puertos obligatorios; adaptadores `BcryptPasswordHasher`, `CryptoIdGenerator` y `SecurePasswordGenerator` en infraestructura. |
| ARQ-02 | Eliminados imports dinámicos, fallback Prisma y traducción de errores de proveedor desde casos de uso/controllers. Los registros reciben `ITransactionManager` obligatoriamente. |
| ARQ-03 | Repositorios transaccionales reciben `Prisma.TransactionClient` sin `any` ni supresiones. `crearGrupo` reutiliza la transacción; inscripción bloquea filas en orden y reutiliza el mismo cliente. |
| ARQ-04 | Eliminado Prisma de los 17 archivos de presentación. Las consultas de perfil, grupos, usuario y reportes retornan DTOs propios mediante `IRegistroQueryService`; las escrituras pasan por casos de uso/repositorios. |
| ARQ-05 | Extraídos checkout, edición/eliminación de usuarios, completar registro, gestión/registro de ponentes, consultas de constancias y generación de reportes/listas. Registro individual con miembros se coordina en `RegistrarInscripcion`. |
| ARQ-06 | Autorización de propietario/administrador centralizada en `AutorizarArchivo`. `DescargarArchivo` usa almacenamiento y validación de enlaces por puertos; el handler solo adapta parámetros, binarios y errores a HTTP. |
| ARQ-07 | Contratos binarios internos usan `Uint8Array`; conversiones Node permanecen en adaptadores o serialización de transporte. Generación segura detrás de `IPasswordGenerator`. |
| ARQ-08 | Catálogos trasladados a `application/dtos/CatalogosDTO.ts`; `shared/types/catalogos.ts` solo conserva un reexport de compatibilidad. |
| ARQ-09 | `ValidarCredenciales` consulta `IAccesoRepository` y verifica con `IPasswordHasher`. `config/credenciales.ts` compone estos adaptadores y se reexporta desde el contenedor; NextAuth lo importa directamente para evitar el ciclo con `AuthJsAuthService`. |
| ARQ-10 | Control AST de arquitectura integrado en lint y prebuild, con regresiones de imports relativos/aliases, imports de tipos/dinámicos y frontera cliente/Server Action. |

### Cambios de comportamiento relevantes

- Checkout confirma todas las actividades seleccionadas dentro de una misma transacción. Si una no tiene cupo, revierte inscripciones, depósito y facturación, y compensa el comprobante. El costo se obtiene del servidor; omitir el indicador de costo del cliente no permite saltarse el comprobante. Se rechazan inscripciones duplicadas, también después del bloqueo de fila.
- El repositorio de inscripciones ya no silencia errores de BD. Los bloqueos de actividades se adquieren en orden ascendente para reducir conflictos entre selecciones concurrentes; el manager usa `ReadCommitted`.
- Eliminar un usuario limpia comprobantes después de confirmar la transacción. Un rollback conserva los archivos; un fallo posterior de limpieza se registra sin deshacer la eliminación confirmada.
- Fallos de correo/PDF posteriores al registro no convierten un registro confirmado en una respuesta de fallo. Los archivos subidos antes de una transacción fallida se compensan; también se compensa el primer archivo si falla la segunda subida del registro individual.
- Completar registro bloquea al miembro dentro de la transacción y rechaza integrantes ya completados antes de actualizar usuario/acceso. El correo temporal se comprueba por sufijo de dominio.
- Las Server Actions administrativas revisadas exigen `requireAdmin()` antes del flujo; las de usuario autenticado exigen `requireUser()`. Se añadieron tipos de sesión NextAuth y validación de entradas de edición/registro de ponentes.
- Ajustes de formularios y consultas asíncronas eliminan errores de lint: monto calculado como valor derivado, restauración de errores solo al cambiar la respuesta y descarte de consultas de UI ya obsoletas. También se corrigieron casts `any` y enlaces/textos JSX detectados en la verificación.

### Verificación posterior

- `npm run check:architecture`: correcto; capas internas sin imports externos y presentación sin adaptadores directos. El control no sustituye revisión de responsabilidades o pruebas contra la BD.
- `npm run test:flows`: 17 pruebas de regresión con Node.js y adaptadores/puertos de prueba. Incluyen rollback/compensación, fallo de segunda subida, PDF después de commit, correspondencia contraseña/miembro, reutilización del cliente transaccional, cupos, checkout, autorización, filesystem real temporal, credenciales, traducción de errores y detección de infracciones de arquitectura.
- `npx tsc --noEmit`: correcto después de los ajustes finales.
- `npm run lint`: correcto (exit 0), sin errores y con 18 advertencias de limpieza.
- `npm run build -- --webpack`: correcto. `npm run build` con Turbopack fue ejecutado y falló por apertura de puerto bloqueada; no se cambió el bundler predeterminado del proyecto.
- Desarrollo con `npm run dev -- --webpack --hostname 127.0.0.1 --port 3100`: `/login` y `/registro` respondieron 200; `/cpanel` y `/perfil` redirigieron a `/login` (307); un enlace de archivo vencido fue rechazado (410). La carga de registro ejercitó las consultas reales de catálogos.

No se realizaron altas/bajas de participantes reales ni envíos SMTP en la verificación. Las pruebas transaccionales automatizadas usan puertos/clientes de prueba; no equivalen a una prueba de concurrencia y rollback contra MySQL. No se modificó el esquema ni se aplicaron migraciones. El flujo público de responsable con miembros conserva su comportamiento previo de dos registros independientes: si falla el grupo, el responsable ya confirmado permanece registrado; `RegistrarInscripcion` ahora concentra esa política.
