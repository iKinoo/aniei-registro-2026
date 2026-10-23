# Plan de implementación — Botón para descargar la base de datos

**Fecha:** 22.10.2026  
**Estado:** pendiente de implementación.  
**Objetivo:** permitir que un administrador descargue un respaldo completo de la base de datos MySQL de la aplicación desde `/cpanel/configuracion`.  
**Alcance:** exclusivamente la base de datos. El almacenamiento de comprobantes, constancias y cualquier otro contenido de `storage/` queda fuera del alcance.

## 1. Resultado esperado

Agregar una sección **Base de datos** en Configuración, con el botón **Descargar base de datos** y el texto: «Descarga la estructura y los datos de la base de datos en un archivo SQL comprimido».

Al pulsar el botón:

1. La interfaz muestra **Generando respaldo…** y deshabilita nuevas solicitudes desde ese botón.
2. El servidor verifica que la sesión corresponde a un administrador y genera el respaldo.
3. Si la generación termina correctamente, el navegador inicia la descarga de `aniei-bd-AAAA-MM-DD_HH-mm-ss-UTC.sql.gz`.
4. Ante un fallo, se muestra un mensaje en español y se permite reintentar.

El archivo debe contener la definición y los datos de todas las tablas de la base configurada, incluidas `_prisma_migrations` y `folios_contador`, además de índices, restricciones, valores `AUTO_INCREMENT`, vistas, triggers, rutinas y eventos que existan. Debe preservar las collations, los caracteres y la precisión de los valores actuales.

Las rutas de comprobantes y constancias existentes en las tablas se exportan como datos. No se descargan los archivos a los que apuntan.

### Fuera del alcance

- Exportar archivos, integrar proveedores de almacenamiento o utilizar `IStorageService`.
- Restaurar o importar respaldos desde la interfaz.
- Mantener un historial de respaldos, programar tareas automáticas o enviar respaldos por correo.
- Exportar otras bases del servidor, cuentas MySQL, permisos, configuración del servidor o binlogs.
- Modificar el modelo Prisma, crear migraciones o refactorizar módulos ajenos al botón.

## 2. Decisiones técnicas

| Aspecto | Decisión |
|---------|----------|
| Ubicación | Sección Base de datos dentro de `/cpanel/configuracion`; reutilizar navegación y estilos existentes. |
| Formato | Respaldo lógico SQL comprimido con gzip, extensión `.sql.gz`. |
| Generación | Adaptador de infraestructura que ejecuta el cliente oficial `mysqldump`, sin reconstruir SQL a partir de consultas Prisma. |
| Descarga | Route Handler `POST /api/admin/base-datos/exportar` con runtime Node.js y guard administrativo propio. |
| Transporte | Respuesta binaria HTTP; el Client Component consume el endpoint. No transportar el respaldo mediante una Server Action. |
| Base de origen | La indicada por `DATABASE_URL`, que utiliza la aplicación en ejecución. No cambiar a `DIRECT_URL` silenciosamente. |
| Consistencia | Usar `--single-transaction` y verificar que las tablas son InnoDB; no ejecutar migraciones o cambios DDL durante la generación. |
| Temporales | Generar y validar el archivo en un directorio privado del sistema antes de iniciar la respuesta de descarga. No usar `public/` ni `storage/`. |
| Recursos | Comprimir y leer por bloques en el servidor; limitar duración, tamaño temporal y concurrencia. |

El respaldo incluirá la base de aplicación mediante `--databases` con un único nombre resuelto por el servidor. La restauración de aceptación se hará en una instancia aislada con ese nombre, para respetar las sentencias `CREATE DATABASE` y `USE` incluidas.

La instantánea de lectura pertenece al adaptador de exportación. No se implementan escrituras multi-tabla ni una segunda transacción Prisma; el controlador y el caso de uso no coordinan transacciones de persistencia.

## 3. Arquitectura y archivos previstos

Flujo de descarga:

