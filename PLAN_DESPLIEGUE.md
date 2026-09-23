# PLAN DE DESPLIEGUE — ANIEI Registro 2026 en servidor Linux nuevo

> **Fecha:** 2026-09-11
> **Para:** persona que recibe el código fuente y debe echar a andar la aplicación en producción en un servidor Linux.
> **Modelo de entrega:** repositorio Git en `https://github.com/iKinoo/aniei-registro-2026.git`. El servidor clona y actualiza vía `git pull`.
> **Restricciones:** **prohibido Docker**. MySQL **solo datos relacionales**; archivos en `./storage` del proyecto (filesystem puro, sin S3).
> **SO de referencia:** Ubuntu 24.04 LTS. Node 20+ (recomendado 22 LTS). MySQL 8.0+ (repositorio de Ubuntu).

---

## 1. Qué vas a instalar (mapa mental)

```
Servidor Ubuntu 24.04
├─ Node.js 22 LTS (+ npm) ............ ejecuta la app Next.js (puerto 3000)
├─ MySQL 8.0+ nativo ................. SOLO datos (tablas Prisma). Nada de binarios.
├─ /opt/aniei-registro-2026 ........... código + ./storage (comprobantes/constancias en disco)
├─ systemd (aniei.service) ............ mantiene la app viva y la arranca al boot
├─ (opcional) nginx + certbot ......... dominio público con HTTPS
└─ cron ............................... mysqldump diario + copia de ./storage
```

La app lee todo de **variables de entorno** (`.env.local`, jamás commiteado). No hay nada hardcodeado.

---

## 2. Pre-requisitos y datos que debes pedir antes de empezar

| # | Dato | Para qué | A quién pedirlo |
|---|------|----------|-----------------|
| 1 | Acceso al repositorio `https://github.com/iKinoo/aniei-registro-2026.git` | Clonar código fuente | Equipo dev |
| 2 | `AUTH_SECRET` (32+ chars aleatorios) | Firmar sesiones Auth.js. **Genera uno nuevo por entorno**, no reutilices el de otro servidor | Generarlo tú (§5.2) |
| 3 | `STORAGE_URL_SECRET` (32+ chars) | Firmar URLs de archivos `/api/archivos` | Generarlo tú (§5.2) |
| 4 | Cuenta Gmail + App Password (o SMTP que te indiquen) | Correos de confirmación/constancias (`GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM`) | Equipo ANIEI |
| 5 | Dominio público (ej. `registro.anieii.mx`) o IP | `NEXT_PUBLIC_APP_URL` + nginx/TLS | Equipo ANIEI |
| 6 | Dump de datos (`aniei-AAAA-MM-DD.sql`, formato `mysqldump`) **o** confirmación de instalación vacía | Precargar usuarios/catálogos reales | Equipo dev |
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
sudo apt install -y nodejs curl ca-certificates gnupg mysql-client git
node --version   # v22.x
npm --version
git --version

# 3.3 MySQL 8.0+ servidor (repositorio de Ubuntu)
sudo apt update && sudo apt install -y mysql-server
sudo systemctl enable --now mysql
mysql --version   # debe decir 8.0+
mysqladmin ping   # mysqld is alive

# 3.4 Usuario del SO para la app (no correr como root)
sudo useradd -m -s /bin/bash aniei || true
```

---

## 4. Base de datos `[AMBAS]`

```bash
# 4.1 Usuario + BD + shadow DB (como root). Cambia 'TU-CLAVE-SEGURA'.
sudo mysql <<'SQL'
CREATE DATABASE IF NOT EXISTS aniei CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE DATABASE IF NOT EXISTS aniei_shadow CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'aniei'@'localhost' IDENTIFIED BY 'TU-CLAVE-SEGURA';
GRANT ALL PRIVILEGES ON aniei.* TO 'aniei'@'localhost';
GRANT ALL PRIVILEGES ON aniei_shadow.* TO 'aniei'@'localhost';
FLUSH PRIVILEGES;
SQL

# 4.2 Configurar zona horaria UTC y charset
sudo tee -a /etc/mysql/mysql.conf.d/mysqld.cnf <<'EOF'

