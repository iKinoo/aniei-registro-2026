# PLAN DE DESPLIEGUE — ANIEI Registro 2026 en servidor Linux nuevo

> **Fecha:** 2026-09-04
> **Para:** persona que recibe el código fuente y debe echar a andar la aplicación en producción en un servidor Linux.
> **Rama a desplegar:** `feat/local-postgres` (incluye migración a PG local + storage en filesystem; ver `PLAN_MIGRACION_INFRA.md` y `AUDITORIA_04.09.2026.md`).
> **Restricciones:** **prohibido Docker**. PostgreSQL **solo datos relacionales**; archivos en `./storage` del proyecto (filesystem puro, sin S3).
> **SO de referencia:** Ubuntu 24.04 LTS. Node 20+ (recomendado 22 LTS). PostgreSQL 17 (repositorio oficial PGDG).

---

## 1. Qué vas a instalar (mapa mental)

```
Servidor Ubuntu 24.04
├─ Node.js 22 LTS (+ npm) ............ ejecuta la app Next.js (puerto 3000)
├─ PostgreSQL 17 nativo .............. SOLO datos (tablas Prisma). Nada de binarios.
├─ /opt/aniei-registro-2026 ........... código + ./storage (comprobantes/constancias en disco)
├─ systemd (aniei.service) ............ mantiene la app viva y la arranca al boot
├─ (opcional) nginx + certbot ......... dominio público con HTTPS
└─ cron ............................... pg_dump diario + copia de ./storage
```

La app lee todo de **variables de entorno** (`.env.local`, jamás commiteado). No hay nada hardcodeado.

---

## 2. Pre-requisitos y datos que debes pedir antes de empezar

| # | Dato | Para qué | A quién pedirlo |
|---|------|----------|-----------------|
| 1 | Código fuente (rama `feat/local-postgres`) + tag de referencia | Desplegar exactamente lo auditado | Equipo dev |
| 2 | `AUTH_SECRET` (32+ chars aleatorios) | Firmar sesiones Auth.js. **Genera uno nuevo por entorno**, no reutilices el de otro servidor | Generarlo tú (§5.2) |
| 3 | `STORAGE_URL_SECRET` (32+ chars) | Firmar URLs de archivos `/api/archivos` | Generarlo tú (§5.2) |
| 4 | Cuenta Gmail + App Password (o SMTP que te indiquen) | Correos de confirmación/constancias (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM`) | Equipo ANIEI |
| 5 | Dominio público (ej. `registro.aniii.mx`) o IP | `NEXT_PUBLIC_APP_URL` + nginx/TLS | Equipo ANIEI |
| 6 | Dump de datos (`aniei-AAAA-MM-DD.dump`, formato `pg_dump -Fc`) **o** confirmación de instalación vacía | Precargar usuarios/catálogos reales | Equipo dev |
| 7 | Carpeta `storage/` con archivos (o acceso para migrarlos) | Comprobantes/constancias históricas | Equipo dev |
| 8 | Credenciales del primer ADMIN (folio + contraseña inicial) | Entrar al `/cpanel` | Se crean en §8 |

**Decide al inicio:** ¿instalación **con datos** (restauras dump + storage) o **vacía** (esquema + catálogos mínimos + primer admin)? El resto de la guía marca cada paso como `[CON-DATOS]`, `[VACÍA]` o `[AMBAS]`.

---

## 3. Preparar el servidor `[AMBAS]`

```bash
# 3.1 Actualizar SO
sudo apt update && sudo apt upgrade -y

# 3.2 Node 22 LTS (NodeSource) + herramientas
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git curl ca-certificates gnupg postgresql-client-17
node --version   # v22.x
npm --version

# 3.3 PostgreSQL 17 servidor (repositorio oficial PGDG; Ubuntu 24.04 trae el 16 por defecto)
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc \
  | sudo gpg --dearmor -o /usr/share/keyrings/postgresql-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/postgresql-keyring.gpg] \
http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" \
  | sudo tee /etc/apt/sources.list.d/pgdg.list
sudo apt update && sudo apt install -y postgresql-17
sudo systemctl enable --now postgresql
sudo -u postgres psql -c "SHOW server_version;"   # debe decir 17.x
pg_isready -h localhost -p 5432