```text
Botón en Configuración
  → POST /api/admin/base-datos/exportar
  → requireAdmin() y validaciones HTTP
  → ExportarBaseDatos
  → IExportacionBaseDatosService
  ← MysqlDumpExportacionBaseDatosService
  → respuesta HTTP con el archivo .sql.gz
```

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/application/ports/IExportacionBaseDatosService.ts` | Contrato de generación, lectura por bloques, cancelación y liberación de recursos. |
| `src/application/dtos/ExportacionBaseDatosDTO.ts` | Nombre, tipo de contenido, tamaño y contrato del contenido generado. |
| `src/application/use-cases/ExportarBaseDatos.ts` | Invocar el puerto recibido por constructor mediante un método en español, como `ejecutar()`. |
| `src/core/errors/ExportacionBaseDatosError.ts` | Errores tipados de exportación sin detalles del proveedor ni dependencias externas. |
| `src/infrastructure/services/database/MysqlDumpExportacionBaseDatosService.ts` | Ejecutar `mysqldump`, comprimir, gestionar temporales, límites, cancelación y limpieza. |
| `src/infrastructure/config/container.ts` | Componer el adaptador y exponer `getExportacionBaseDatosService(): IExportacionBaseDatosService`. |
| `src/app/api/admin/base-datos/exportar/route.ts` | Autorizar, validar origen, invocar el caso de uso y adaptar contenido y errores a HTTP. |
| `src/app/cpanel/configuracion/DescargarBaseDatosClient.tsx` | Botón, estados de espera, descarga y errores visibles. |
| `src/app/cpanel/configuracion/page.tsx` | Incorporar la sección a la página existente. |
| `.env.example` y `PLAN_DESPLIEGUE.md` | Documentar las opciones de ejecución y los requisitos operativos del botón. |
| `scripts/verificar-flujos.mjs` | Añadir regresiones relevantes del nuevo flujo siguiendo el mecanismo existente. |

Los nombres nuevos son los propuestos para implementar este plan; no representan archivos ya existentes.

### Límites que deben conservarse

- Dominio y aplicación solo usan tipos propios y ECMAScript. Para el contenido, utilizar `AsyncIterable<Uint8Array>`; no introducir `Buffer`, streams de Node.js, `ReadableStream`, `AbortSignal`, Prisma o tipos de Next.js en esas capas.
- Definir la cancelación mediante un contrato propio de callbacks. La presentación lo vincula con la señal HTTP y la infraestructura termina el proceso y libera sus recursos.
- Mantener `child_process`, filesystem, gzip, credenciales y configuración de MySQL dentro de infraestructura. La conversión del iterable a un stream HTTP pertenece a presentación, sin importar módulos Node.js desde `app/`.
- Resolver el servicio por el contenedor e inyectarlo en el caso de uso, sin adaptadores por defecto.
- El Client Component solo depende del transporte HTTP y de componentes de interfaz; no importa el contenedor ni secretos.
- El control de arquitectura actual no garantiza guards en todos los Route Handlers. Revisar y probar explícitamente el guard del endpoint nuevo.

## 4. Generación y ciclo de vida del respaldo

1. Adquirir el límite de concurrencia antes de crear temporales o ejecutar procesos. Para el despliegue actual, permitir una exportación activa por proceso Node.js y documentar ese límite; varias instancias requerirían coordinación compartida antes de habilitar el botón en ellas.
2. Obtener y validar la conexión desde configuración del servidor. El cliente no puede enviar nombres de base, tablas, rutas, opciones SQL ni argumentos del ejecutable.
3. Crear un directorio temporal exclusivo con permisos `0700` y archivos `0600`. Usar nombres seguros generados en infraestructura.
4. Entregar las credenciales a `mysqldump` mediante un archivo privado de opciones, con `--defaults-file` como primer argumento. Escapar correctamente sus valores y verificar que configuraciones locales del cliente no sustituyan la conexión prevista. No pasar contraseñas en argumentos ni registrar la URL de conexión.
5. Ejecutar el binario con `spawn` y un arreglo de argumentos, sin shell, tuberías construidas como texto ni interpolación de comandos.
6. Partir de estas opciones y verificar su compatibilidad con las versiones instaladas:

   ```text
   --single-transaction
   --quick
   --default-character-set=utf8mb4
   --hex-blob
   --tz-utc
   --routines
   --events
   --triggers
   --no-tablespaces
   --set-gtid-purged=OFF
   --databases <base-configurada>
   ```

7. Canalizar la salida por gzip hacia el archivo temporal con control de presión. No acumular todo el SQL o el gzip en memoria y no utilizar `--force` para omitir errores.
8. Esperar tanto la finalización correcta del proceso como la de la compresión y escritura. Una salida parcial nunca se devuelve como un respaldo exitoso.
9. Entregar metadatos y un iterable de bloques. Eliminar el archivo de credenciales en cuanto deje de ser necesario.
10. Liberar el archivo y el límite de concurrencia al concluir la lectura, al cancelar, al superar límites o ante cualquier error. La liberación debe ser idempotente y contemplar el fallo al construir la respuesta HTTP.

Proponer inicialmente un timeout de generación de 120 segundos y un máximo de 1 GiB para el archivo comprimido. Estos valores son límites de protección, no una garantía de capacidad: medir con una base representativa y ajustar antes de producción. Añadir un plazo independiente para una descarga estancada y limpieza por antigüedad de temporales propios abandonados tras una caída del proceso.

La solución necesita espacio temporal suficiente en disco, pero no incorpora un repositorio permanente de respaldos ni integra el módulo de almacenamiento existente.

## 5. Autorización, respuesta HTTP e interfaz

### Endpoint

- Ejecutar `await requireAdmin()` antes de obtener el servicio o iniciar la exportación. Sin sesión: `401`; con rol distinto de ADMIN: `403`, también al acceder directamente al endpoint.
- Aceptar exclusivamente `POST` y comprobar el origen de la solicitud contra el origen público configurado. Rechazar orígenes ausentes o diferentes, sin confiar en cabeceras reenviadas arbitrarias ni habilitar CORS para terceros.
- No permitir selección de base o tablas desde el cuerpo, parámetros o cabeceras del navegador.
- Responder únicamente después de generar y validar el gzip, con `Content-Type: application/gzip`, `Content-Disposition: attachment`, `Content-Length`, `Cache-Control: private, no-store` y `X-Content-Type-Options: nosniff`.
- Generar un nombre de descarga fijo y seguro en el servidor, con fecha UTC, sin revelar nombres internos de infraestructura.
- Devolver errores JSON en español: `409` si ya hay una exportación, `503` si el servicio está sin configurar, `504` por timeout y `500` por otros fallos de generación. El tamaño excedido debe tener un código de error propio y mensaje claro.
- Ante un error durante la transmisión, cerrar el flujo, limpiar recursos y registrar el fallo; después de enviar cabeceras ya no se puede sustituir la respuesta por JSON.
- Traducir errores técnicos en infraestructura. Reportar fallos inesperados mediante `reportarErrorEnAccion` con un error saneado; no enviar a logs ni correo credenciales, SQL, contenido del respaldo o stderr sin filtrar. No alertar rechazos de autorización o concurrencia esperados.

### Botón

- Mostrar estados **Descargar base de datos**, **Generando respaldo…** y **Preparando descarga…**, con mensajes accesibles para errores.
- Comprobar el estado HTTP y el tipo de contenido antes de guardar la respuesta; no descargar una página de login o un JSON como si fueran SQL.
- Obtener el nombre desde `Content-Disposition`, crear la descarga y liberar la URL temporal del navegador.
- Cancelar la petición si se abandona la página y restaurar el estado del botón cuando corresponda.
- Si se usa `fetch` y `Blob`, reconocer que el navegador recibe el archivo completo antes de guardarlo. Medir el consumo con el tamaño esperado y ajustar el límite del servidor antes de habilitar la función; no prometer streaming a disco en el navegador.
- Mostrar «Descarga iniciada» cuando el navegador recibe el archivo; no afirmar que el usuario lo guardó o que ya se comprobó su restauración.

## 6. Requisitos de despliegue

- Disponer del cliente oficial `mysqldump` compatible con el MySQL 8.x del servidor. El uso de `@prisma/adapter-mariadb` no implica que el binario instalado sea el cliente de MySQL.
- Confirmar conectividad, configuración TLS cuando corresponda y permisos efectivos para tablas, vistas, triggers, rutinas y eventos. No asumir que el usuario de ejecución ya dispone de todos los privilegios necesarios; documentar los que exige la versión instalada.
- Confirmar que las tablas son InnoDB y programar despliegues/migraciones fuera de una exportación activa.
- Verificar acceso al binario y al directorio temporal desde el usuario y las restricciones del servicio systemd.
- Proponer `MYSQLDUMP_PATH` con valor por defecto `mysqldump`, `DB_EXPORT_TIMEOUT_SECONDS` con valor `120` y `DB_EXPORT_MAX_BYTES` con valor `1073741824`; validarlas en configuración de infraestructura. No duplicar contraseñas de conexión en nuevas variables.
- Coordinar los timeouts del cliente, nginx y la aplicación: la generación termina antes de que el proxy abandone la solicitud, con margen adicional para la transferencia. `maxDuration` por sí solo no impone el timeout del subproceso.
- Mantener una única instancia de aplicación para el límite inicial de concurrencia y verificar el volumen máximo esperado frente a disco, tiempo de generación y memoria del navegador.

## 7. Fases de implementación

| Fase | Tareas | Condición de cierre |
|------|--------|--------------------|
| 1. Preparar entorno | Confirmar versiones, permisos, motores de tablas, tamaño estimado y timeouts. | La cuenta del servicio puede generar un dump en el entorno de prueba. |
| 2. Definir contratos | Crear puerto, DTO, errores y caso de uso puro. | Ninguna capa interna depende de Node.js, Next.js o adaptadores. |
| 3. Implementar adaptador | Añadir ejecución, gzip, temporales, límites y limpieza; componer el getter. | Se obtiene un gzip completo y los fallos no dejan procesos ni archivos activos. |
| 4. Exponer descarga | Crear el Route Handler con guard, validación de origen, cabeceras y adaptación de errores. | Acceso ADMIN y respuesta binaria correctos; los accesos indebidos no generan dumps. |
| 5. Incorporar botón | Integrar sección y estados en Configuración. | La descarga y los errores se entienden y se puede reintentar. |
| 6. Verificar y documentar | Ejecutar regresiones, flujo real y restauración aislada; actualizar despliegue y variables de ejemplo. | Se cumplen los criterios de aceptación y se registran los resultados reales. |

## 8. Verificación y criterios de aceptación

### Regresiones automatizadas

Utilizar las pruebas con Node.js de `scripts/verificar-flujos.mjs`, sin introducir otro framework. Cubrir comportamientos que pueden comprometer el respaldo:

- Un solicitante no autorizado no alcanza el servicio de exportación; un origen ajeno tampoco lo hace.
- La generación fallida, el timeout, el límite de tamaño y la cancelación no producen una descarga exitosa ni dejan el límite de concurrencia adquirido.
- Dos solicitudes simultáneas respetan la concurrencia acordada.
- Las credenciales con caracteres especiales se interpretan correctamente y no aparecen en argumentos o errores públicos.
- Los contratos y el caso de uso permiten sustituir el servicio por un doble sin importar infraestructura.

Los dobles del servicio no demuestran que `mysqldump` funcione. La generación y restauración reales son una verificación de integración separada.

### Prueba real en desarrollo

1. Iniciar `npm run dev` con una base de prueba representativa y el cliente MySQL disponible.
2. Ingresar como ADMIN y descargar desde Configuración. Verificar nombre, cabeceras y que el gzip se descomprime correctamente.
3. Probar acceso directo sin sesión y con USER, origen inválido, doble solicitud, binario ausente, credenciales inválidas y falta de permisos.
4. Forzar timeout, límite de tamaño y cancelaciones durante generación y transmisión; comprobar que terminan los procesos y se eliminan los temporales.
5. Restaurar el SQL únicamente en una instancia MySQL de prueba aislada, con los eventos programados desactivados y sin acceso de la aplicación a correos o servicios de producción. Nunca restaurarlo sobre la base de origen.
6. Con escrituras detenidas en la base de prueba de origen, comparar inventario de objetos y conteos de todas las tablas contra la restauración. Comprobar claves, collations, `AUTO_INCREMENT`, `_prisma_migrations`, `folios_contador`, valores nulos, acentos, caracteres especiales, decimales y fechas con microsegundos. Verificar también que se puede generar el siguiente folio sin colisiones.
7. Repetir la exportación con escrituras concurrentes controladas sobre tablas InnoDB y comprobar integridad de las relaciones restauradas. Los conteos de la base viva después de la instantánea no son una comparación válida.
8. Comprobar que el flujo no consulta ni descarga contenido de proveedores de almacenamiento.

### Controles del repositorio

```bash
npx tsc --noEmit
npm run lint
npm run test:flows
npm run build
```

Si Turbopack falla por restricciones del entorno, verificar también `npm run build -- --webpack` y registrar qué compilación pasó. No desactivar controles ni declarar un flujo real o una restauración verificados sin haberlos ejecutado.

La implementación se considera terminada cuando el administrador descarga un respaldo restaurable de toda la base configurada, los accesos indebidos son rechazados, los fallos liberan sus recursos y los controles anteriores tienen resultados documentados. La restauración de aceptación verifica exclusivamente la base de datos.

## 9. Referencias

- [Reglas del proyecto](../AGENTS.md).
- [Arquitectura y límites actuales](DESIGN.md), especialmente la adecuación del 30.09.2026.
- [Seguimiento de auditoría arquitectónica](../auditoria_arch_30.09.2026.md).
- [Plan de despliegue](../PLAN_DESPLIEGUE.md), apartado de operación diaria y respaldos MySQL.
- [Manual oficial de MySQL 8.0: mysqldump](https://dev.mysql.com/doc/refman/8.0/en/mysqldump.html), para confirmar opciones, privilegios y límites de consistencia según la versión instalada.
- Documentación local de Next.js: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` y `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/runtime.md`.