# Configuración ANIEI
default-time-zone       = '+00:00'
character-set-server    = utf8mb4
collation-server        = utf8mb4_0900_ai_ci
EOF

sudo systemctl restart mysql

# 4.3 Verificar configuración
mysql -u aniei -p'TU-CLAVE-SEGURA' aniei -e "SELECT VERSION(), @@collation_database, @@time_zone;"
```

> Si el servidor de BD y app están en máquinas distintas, ajusta `bind-address` en `mysqld.cnf` y firewall. Por defecto esta guía asume **todo en el mismo servidor**.

---

## 5. Código y configuración `[AMBAS]`

```bash
# 5.1 Clonar el repositorio en /opt
cd /opt
git clone https://github.com/iKinoo/aniei-registro-2026.git
cd /opt/aniei-registro-2026
ls PLAN_DESPLIEGUE.md .env.example package.json   # confirma que es el paquete completo

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
DATABASE_URL="mysql://aniei:TU-CLAVE-SEGURA@localhost:3306/aniei"
DIRECT_URL="mysql://aniei:TU-CLAVE-SEGURA@localhost:3306/aniei"
SHADOW_DATABASE_URL="mysql://aniei:TU-CLAVE-SEGURA@localhost:3306/aniei_shadow"

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

### 6.1 `[CON-DATOS]` Restaurar dump (recomendado si te entregaron `.sql`)

```bash
source /tmp/prod-env.sh   # helper del §6 (si abriste otra terminal, regenéralo)
mysql -u aniei -p "$DIRECT_URL" < /ruta/al/aniei-AAAA-MM-DD.sql

npx prisma migrate status   # esperado: "Database schema is up to date!"
```

### 6.2 `[VACÍA]` Esquema desde cero (sin dump)

> El esquema se aplica con `prisma migrate deploy`. Las migraciones PG antiguas están archivadas en `docs/db/migrations_pg_legacy/`.

```bash
source /tmp/prod-env.sh
npx prisma migrate deploy                # aplica el baseline init_mysql
npx prisma migrate status                # "Database schema is up to date!"

# Sembrar catálogos (idempotente, puede re-ejecutarse)
npx tsx prisma/seed.ts
```

> `[VACÍA]` Catálogos: el seed incluye `cargos`, `estados`, `tipo_usuario`, `tipo_actividad`, `titulos`, `instituciones`, `tipo_participante`, `precios_inscripcion`.

---

## 7. Archivos (`./storage`) `[AMBAS]`

```bash
# 7.1 Estructura (ya viene con .gitkeep; el contenido real NO está en git)
mkdir -p storage/comprobantes storage/constancias
sudo chown -R aniei:aniei /opt/aniei-registro-2026/storage
sudo chmod 750 /opt/aniei-registro-2026/storage

# 7.2 [CON-DATOS] Copiar los archivos entregados preservando rutas bucket/path
# Ejemplo (ajusta origen):
rsync -a --info=progress2 /origen/storage/ /opt/aniei-registro-2026/storage/
# o: tar -xzf storage-AAAA-MM-DD.tgz -C /opt/aniei-registro-2026/
sudo chown -R aniei:aniei /opt/aniei-registro-2026/storage

# 7.3 Verificar: cada archivo referenciado en BD debe existir en disco
source /tmp/prod-env.sh
mysql -u aniei -p -N -e "SELECT archivo_url FROM depositos UNION SELECT constancia_url FROM facturaciones WHERE constancia_url IS NOT NULL;" aniei \
  | sort -u > /tmp/rutas-bd.txt
find ./storage/comprobantes ./storage/constancias -type f | sed 's|^\./storage/||' | sort > /tmp/rutas-disco.txt
comm -23 /tmp/rutas-bd.txt /tmp/rutas-disco.txt   # debe salir VACÍO (cero links rotos)
```

> Archivos en disco sin referencia en BD (huérfanos de subidas interrumpidas) son normales y no bloquean. No los borres el primer día.

---

## 8. Primer usuario ADMIN `[AMBAS]`

La app autentica contra la tabla `accesos` (Auth.js + bcrypt, sin proveedor externo). Si la BD viene del dump, los admins ya existen. Si es instalación vacía (o perdiste el acceso), créalo así:

> **IMPORTANTE:** La tabla `accesos` tiene foreign key a `usuarios`. **Primero debes crear el usuario en `usuarios` y luego el acceso en `accesos`**, de lo contrario fallará por integridad referencial.

```bash
source /tmp/prod-env.sh
# Extraer password de DATABASE_URL para mysql (evita prompt interactivo)
export MYSQL_PWD=$(python3 -c "import urllib.parse; print(urllib.parse.urlparse('$DATABASE_URL').password)")

FOLIO="ANI26-0001"
NOMBRE="Administrador"
APELLIDO="ANIEI"
CORREO="admin@tudominio.mx"
PASS="Cambia-esto-ya-2026!"   # contraseña inicial; el admin la cambia al entrar

# Paso 1: Crear el usuario en la tabla usuarios
mysql -u aniei -e "INSERT INTO usuarios (folio_registro, nombre, apellido, correo) VALUES ('$FOLIO','$NOMBRE','$APELLIDO','$CORREO')
  ON DUPLICATE KEY UPDATE folio_registro=folio_registro;" aniei

# Paso 2: Crear el acceso con rol ADMIN
HASH=$(node -e "const b=require('bcryptjs'); b.hash(process.argv[1],10).then(h=>console.log(h))" "$PASS")
mysql -u aniei -e "INSERT INTO accesos (folio_registro, email, rol, nombre, password) VALUES ('$FOLIO','$CORREO','ADMIN','$NOMBRE','$HASH')
  ON DUPLICATE KEY UPDATE folio_registro=folio_registro;" aniei

unset MYSQL_PWD
```

> Si ya existe un usuario creado por registro normal y solo quieres darle acceso admin:
> ```bash
> source /tmp/prod-env.sh
> export MYSQL_PWD=$(python3 -c "import urllib.parse; print(urllib.parse.urlparse('$DATABASE_URL').password)")
> FOLIO="folio-existente"
> PASS="Cambia-esto-ya-2026!"
> HASH=$(node -e "const b=require('bcryptjs'); b.hash(process.argv[1],10).then(h=>console.log(h))" "$PASS")
> mysql -u aniei -e "INSERT INTO accesos (folio_registro, email, rol, nombre, password) VALUES ('$FOLIO','admin@tudominio.mx','ADMIN','Administrador','$HASH')
>   ON DUPLICATE KEY UPDATE rol='ADMIN';" aniei
> unset MYSQL_PWD
> ```

---

## 9. Arranque en producción con systemd `[AMBAS]`

```bash
# 9.1 Compilar y verificar
sudo npm run build    # debe terminar sin errores
sudo npx tsc --noEmit # cero errores


# 9.2 Unidad systemd (WorkingDirectory es OBLIGATORIO: ./storage es relativo a él)
sudo tee /etc/systemd/system/aniei.service > /dev/null <<'UNIT'
[Unit]
Description=ANIEI Registro 2026 (Next.js)
After=network.target mysql.service
Requires=mysql.service

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
| 1 | MySQL online, v8.0+ | `mysqladmin ping; mysql -u aniei -p -e "SELECT VERSION();"` | `mysqld is alive`, `8.0+` |
| 2 | Migraciones al día | `source /tmp/prod-env.sh && npx prisma migrate status` | `up to date!` |
| 3 | Charset y collation | `mysql -u aniei -p -e "SELECT @@collation_database;" aniei` | `utf8mb4_0900_ai_ci` |
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

# Reinicio tras cambio de .env.local
sudo systemctl restart aniei

# Respaldos (cron sugerido 02:00; guarda 7 días)
mkdir -p /var/backups/aniei
mysqldump --single-transaction --quick --routines --triggers --default-character-set=utf8mb4 \
  -u aniei -p"$MYSQL_PWD" aniei | gzip > /var/backups/aniei/aniei-$(date +%F).sql.gz
tar -czf /var/backups/aniei/storage-$(date +%F).tgz -C /opt/aniei-registro-2026 storage
find /var/backups/aniei -mtime +7 -delete
```