# 3.4 Usuario del SO para la app (no correr como root)
sudo useradd -m -s /bin/bash aniei || true
```

---

## 4. Base de datos `[AMBAS]`

```bash
# 4.1 Rol + BD + extensión (como postgres). Cambia 'TU-CLAVE-SEGURA'.
sudo -u postgres psql <<'SQL'
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='aniei') THEN
    CREATE ROLE aniei LOGIN PASSWORD 'TU-CLAVE-SEGURA';
  END IF;
END $$;
SQL
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='aniei'" | grep -q 1 \
  || sudo -u postgres createdb -O aniei aniei
sudo -u postgres psql -d aniei -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"

# 4.2 Abrir solo localhost (verifica; por defecto pg_hba ya es local/peer+scram)
sudo grep -v '^#' /etc/postgresql/17/main/pg_hba.conf | grep -v '^$' | head
```

> Si el servidor de BD y app están en máquinas distintas, ajusta `postgresql.conf` (`listen_addresses`), `pg_hba.conf` y firewall. Por defecto esta guía asume **todo en el mismo servidor**.

---

## 5. Código y configuración `[AMBAS]`

```bash
# 5.1 Clonar como usuario aniei
sudo -u aniei -i
git clone -b feat/local-postgres <URL-DEL-REPO> /opt/aniei-registro-2026
cd /opt/aniei-registro-2026
git log --oneline -1   # confirma el commit entregado

# 5.2 Generar secretos (uno por entorno, no reutilizar entre servidores)
openssl rand -base64 32   # → AUTH_SECRET
openssl rand -base64 32   # → STORAGE_URL_SECRET (mínimo 32 chars)

# 5.3 Crear .env.local desde el ejemplo
cp .env.example .env.local
chmod 600 .env.local
nano .env.local
```

Contenido mínimo de `.env.local` en producción:

```bash
DATABASE_URL="postgresql://aniei:TU-CLAVE-SEGURA@localhost:5432/aniei"
DIRECT_URL="postgresql://aniei:TU-CLAVE-SEGURA@localhost:5432/aniei"

STORAGE_PROVIDER="filesystem"
STORAGE_LOCAL_DIR="./storage"
STORAGE_URL_SECRET="<salida del openssl #2>"
FILE_URL_TTL_SECONDS="300"

NEXT_PUBLIC_APP_URL="https://TU-DOMINIO"   # ¡debe ser la URL pública real! (Auth.js la usa)
AUTH_SECRET="<salida del openssl #1>"

GMAIL_USER="registro.aniei@gmail.com"
GMAIL_APP_PASSWORD="<app-password>"
EMAIL_FROM="ANIEI 2026 <registro.aniei@gmail.com>"
```

Reglas del `.env.local` (importantes, ya mordieron una vez):
- **Cada valor entre comillas dobles**, sin espacios fuera de ellas. Una línea tipo `EMAIL_FROM=ANIEI 2026 <...>` sin comillas **rompe** la carga de variables.
- Prisma CLI **no lee `.env.local` automáticamente** (solo `.env`): todos los comandos `prisma` de esta guía exportan primero las variables con el helper del §6. No crees un `.env` duplicado (se desincroniza).
- `STORAGE_LOCAL_DIR="./storage"` es **relativa al directorio de trabajo del proceso** → el §9 fija `WorkingDirectory=/opt/aniei-registro-2026`. Si cambias la ruta, usa absoluta y actualiza systemd.
- Permisos `600` (solo el usuario `aniei` la lee; contiene claves de correo y secretos de firma).

---

## 6. Dependencias y esquema `[AMBAS]`

```bash
cd /opt/aniei-registro-2026
npm ci            # instalación reproducible (usa package-lock.json)
```

Helper para exportar variables (úsalo **antes de cada comando `prisma`**):

```bash
# Genera /tmp/prod-env.sh desde .env.local (maneja comillas y espacios) y cárgalo:
python3 - <<'PY' > /tmp/prod-env.sh
for l in open('.env.local'):
    s = l.strip()
    if not s or s.startswith('#') or '=' not in s:
        continue
    k, v = s.split('=', 1)
    k = k.strip(); v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] and v[0] in '"\'':
        v = v[1:-1]
    v = v.replace("'", "'\\''")
    print(f"export {k}='{v}'")
