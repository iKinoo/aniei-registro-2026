#!/usr/bin/env bash
set -Eeuo pipefail

# ANIEI 2026 - despliegue con sudo (root instala; aniei ejecuta).
# Uso: sudo ./scripts/actualizar-sistema.sh [--yes] [--force]
# PRECAUCION: este despliegue detiene la aplicacion durante instalacion/build.
# NO revierte migraciones de BD ni garantiza recuperacion frente a fallos del disco.

APP_DIR="/opt/aniei-registro-2026"
SERVICE="aniei"
RUNTIME_USER="aniei"
RUNTIME_GROUP="aniei"
STORAGE_DIR="$APP_DIR/storage"
REMOTO="origin"
RAMA="main"
EJECUTAR_TEST_FLOWS=1
LOG_DIR="/var/log/aniei"
LOCK_FILE="/run/lock/aniei-actualizacion.lock"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"
HEALTH_REINTENTOS=15
HEALTH_INTERVALO=2

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
err() { printf '[%s] ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2; }
fail() { err "$*"; exit 1; }

CONFIRMADO=0
FORZAR=0
ETAPA="Preparacion"
PREV_SHA=""
DESPLIEGUE_INICIADO=0
SERVICIO_ANTES_ACTIVO=0
MIGRACIONES_INICIADAS=0

for arg in "$@"; do
  case "$arg" in
    --yes|-y) CONFIRMADO=1 ;;
    --force|-f) FORZAR=1 ;;
    *) fail "Opcion desconocida: $arg" ;;
  esac
done

(( EUID == 0 )) || fail "Ejecuta con sudo (root)."
umask 077
mkdir -p -- "$LOG_DIR"
LOG_FILE="$LOG_DIR/actualizacion-$(date +%Y%m%d-%H%M%S)-$$.log"
touch -- "$LOG_FILE"
exec > >(tee -a "$LOG_FILE") 2>&1

# Se confia SOLO en este repositorio fijo durante este comando Git.
# Evita alterar globalmente safe.directory en root.
git_app() { git -c "safe.directory=$APP_DIR" "$@"; }

