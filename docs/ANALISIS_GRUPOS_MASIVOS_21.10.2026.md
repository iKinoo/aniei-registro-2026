# Análisis de escala — Registro grupal masivo (50, 100, 200+ miembros)

**Fecha:** 21.10.2026
**Alcance:** flujo de registro con grupo (`/registro`, paso Grupo) y registro grupal rápido (`/perfil/grupo/registro`).
**Estado:** diagnóstico previo a implementación. Sin cambios de código derivados de este documento.

---

## Resumen ejecutivo

El diseño actual asume grupos pequeños (≈5–20 miembros). Con 50–200+ miembros aparecen cinco familias de problemas:

1. **Cuellos de botella de CPU y BD dentro del request** (hashing bcryptjs secuencial; transacción con `3N+1` queries contra un timeout de 8 s; pool de 10 conexiones).
2. **Pérdida silenciosa de datos**: un fallo del grupo se traga y la acción devuelve éxito; y en `/perfil/grupo/registro` nunca se envían los correos con credenciales.
3. **Falta de validaciones críticas**: sin límite de miembros, sin deduplicación de correos (la entidad que la implementa está muerta), sin restricción única en BD.
4. **Notificación no escalable**: N+1 correos secuenciales por una sola conexión Gmail, con credenciales en claro que solo existen en memoria.
5. **Sin idempotencia**: un reintento tras timeout ambiguo puede crear cuentas duplicadas.

Las correcciones se agrupan al final en fases P0/P1/P2.

---

## 1. Cuellos de botella (fallan primero)

### 1.1 Hashing bcrypt dentro de la Server Action, sin límite de N

**Evidencia:**
- `src/application/use-cases/RegistrarGrupoRapido.ts:34-47` — `Promise.all` sobre `passwordGenerator.generar()` + `passwordHasher.hash()` para todos los miembros, *antes* de cualquier validación en BD.
- `src/infrastructure/services/auth/BcryptPasswordHasher.ts:5` — `rounds = 10`.
- `package.json:21` — `bcryptjs` (implementación **pura JS**, no nativa).

**Impacto:**
- ~100–250 ms por hash en CPU compartida → 50 miembros ≈ 5–12 s, 100 ≈ 10–25 s, 200 ≈ 20–50 s.
- `Promise.all` no paralleliza (CPU-bound, un solo hilo de Node); solo acumula trabajo.
- El event loop queda saturado durante la submission: **todo el sitio se degrada para todos los usuarios**, no solo para quien registra el grupo.
- El costo se paga incluso si la transacción después falla (rollback total).

### 1.2 Transacción con `3N+1` queries secuenciales y timeout de 8 s

**Evidencia:**
- `src/infrastructure/repositories/PrismaUsuarioRepository.ts:107-137` (`crearGrupo`) — por miembro: `folios_contador.create` (INSERT dedicado solo a obtener el id), `usuarios.create`, `accesos.create`.
- `src/infrastructure/database/PrismaTransactionManager.ts:23` — `$transaction(..., { isolationLevel: ReadCommitted, timeout: 8000 })`.

**Impacto:**
- N=200 → **601 round-trips** dentro de una sola transacción.
- BD local (~1–2 ms/query): 1–3 s. BD remota o cargada (5–10 ms RTT): 3–6+ s → riesgo alto de `TX_TIMEOUT`.
- El timeout hace **rollback total**: las 200 personas fallan de golpe después de haber pagado el costo completo de CPU, upload y red.
- No hay batching: con folios pre-asignados en bloque, `usuarios` y `accesos` cabrían en 2 `createMany`.

### 1.3 Timeouts externos y reintento del usuario

**Evidencia:**
- Costo total del request = hashing (§1.1) + `storage.subir` + transacción (§1.2). Con 200 miembros se acerca o excede los 60 s tópicos de `proxy_read_timeout` de nginx.

**Impacto:**
- El cliente ve un error de red/504, pero **el servidor puede terminar el commit después**. El coordinador reintenta → escenario de duplicados (§2.4).
- No hay deshabilitado de doble submit ni clave de idempotencia por envío.

### 1.4 Pool de conexiones = 10

**Evidencia:**
- `src/infrastructure/database/client.ts` — `connectionLimit: 10, acquireTimeout: 5000`.

**Impacto:**
- Una transacción grupal larga secuestra una conexión varios segundos. Varias submissions grupales concurrentes (día de cierre de convocatoria) + tráfico web normal → agotamiento del pool y errores `P2024` en cadena.

---