Restaurar respaldo: §6.1 con tu `.sql` + extraer el `.tgz` sobre `./storage/` (mismo `chown`), reiniciar servicio.

---

## 13. Actualizar a una versión nueva

> El servidor usa git. **Nunca hagas `git pull` sin respaldar primero** en caso de que algo falle.

```bash
# 13.1 Respaldar BD antes de actualizar
source /tmp/prod-env.sh   # helper del §6 (regenéralo si abriste otra terminal)
mysqldump --single-transaction --quick --routines --triggers --default-character-set=utf8mb4 \
  -u aniei -p"$MYSQL_PWD" aniei | gzip > /var/backups/aniei/aniei-previo-$(date +%F).sql.gz

# 13.2 Detener servicio y actualizar código
sudo systemctl stop aniei
cd /opt/aniei-registro-2026
git pull origin main

# 13.3 Reinstalar dependencias y compilar
npm ci
npm run build

# 13.4 Aplicar migraciones si las hay
source /tmp/prod-env.sh
npx prisma migrate status   # si dice "pending", aplica:
# npx prisma migrate deploy

# 13.5 Asegurar permisos y arrancar
chown -R aniei:aniei .next node_modules
sudo systemctl start aniei
# verifica checklist §11 filas 6–10
```

**Rollback de versión:**
```bash
# Ver commit anterior
cd /opt/aniei-registro-2026
git log --oneline -5

# Volver a versión anterior
sudo systemctl stop aniei
git checkout <commit-hash>
npm ci && npm run build
chown -R aniei:aniei .next node_modules
sudo systemctl start aniei

# Si hubo migraciones nuevas, restaurar BD desde respaldo:
# source /tmp/prod-env.sh && gunzip < /var/backups/aniei/aniei-previo-YYYY-MM-DD.sql.gz | mysql -u aniei -p aniei
```

> Nunca corras `prisma migrate dev` ni `prisma db push` en producción (pueden borrar datos). Solo `migrate deploy` / `migrate status`.

---

## 14. Problemas comunes

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| `prisma migrate deploy` → "datasource.url is required" | Prisma CLI no lee `.env.local` | Exporta vars primero (`source /tmp/prod-env.sh`, §6) |
| `migrate deploy` → `Table 'accesos' doesn't exist` en BD **vacía** | Sin baseline (esperado) | Usa `npx prisma migrate deploy` con el baseline `init_mysql` |
| `Error: STORAGE_URL_SECRET debe tener min 32` | Secreto corto o ausente | Regenera con `openssl` (§5.2), reinicia |
| Subidas fallan / 500 al registrar | Permisos de `./storage` o `WorkingDirectory` mal | Como root: `chown -R aniei:aniei /opt/aniei-registro-2026/storage`, verifica `WorkingDirectory` en la unit |
| `/api/archivos/...` → 401 siempre | `STORAGE_URL_SECRET` distinto entre quien firmó y quien sirve (dos instancias con env distinto) | Unifica el secreto, reinicia |
| Login redirige a localhost | `NEXT_PUBLIC_APP_URL` con valor viejo | Pon la URL pública + `restart` |
| `UntrustedHost` en logs de auth | NextAuth no confía en el host detrás de nginx | Verifica `trustHost: true` en `src/auth.config.ts` y que `NEXT_PUBLIC_APP_URL` sea el dominio público |
| Correos no llegan | Gmail bloquea / App Password inválida | Genera nueva App Password (2FA activado), revisa `journalctl` |
| `Access denied for user 'aniei'@'localhost'` | Contraseña incorrecta o usuario no creado | Verifica credenciales en `.env.local` y recrea usuario (§4.1) |
| Puerto 3000 en uso | Dos instancias | `ss -ltnp \| grep 3000`, mata la sobrante, `systemctl restart aniei` |
| `pool timeout` en logs | MySQL no responde o credenciales mal | Verifica `mysqladmin ping` y credenciales en `.env.local` |
| Permiso denegado en `.next` o `node_modules` tras `git pull` | Archivos creados por root pero servicio corre como `aniei` | Como root: `chown -R aniei:aniei /opt/aniei-registro-2026/.next /opt/aniei-registro-2026/node_modules` |

---