PY
source /tmp/prod-env.sh
```

### 6.1 `[CON-DATOS]` Restaurar dump (recomendado si te entregaron `.dump`)

```bash
source /tmp/prod-env.sh   # helper del §6 (si abriste otra terminal, regenéralo)
pg_restore -d "$DIRECT_URL" --schema=public --clean --if-exists --no-owner --no-acl /ruta/al/aniei-AAAA-MM-DD.dump

npx prisma migrate status   # esperado: "Database schema is up to date!" (10 migraciones)
```

### 6.2 `[VACÍA]` Esquema desde cero (sin dump)

> El historial `prisma/migrations/` no incluye migración base (las tablas se crearon con `db push`), así que `migrate deploy` falla en BD vacía. Procedimiento de baseline:

```bash
source /tmp/prod-env.sh
npx prisma db push                    # crea tablas según prisma/schema.prisma
# Marcar TODO el historial como aplicado (una por una; --applied acepta una sola):
for m in $(ls prisma/migrations/); do
  npx prisma migrate resolve --applied "$m"
done
npx prisma migrate status   # "Database schema is up to date!"
```

> Si el equipo agregó migraciones después, el `for` las cubre solo (lee el directorio). No edites la lista a mano.
>
> `[VACÍA]` Catálogos: **NO uses `docs/db/*.sql` ni `legacy_*.sql`** (esquema viejo `id_usuario`, no `folio_registro`). Pide al equipo el seed vigente o carga catálogos (`estados`, `instituciones`, `titulos`, `tipo_usuario`, `tipo_participante`, `tipo_actividad`, `precios_inscripcion`) desde el entorno de referencia.

---

## 7. Archivos (`./storage`) `[AMBAS]`

```bash
# 7.1 Estructura (ya viene con .gitkeep; el contenido real NO está en git)
mkdir -p storage/comprobantes storage/constancias
sudo chown -R aniei:aniei /opt/aniei-registro-2026/storage
chmod 750 /opt/aniei-registro-2026/storage

# 7.2 [CON-DATOS] Copiar los archivos entregados preservando rutas bucket/path
# Ejemplo (ajusta origen):
rsync -a --info=progress2 /origen/storage/ /opt/aniei-registro-2026/storage/
# o: tar -xzf storage-AAAA-MM-DD.tgz -C /opt/aniei-registro-2026/
sudo chown -R aniei:aniei /opt/aniei-registro-2026/storage

# 7.3 Verificar: cada archivo referenciado en BD debe existir en disco
source /tmp/prod-env.sh
psql "$DIRECT_URL" -tA -c "SELECT archivo_url FROM depositos UNION SELECT constancia_url FROM facturaciones WHERE constancia_url IS NOT NULL;" \
  | sort -u > /tmp/rutas-bd.txt
find ./storage/comprobantes ./storage/constancias -type f | sed 's|^\./storage/||' | sort > /tmp/rutas-disco.txt
comm -23 /tmp/rutas-bd.txt /tmp/rutas-disco.txt   # debe salir VACÍO (cero links rotos)
```

> Archivos en disco sin referencia en BD (huérfanos de subidas interrumpidas) son normales y no bloquean. No los borres el primer día.

---

## 8. Primer usuario ADMIN `[AMBAS]`

La app autentica contra la tabla `accesos` (Auth.js + bcrypt, sin proveedor externo). Si la BD viene del dump, los admins ya existen. Si es instalación vacía (o perdiste el acceso), créalo así:

```bash
source /tmp/prod-env.sh
FOLIO="ANI26-0001"  # usa el folio del usuario admin (debe existir en tabla usuarios)
PASS="Cambia-esto-ya-2026!"   # contraseña inicial; el admin la cambia al entrar

HASH=$(node -e "const b=require('bcryptjs'); b.hash(process.argv[1],10).then(h=>console.log(h))" "$PASS")
psql "$DIRECT_URL" -c "INSERT INTO accesos (folio_registro, email, rol, nombre, password) VALUES ('$FOLIO','admin@tudominio.mx','ADMIN','Administrador','$HASH')
  ON CONFLICT DO NOTHING;"
```

> En instalación vacía primero inserta el `usuario` con ese folio (o usa `folio_registro` de un usuario creado por registro normal y luego súbelo a `ADMIN`: `UPDATE accesos SET rol='ADMIN' WHERE folio_registro='...';`).

---

## 9. Arranque en producción con systemd `[AMBAS]`

```bash
# 9.1 Compilar y verificar
npm run build    # debe terminar sin errores
npx tsc --noEmit # cero errores
npm run lint     # cero errores

# 9.2 Unidad systemd (WorkingDirectory es OBLIGATORIO: ./storage es relativo a él)
sudo tee /etc/systemd/system/aniei.service > /dev/null <<'UNIT'
[Unit]
Description=ANIEI Registro 2026 (Next.js)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=aniei
Group=aniei
WorkingDirectory=/opt/aniei-registro-2026
EnvironmentFile=/opt/aniei-registro-2026/.env.local
ExecStart=/usr/bin/npm start -- --port 3000 --hostname 127.0.0.1
Restart=always
RestartSec=5
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable --now aniei
sleep 8
sudo systemctl is-active aniei          # active
sudo journalctl -u aniei -n 30 --no-pager
curl -s -o /dev/null -w "login:%{http_code}\n" http://127.0.0.1:3000/login
```

> `EnvironmentFile=` carga el `.env.local` (formato `KEY="value"` compatible). Si editas el `.env.local`, recarga con `sudo systemctl restart aniei`.
> Puerto 3000 solo en loopback; el acceso público entra por nginx (§10).

---

## 10. (Recomendado) nginx + HTTPS `[AMBAS]`

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
sudo tee /etc/nginx/sites-available/aniei > /dev/null <<'NGINX'
server {
  listen 80;
  server_name TU-DOMINIO;
  client_max_body_size 12m;   # comprobantes PDF/imagen
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
NGINX
sudo ln -s /etc/nginx/sites-available/aniei /etc/nginx/sites-enabled/aniei
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d TU-DOMINIO   # emite TLS y redirige 80→443
```

Tras activar HTTPS, `NEXT_PUBLIC_APP_URL` debe ser `https://TU-DOMINIO` (reinicia `aniei.service`).

Firewall mínimo: `sudo ufw allow 22,80,443/tcp && sudo ufw enable`. **No expongas el 5432** a internet.

---

## 11. Verificación de aceptación (checklist firmable)

| # | Prueba | Comando / acción | Esperado |
|---|--------|------------------|----------|
| 1 | PG online, v17 | `pg_isready; sudo -u postgres psql -c "SHOW server_version;"` | `accepting connections`, `17.x` |
| 2 | Migraciones al día | `source /tmp/prod-env.sh && npx prisma migrate status` | `up to date!` |
| 3 | `pg_trgm` | `psql "$DIRECT_URL" -c "SELECT * FROM pg_extension WHERE extname='pg_trgm';"` | 1 fila |
| 4 | Conteos `[CON-DATOS]` | `count(*)` de `usuarios/depositos/accesos/inscripcion_actividades` vs origen | Iguales |
| 5 | Cero links rotos | `comm -23 rutas-bd rutas-disco` (§7.3) | Vacío |
| 6 | Servicio vivo | `systemctl is-active aniei`, `curl /login` | `active`, HTTP 200 |
| 7 | Login ADMIN | Entrar con folio+contraseña §8 → `/cpanel` | Panel visible |
| 8 | Login USER | Entrar como participante → `/perfil` | Perfil + comprobante abre (200) |
| 9 | Registro E2E | Alta de prueba con comprobante JPG/PDF | Archivo nuevo en `./storage/comprobantes/`, correo llega |
| 10 | Seguridad archivos | URL `/api/archivos/...` sin sesión / expirada / de otro folio | 401 / 410 / 403 |
| 11 | HTTPS | `curl -sI https://TU-DOMINIO/login` | 200 con TLS válido |
| 12 | Build limpio | `npm run build`, `npx tsc --noEmit`, `npm run lint` | Verdes |

Si algo falla, ve al §14 antes de tocar la BD.

---

## 12. Operación diaria

```bash
# Estado y logs
sudo systemctl status aniei --no-pager
sudo journalctl -u aniei -f                    # en vivo
sudo journalctl -u aniei --since "1 hour ago" --no-pager | tail -50

# Reinicio tras cambio de .env.local o código
cd /opt/aniei-registro-2026 && git pull && npm ci && npm run build
sudo systemctl restart aniei

# Respaldos (cron sugerido 02:00; guarda 7 días)
mkdir -p /var/backups/aniei
pg_dump -Fc -f /var/backups/aniei/aniei-$(date +%F).dump "$DIRECT_URL"
tar -czf /var/backups/aniei/storage-$(date +%F).tgz -C /opt/aniei-registro-2026 storage
find /var/backups/aniei -mtime +7 -delete
```

Restaurar respaldo: §6.1 con tu `.dump` + extraer el `.tgz` sobre `./storage/` (mismo `chown`), reiniciar servicio.

---

## 13. Actualizar a una versión nueva del código

```bash
cd /opt/aniei-registro-2026
git fetch && git status          # revisa qué va a cambiar
git pull                          # o checkout del tag/commit indicado por dev
npm ci && npm run build
source /tmp/prod-env.sh && npx prisma migrate status   # si hay migraciones nuevas:
# npx prisma migrate deploy
sudo systemctl restart aniei
# verifica checklist §11 filas 6–10
```

> Nunca corras `prisma migrate dev` ni `prisma db push` en producción (pueden borrar datos). Solo `migrate deploy` / `migrate status`.

---

## 14. Problemas comunes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `prisma migrate deploy` → "datasource.url is required" | Prisma CLI no lee `.env.local` | Exporta vars primero (`source /tmp/prod-env.sh`, §6) |
| `migrate deploy` → `relation "accesos" does not exist` en BD **vacía** | Sin baseline (esperado) | Usa §6.2 (`db push` + `resolve --applied`), no `deploy` |
| `Error: STORAGE_URL_SECRET debe tener min 32` | Secreto corto o ausente | Regenera con `openssl` (§5.2), reinicia |
| Subidas fallan / 500 al registrar | Permisos de `./storage` o `WorkingDirectory` mal | `chown aniei:aniei storage`, verifica `WorkingDirectory` en la unit |
| `/api/archivos/...` → 401 siempre | `STORAGE_URL_SECRET` distinto entre quien firmó y quien sirve (dos instancias con env distinto) | Unifica el secreto, reinicia |
| Login redirige a localhost | `NEXT_PUBLIC_APP_URL` con valor viejo | Pon la URL pública + `restart` |
| Correos no llegan | Gmail bloquea / App Password inválida | Genera nueva App Password (2FA activado), revisa `journalctl` |
| `Peer authentication failed` en psql | Usuario SO ≠ rol PG | Usa `psql -h localhost -U aniei -d aniei` (pide clave) |
| Puerto 3000 en uso | Dos instancias | `ss -ltnp \| grep 3000`, mata la sobrante, `restart aniei` |

---

## 15. Seguridad mínima antes de abrir al público

- [ ] `.env.local` con `chmod 600` y dueño `aniei`; jamás commiteado ni enviado por chat sin redactar.
- [ ] `AUTH_SECRET` y `STORAGE_URL_SECRET` únicos de este servidor (generados aquí).
- [ ] Contraseña del rol `aniei` fuerte y solo en `.env.local`.
- [ ] Postgres escuchando solo localhost; UFW con 22/80/443; 5432 y 3000 **no** expuestos.
- [ ] HTTPS activo y `NEXT_PUBLIC_APP_URL=https://...`.
- [ ] Primer ADMIN con contraseña inicial cambiada tras el primer login.
- [ ] Respaldos programados y **restaurados una vez en prueba** (un backup no probado no existe).
- [ ] `supabase/migrations_legacy/` no se ejecuta nunca; fuente de esquema: `prisma/migrations/`.

---

*Guía generada 2026-09-04 desde el estado real de la rama `feat/local-postgres` (PG 17 nativo, `./storage`, systemd). Dudas de arquitectura: `AUDITORIA_04.09.2026.md`. Detalle de la migración origen: `PLAN_MIGRACION_INFRA.md`.*