## 2. Integridad de datos

### 2.1 Fallo silencioso del grupo en `/registro`

**Evidencia:**
- `src/application/use-cases/RegistrarInscripcion.ts:12-18` — el error de `grupal.execute` se captura con `console.error` y **no se propaga**.
- `src/app/registro/actions/registrar-usuario.action.ts:272-276` — la acción devuelve `success: true` igual.

**Impacto:**
- El responsable de un grupo de 200 recibe confirmación de éxito sin que ningún miembro quedó registrado. Es el peor modo de falla a escala: invisible y costosa de detectar.

### 2.2 `/perfil/grupo/registro` nunca notifica

**Evidencia:**
- `src/app/perfil/grupo/registro/actions.ts:130-154` — llama `useCase.execute` pero **nunca `useCase.notificar`** (grep de `notificar(` solo encuentra el flujo `/registro`).
- `src/app/perfil/grupo/registro/GrupoRapidoForm.tsx:153-176` — la pantalla de éxito afirma “📬 Se ha enviado una confirmación a tu correo…”, y no renderiza los `state.folios` que la acción retorna.

**Impacto:**
- Los miembros no reciben folio ni contraseña. Las contraseñas en claro solo viven en memoria (`passwordPlana`, `RegistrarGrupoRapido.ts:36`) y se pierden al terminar el request.
- Recuperación hoy: manual, usuario por usuario, desde cpanel (`EnviarConfirmacion`, `src/app/cpanel/actions.ts:40-47`).

### 2.3 Sin deduplicación de correos — y la que existe es código muerto

**Evidencia:**
- `src/core/entities/GrupoRegistro.ts:37-69` — valida duplicados internos y contra el responsable, pero **ningún use case la usa** (grep de `GrupoRegistro` solo aparece en `core/`).
- `prisma/schema.prisma:202` — `usuarios.correo` **sin índice único**; `accesos.email` (línea 18) tampoco.
- `RegistrarGrupoRapido.execute` no consulta correos existentes antes de crear.

**Impacto:**
- Duplicados dentro de la lista o contra cuentas ya registradas se crean **felizmente**: cuentas separadas, folios distintos, mismo correo, ambigüedad de pagos/constancias. No existe ningún fallo de BD que lo advierta.

### 2.4 Sin idempotencia y sin límite de miembros

**Evidencia:**
- `src/app/perfil/grupo/registro/actions.ts:24-27` — `grupoRapidoFormSchema` tiene `min(1)` pero **no `max`**; `token` es un uuid nuevo por intento (`RegistrarGrupoRapido.ts:50`), no sirve como clave de idempotencia.
- `src/app/registro/actions/registrar-usuario.action.ts:102-112` — `numMiembros` es controlado por el cliente y el array de miembros **no pasa por Zod** (`registroSchema` no lo incluye).

**Impacto:**
- Reintento tras timeout ambiguo (§1.3) → dos grupos con los mismos miembros (§2.3 no lo impide).
- `numMiembros` manipulable → loop de `formData.get` N veces y N hashes de bcrypt: DoS trivial (100 000 “miembros” = horas de CPU y pool agotado).

### 2.5 Tipo de participante del miembro se descarta

**Evidencia:**
- `src/app/registro/actions/registrar-usuario.action.ts:251` — `miembros.map(m => ({ nombre, apellido, correo }))` elimina `idTipoParticipante` que el formulario recolecta (línea 108) y usa para calcular precios.
- `src/application/use-cases/RegistrarGrupoRapido.ts:44` — todos los miembros heredan `responsable.idTipoParticipante ?? 0`.

**Impacto:**
- Inconsistencia entre el monto pagado (suma por tipos elegidos en el wizard) y el tipo registrado. Con grupos grandes, error financiero sistemático.

---

## 3. Notificación a escala

### 3.1 N+1 correos secuenciales por una sola conexión Gmail

**Evidencia:**
- `src/application/use-cases/RegistrarGrupoRapido.ts:130-144` — `for` con `await enviarConfirmacionRegistro` por miembro.
- `src/infrastructure/services/email/NodemailerEmailService.ts:24-25` — `maxConnections: 1, pool: false`.
- El envío ocurre en `after()` (`registrar-usuario.action.ts:253-260`).

**Impacto:**
- 201 correos ≈ 1–3+ minutos; riesgo de throttling o límites diarios de Gmail (≈500 msgs/día en cuentas consumer).
- Cada fallo se acumula en `fallidos` y solo dispara alerta; **las credenciales de los fallidos se pierden** (no están persistidas en ningún lado) y no hay reintento.