# Prisma CLI necesita variables; no evalua shell del .env.local.
# Se excluyen variables que alterarian la ejecucion del despliegue.
cargar_env_local() {
  local archivo="$1" linea clave valor
  while IFS= read -r linea || [[ -n "$linea" ]]; do
    linea="${linea%$'\r'}"
    [[ "$linea" =~ ^[[:space:]]*($|#) ]] && continue
    [[ "$linea" == *=* ]] || continue
    clave="${linea%%=*}"
    valor="${linea#*=}"
    [[ "$clave" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)[[:space:]]*$ ]] || continue
    clave="${BASH_REMATCH[1]}"
    case "$clave" in
      PATH|HOME|SHELL|IFS|BASH_ENV|ENV|LD_*|NODE_OPTIONS|NPM_CONFIG_*|npm_config_*|GIT_*) continue ;;
    esac
    if [[ "$valor" =~ ^\"(.*)\"$ || "$valor" =~ ^\'(.*)\'$ ]]; then
      valor="${valor:1:${#valor}-2}"
    fi
    export "$clave=$valor"
  done < "$archivo"
}

mostrar_diagnostico() {
  systemctl status "$SERVICE" --no-pager --full || true
  journalctl -u "$SERVICE" -n 40 --no-pager -o short-iso || true
}

verificar_salud() {
  local i
  for ((i=1;i<=HEALTH_REINTENTOS;i++)); do
    if systemctl is-active --quiet "$SERVICE" && \
       curl -fsSL --max-redirs 3 --max-time 5 -o /dev/null "$HEALTH_URL"; then
      log "Servicio activo y comprobacion HTTP satisfactoria: $HEALTH_URL"
      return 0
    fi
    if (( i < HEALTH_REINTENTOS )); then
      log "Esperando arranque ($i/$HEALTH_REINTENTOS)..."
      sleep "$HEALTH_INTERVALO"
    fi
  done
  return 1
}

# ROOT instala y compila. Se otorga acceso por grupo SOLO a los
# artefactos del runtime. No hay chmod -R a+rX sobre todo el proyecto.
preparar_permisos_runtime() {
  log "Preparando permisos para $RUNTIME_USER..."
  [[ -d node_modules && -d .next ]] || { err "Faltan node_modules o .next"; return 1; }
  
  # Permitir atravesar el directorio del proyecto sin cambiar propietario.
  chgrp "$RUNTIME_GROUP" "$APP_DIR" || return 1
  chmod g+rx "$APP_DIR" || return 1

  # npm start necesita leer package.json ANTES de invocar Next.js.
  # npm ci / git checkout pueden regenerarlo con umask 077.
  chgrp "$RUNTIME_GROUP" package.json || return 1
  chmod 640 package.json || return 1

  chgrp -R "$RUNTIME_GROUP" node_modules .next || return 1
  chmod -R g+rX node_modules .next || return 1
  # Next puede requerir escribir en cache de imagenes durante el runtime.
  mkdir -p .next/cache || return 1
  chgrp -R "$RUNTIME_GROUP" .next/cache || return 1
  chmod -R g+rwX .next/cache || return 1
  # Asegurar herencia de grupo para directorios de cache creados en runtime.
  find .next/cache -type d -exec chmod g+s {} + || return 1

  # Recursos estaticos de la app (si existen).
  if [[ -d public ]]; then
    chgrp -R "$RUNTIME_GROUP" public || return 1
    chmod -R g+rX public || return 1
  fi

  # Prisma generado puede importarse en runtime fuera de node_modules.
  if [[ -d src/generated/prisma ]]; then
    chgrp -R "$RUNTIME_GROUP" src/generated/prisma || return 1
    chmod -R g+rX src/generated/prisma || return 1
    chmod g+rx src src/generated || return 1
  fi

  # Next carga .env.local durante el runtime (si existe).
  if [[ -f .env.local ]]; then
    chgrp "$RUNTIME_GROUP" .env.local || return 1
    chmod 640 .env.local || return 1
  fi

  # Preflight con el mismo npm que usa ExecStart de systemd.
  if ! runuser -u "$RUNTIME_USER" -- npm --prefix "$APP_DIR" pkg get version >/dev/null; then
    err "El usuario $RUNTIME_USER no puede leer package.json mediante npm"
    return 1
  fi
  if ! runuser -u "$RUNTIME_USER" -- "$APP_DIR/node_modules/.bin/next" --version; then
    err "El usuario $RUNTIME_USER no puede ejecutar Next.js"
    return 1
  fi
  if [[ -f .next/BUILD_ID ]] && ! runuser -u "$RUNTIME_USER" -- test -r "$APP_DIR/.next/BUILD_ID"; then
    err "El usuario $RUNTIME_USER no puede leer el build"
    return 1
  fi
}


# Los archivos de storage son datos persistentes: nunca borrarlos ni
# incorporarlos a una limpieza del build. El servicio aniei debe poder escribir.
preparar_storage() {
  log "Comprobando almacenamiento persistente para $RUNTIME_USER..."

  # No cambiar permisos de una ruta externa si alguien sustituyo storage
  # o constancias por un enlace simbolico.
  if [[ -L "$STORAGE_DIR" || -L "$STORAGE_DIR/constancias" ]]; then
    err "storage o storage/constancias es un enlace simbolico; revisar manualmente"
    return 1
  fi

  mkdir -p -- "$STORAGE_DIR/constancias" || return 1
  chown -R -- "$RUNTIME_USER:$RUNTIME_GROUP" "$STORAGE_DIR" || return 1
  chmod -R u+rwX,go-rwx -- "$STORAGE_DIR" || return 1

  # Verificar escritura real con el mismo usuario que ejecuta systemd.
  if ! runuser -u "$RUNTIME_USER" -- sh -c \
      'test -d "$1" && test -w "$1" && test -w "$2"' \
      sh "$STORAGE_DIR" "$STORAGE_DIR/constancias"; then
    err "$RUNTIME_USER no puede escribir en storage/constancias"
    return 1
  fi
  log "Storage listo; archivos existentes conservados."
}

restaurar_anterior() {
  err "Intentando restaurar $PREV_SHA..."
  systemctl stop "$SERVICE" || return 1
  git_app reset --hard "$PREV_SHA" || return 1
  log "Rollback: reinstalando dependencias..."
  npm ci || return 1
  npx --no-install prisma generate || return 1
  rm -rf -- .next
  log "Rollback: compilando..."
  npm run build || return 1
  preparar_permisos_runtime || return 1
  preparar_storage || return 1

  if (( SERVICIO_ANTES_ACTIVO == 1 )); then
    systemctl daemon-reload || return 1
    systemctl start "$SERVICE" || { mostrar_diagnostico; return 1; }
    verificar_salud || { mostrar_diagnostico; return 1; }
    log "Version anterior recuperada y HTTP comprobado."
  else
    log "Version anterior reconstruida. Servicio originalmente inactivo: se deja detenido."
  fi
}

al_salir() {
  local codigo="$1"
  trap - EXIT INT TERM
  (( codigo != 0 )) || return 0
  set +e
  err "Actualizacion fallida en: $ETAPA (codigo $codigo). Log: $LOG_FILE"
  if (( DESPLIEGUE_INICIADO == 1 )); then
    (( MIGRACIONES_INICIADAS == 0 )) || err "AVISO: Git rollback NO revierte migraciones de BD."
    if restaurar_anterior; then
      err "Actualizacion abortada. Rollback completado."
    else
      err "ROLLBACK INCOMPLETO: requiere intervencion manual; consulta el log."
    fi
  else
    err "No se inicio el despliegue; codigo instalado intacto."
  fi
  exit "$codigo"
}
trap 'al_salir "$?"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

ejecutar() {
  ETAPA="$1"
  shift
  log "$ETAPA..."
  "$@"
}

for cmd in git npm npx systemctl curl flock tee runuser chgrp chmod chown mkdir find; do
  command -v "$cmd" >/dev/null || fail "Falta comando: $cmd"
done
id "$RUNTIME_USER" >/dev/null 2>&1 || fail "No existe usuario $RUNTIME_USER"
getent group "$RUNTIME_GROUP" >/dev/null || fail "No existe grupo $RUNTIME_GROUP"

exec 9>"$LOCK_FILE"
flock -n 9 || fail "Ya existe otra actualizacion en curso"
cd "$APP_DIR" || fail "No existe $APP_DIR"
[[ "$(git_app rev-parse --is-inside-work-tree)" == true ]] || fail "No es repositorio Git"
[[ -z "$(git_app status --porcelain)" ]] || fail "Existen cambios locales sin commitear"
[[ -f package-lock.json ]] || fail "No existe package-lock.json"

log "Iniciando actualizacion. Log: $LOG_FILE"
ejecutar "Consultando $REMOTO/$RAMA" git_app fetch "$REMOTO" "$RAMA"
PREV_SHA="$(git_app rev-parse HEAD)"
OBJETIVO_SHA="$(git_app rev-parse "$REMOTO/$RAMA")"
if [[ "$PREV_SHA" == "$OBJETIVO_SHA" && "$FORZAR" -eq 0 ]]; then
  log "Sin cambios ($PREV_SHA). Usa --force para reconstruir."
  exit 0
fi
if [[ "$PREV_SHA" != "$OBJETIVO_SHA" ]] && ! git_app merge-base --is-ancestor "$PREV_SHA" "$OBJETIVO_SHA"; then
  fail "No hay fast-forward; cancelado sin detener servicio"
fi
log "Commit anterior: $PREV_SHA"
log "Commit nuevo: $OBJETIVO_SHA"
git_app log --oneline "HEAD..$REMOTO/$RAMA"
git_app diff --stat "HEAD..$REMOTO/$RAMA"
log "Estado del servicio: $(systemctl is-active "$SERVICE" || true)"

if (( CONFIRMADO == 0 )); then
  read -r -p "¿Actualizar ahora? [s/N] " respuesta || respuesta=""
  [[ "$respuesta" =~ ^[sS]([iI])?$ ]] || { log "Cancelado"; exit 0; }
fi
if systemctl is-active --quiet "$SERVICE"; then
  SERVICIO_ANTES_ACTIVO=1
fi

# Reparar/verificar storage antes de tocar el servicio activo.
ejecutar "Preparando storage persistente" preparar_storage

# Se detiene la aplicacion SOLO despues de validar Git y confirmacion.
DESPLIEGUE_INICIADO=1
ejecutar "Deteniendo $SERVICE" systemctl stop "$SERVICE"
ejecutar "Actualizando Git" git_app merge --ff-only "$OBJETIVO_SHA"
if [[ -f .env.local ]]; then
  ETAPA="Cargando variables de entorno"
  cargar_env_local .env.local
fi
ejecutar "Instalando dependencias" npm ci
ejecutar "Generando Prisma" npx --no-install prisma generate
ETAPA="Limpiando tipos anteriores"
rm -rf -- .next/types
ejecutar "Verificando TypeScript" npx --no-install tsc --noEmit
ejecutar "Ejecutando lint" npm run lint
MIGRACIONES_INICIADAS=1
ejecutar "Aplicando migraciones" npx --no-install prisma migrate deploy
ejecutar "Compilando Next.js" npm run build
if (( EJECUTAR_TEST_FLOWS == 1 )) && [[ -f scripts/verificar-flujos.mjs ]]; then
  ejecutar "Ejecutando pruebas de flujos" npm run test:flows
fi
ejecutar "Preparando permisos" preparar_permisos_runtime
ejecutar "Verificando storage persistente" preparar_storage
ejecutar "Recargando systemd" systemctl daemon-reload
ejecutar "Arrancando $SERVICE" systemctl start "$SERVICE"
ETAPA="Verificando disponibilidad HTTP"
if ! verificar_salud; then
  mostrar_diagnostico
  fail "Servicio no respondio correctamente"
fi
DESPLIEGUE_INICIADO=0
log "Actualizacion finalizada. Commit $(git_app rev-parse --short HEAD)"
log "Servicio: $(systemctl is-active "$SERVICE")"
log "Registro: $LOG_FILE"