---

## 4. Temas menores

| # | Hallazgo | Evidencia |
|---|---------|-----------|
| 4.1 | Folios con `padStart(4)` → formato se deforma tras `ANI26-9999`; cada rollback quema folios (huecos, inocuo) | `PrismaUsuarioRepository.ts:109`, `PrismaFolioGenerator.ts:5,12` |
| 4.2 | Formato de folio duplicado: `crearGrupo` no usa `IFolioGenerator`, reconstruye el string inline | ambas filas anteriores |
| 4.3 | Miembros sin `codigo_barras` ni constancia PDF (solo responsable) | `PrismaUsuarioRepository.ts:110-123`, `RegistrarUsuario.ts:154` |
| 4.4 | `StepGrupo` re-renderiza N tarjetas controladas por tecla y ~4N inputs ocultos en el DOM | `StepGrupo.tsx:41-43`, `GrupoRapidoForm.tsx:268-275` |
| 4.5 | `bodySizeLimit: 12mb` cubre el comprobante de 5 MB + lista de miembros (no es cuello de botella, se documenta para el despliegue) | `next.config.ts` |

---

## 5. Tiempos estimados por tamaño

| N | Hashing (bcryptjs, §1.1) | Transacción (`3N+1`, §1.2) | Correos (§3.1) | Riesgo global |
|---|--------------------------|----------------------------|----------------|----------------|
| 50 | 5–12 s | ~151 queries, 1–3 s | ~30–75 s (after) | Aceptable hoy |
| 100 | 10–25 s | ~301 queries, 2–5 s | ~1–2 min | TX al borde del timeout |
| 200 | 20–50 s | ~601 queries, 3–8 s | ~2–4 min | **TX falla con RTT alto; request vs. nginx 60 s** |
| 500 | 50–125 s | 1501 queries (o K) | ~5–10 min | Inviable en request síncrono |

---

## 6. Mitigaciones propuestas (fases)

### P0 — evitar pérdida de datos (cambios acotados, mismo request)

1. **Límite duro de miembros** validado con Zod en ambos flujos (antes de hashear o subir), y validar el array de miembros en `/registro` (hoy sin ninguna validación). Elegir el tope por decisión de negocio.
2. **Deduplicación real**: usar `GrupoRegistro` (o equivalente en el use case) + una única consulta `findMany({ where: { correo: { in: [...] } } })` antes del hashing, reportando **qué** miembros chocan.
3. **Arreglar el fallo silencioso (§2.1)**: propagar el error del grupo al usuario (o registrar el estado “grupo pendiente” visible).
4. **Arreglar la notificación ausente (§2.2)** en `registrarGrupoRapidoAction`.
5. **Batching de la transacción (§1.2)**: reservar folios en bloque (p. ej. fila contador con `UPDATE ... LAST_INSERT_ID(id + N)` o INSERT múltiple contiguo) + `createMany` para `usuarios` y `accesos`. La transacción pasa de `3N+1` a ~4–5 statements; el riesgo del timeout de 8 s desaparece.

### P1 — quitar trabajo pesado del request

6. **Estado de notificación persistente por miembro** (`pendiente/enviado/fallido`) con reenvío masivo desde cpanel; cola de emails con reintentos en lugar del `after()` secuencial.
7. **Hashing más barato o fuera de request**: evaluar `bcrypt` nativo (≈10× más rápido), reducir rounds para contraseñas generadas iniciales, o mover el hashing al job de P1.6.
8. **Idempotencia por envío**: clave de idempotencia generada en el cliente + evaluación de índice único sobre `usuarios.correo` (collation `utf8mb4_0900_ai_ci` ya es case-insensitive) tras limpiar datos existentes.

### P2 — escala real 200+

9. **Importación asíncrona**: subir CSV/lista → job en segundo plano con página de progreso, en lotes de 25–50 por transacción. Único diseño que sostiene 500+ sin timeouts end-to-end.
10. **UX del wizard**: importado/paste de lista en lugar de N tarjetas controladas (§4.4).

---

## 7. Qué NO demostró este análisis

- No se midió en servidor real: las franjas de §5 son estimaciones por composición (bcryptjs documented speed, RTT típico VPS↔DB, SMTP por conexión única). Verificar con carga antes de comprometer un tope de miembros.
- El riesgo de duplicados por reintento (§2.4) depende de la configuración de nginx del despliegue (timeouts, `proxy_next_upstream`), no auditada aquí.
