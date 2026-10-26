#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Actualizacion del Sistema de Registro ANIEI 2026
# Uso: sudo bash scripts/actualizar-sistema.sh [--yes] [--force]
#   --yes   : omitir confirmacion interactiva
#   --force : reconstruir aunque no haya commits nuevos
#
# Incluye: logs persistentes, bloqueo de ejecuciones paralelas,
# rollback de codigo + dependencias + build y health check HTTP.
# IMPORTANTE: el rollback NO revierte migraciones de base de datos.
# ============================================================

APP_DIR="/opt/aniei-registro-2026"
SERVICE="aniei"
RAMA="main"
REMOTO="origin"
EJECUTAR_TEST_FLOWS=1

LOG_DIR="/var/log/aniei"
LOCK_FILE="/run/lock/aniei-actualizacion.lock"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:3000/}"
HEALTH_REINTENTOS=15
HEALTH_INTERVALO=2

log() { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
err() { printf '[%s] ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2; }
fail() { err "$*"; exit 1; }

CONFIRMACION_PREVIAS=0
FORZAR=0
ETAPA="Preparacion"
PREV_SHA=""
OBJETIVO_SHA=""
DESPLIEGUE_INICIADO=0
SERVICIO_ORIGINAL_ACTIVO=0
MIGRACIONES_INICIADAS=0

for arg in "$@"; do
  case "$arg" in
    --yes|-y) CONFIRMACION_PREVIAS=1 ;;
    --force|-f) FORZAR=1 ;;
    *) fail "Argumento desconocido: $arg (usa --yes y/o --force)" ;;
  esac
done

(( EUID == 0 )) || fail "Ejecuta este script con sudo."
umask 077
mkdir -p -- "$LOG_DIR"
LOG_FILE="$LOG_DIR/actualizacion-$(date '+%Y%m%d-%H%M%S')-$$.log"
touch -- "$LOG_FILE"
exec > >(tee -a "$LOG_FILE") 2>&1

# Solo acepta CLAVE=valor simples; no evalua codigo shell del .env.local.
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
    if [[ "$valor" =~ ^\"(.*)\"$ || "$valor" =~ ^\'(.*)\'$ ]]; then
      valor="${valor:1:${#valor}-2}"
    fi
    export "$clave=$valor"
  done < "$archivo"
}

mostrar_diagnostico_servicio() {
  err "Diagnostico de systemd ($SERVICE):"
  systemctl status "$SERVICE" --no-pager --full || true
  journalctl -u "$SERVICE" -n 60 --no-pager -o short-iso || true
}

verificar_salud() {
  local intento
  for ((intento=1; intento<=HEALTH_REINTENTOS; intento++)); do
    if systemctl is-active --quiet "$SERVICE" &&
       curl --fail --silent --show-error --location --max-redirs 5 \
         --max-time 5 --output /dev/null "$HEALTH_URL"; then
      log "Servicio activo y HTTP correcto en $HEALTH_URL"
      return 0
    fi
    if (( intento < HEALTH_REINTENTOS )); then
      log "Health check pendiente ($intento/$HEALTH_REINTENTOS)..."
      sleep "$HEALTH_INTERVALO"
    fi
  done
  return 1
}

restaurar_version_anterior() {
  err "Iniciando rollback hacia $PREV_SHA..."

  if ! systemctl stop "$SERVICE"; then
    err "No fue posible detener $SERVICE durante el rollback. Revisar manualmente."
    mostrar_diagnostico_servicio
    return 1
  fi
  if ! git reset --hard "$PREV_SHA"; then
    err "No fue posible restaurar Git al commit previo."
    return 1
  fi

  log "Rollback: restaurando dependencias de la version anterior..."
  if ! npm ci; then
    err "Rollback incompleto: npm ci de la version anterior fallo."
    return 1
  fi
  if ! npx prisma generate; then
    err "Rollback incompleto: prisma generate fallo."
    return 1
  fi

  log "Rollback: reconstruyendo version anterior..."
  rm -rf -- .next
  if ! npm run build; then
    err "Rollback incompleto: fallo el build de la version anterior."
    return 1
  fi

  if (( SERVICIO_ORIGINAL_ACTIVO == 1 )); then
    if ! systemctl daemon-reload || ! systemctl start "$SERVICE"; then
      err "Rollback incompleto: no se pudo arrancar el servicio anterior."
      mostrar_diagnostico_servicio
      return 1
    fi
    if ! verificar_salud; then
      err "Rollback incompleto: el servicio anterior no paso el health check."
      mostrar_diagnostico_servicio
      return 1
    fi
    log "Rollback confirmado: version anterior operativa ($PREV_SHA)."
  else
    log "Rollback de archivos confirmado; el servicio estaba inactivo antes de actualizar y se deja inactivo."
  fi
  return 0
}

al_salir() {
  local codigo="$1"
  trap - EXIT INT TERM
  (( codigo != 0 )) || return 0
  set +e

  err "Actualizacion fallida en etapa: $ETAPA (codigo de salida: $codigo)."
  err "Registro completo: $LOG_FILE"

  if (( DESPLIEGUE_INICIADO == 1 )); then
    if (( MIGRACIONES_INICIADAS == 1 )); then
      err "ATENCION: se intento aplicar migraciones de Prisma. Git rollback NO revierte la BD."
    fi
    if restaurar_version_anterior; then
      err "Actualizacion abortada. Codigo revertido a $PREV_SHA y estado previo del servicio restaurado."
    else
      err "ROLLBACK INCOMPLETO: se requiere intervencion manual."
      err "Inspecciona el log y el estado del servicio antes de intentar otra actualizacion."
    fi
  else
    err "No se inicio el despliegue; la version instalada no se modifico."
  fi
  exit "$codigo"
}
trap 'al_salir "$?"' EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

ejecutar() {
  local descripcion="$1" codigo=0
  shift
  ETAPA="$descripcion"
  log "$descripcion..."
  "$@" || codigo=$?
  if (( codigo != 0 )); then
    err "Fallo: $descripcion (codigo de salida: $codigo)."
    exit "$codigo"
  fi
}

# ---------- Precondiciones ----------
for comando in git npm npx systemctl curl flock tee; do
  command -v "$comando" >/dev/null || fail "$comando no esta instalado."
done

exec 9>"$LOCK_FILE"
flock -n 9 || fail "Ya hay otra actualizacion ejecutandose."

cd "$APP_DIR" || fail "No existe el directorio $APP_DIR"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "$APP_DIR no es un repositorio Git"
[[ -z "$(git status --porcelain)" ]] || fail "Existen cambios sin commitear en $APP_DIR."

log "Iniciando actualizacion. Log: $LOG_FILE"

ejecutar "Consulta de cambios remotos" git fetch "$REMOTO" "$RAMA"
PREV_SHA="$(git rev-parse HEAD)"
OBJETIVO_SHA="$(git rev-parse "$REMOTO/$RAMA")"

if [[ "$PREV_SHA" == "$OBJETIVO_SHA" && $FORZAR -eq 0 ]]; then
  log "Sin cambios: ya se encuentra en $REMOTO/$RAMA ($PREV_SHA)."
  log "Utiliza --force para forzar una reconstruccion."
  exit 0
fi

if [[ "$PREV_SHA" != "$OBJETIVO_SHA" ]] &&
   ! git merge-base --is-ancestor "$PREV_SHA" "$OBJETIVO_SHA"; then
  fail "No es posible fast-forward de $PREV_SHA a $OBJETIVO_SHA. Se cancela sin detener el servicio."
fi

log "Commit actual: $PREV_SHA"
log "Commit objetivo: $OBJETIVO_SHA"
git log --oneline "HEAD..$REMOTO/$RAMA"
git diff --stat "HEAD..$REMOTO/$RAMA"
log "Servicio actual: $(systemctl is-active "$SERVICE" || true)"

if (( CONFIRMACION_PREVIAS == 0 )); then
  read -r -p "¿Actualizar el sistema ahora? [s/N] " respuesta || respuesta=""
  [[ "$respuesta" =~ ^[sS]([iI])?$ ]] || { log "Actualizacion cancelada."; exit 0; }
fi

if systemctl is-active --quiet "$SERVICE"; then
  SERVICIO_ORIGINAL_ACTIVO=1
fi

# A partir de aqui, una salida con error dispara rollback mediante EXIT.
DESPLIEGUE_INICIADO=1
ejecutar "Detencion del servicio" systemctl stop "$SERVICE"
ejecutar "Actualizacion de codigo (fast-forward)" git merge --ff-only "$OBJETIVO_SHA"
log "Repositorio actualizado a $(git rev-parse --short HEAD)"

ETAPA="Carga de variables de entorno"
if [[ -f .env.local ]]; then
  cargar_env_local .env.local
fi

ejecutar "Instalacion de dependencias (npm ci)" npm ci
ejecutar "Generacion del cliente Prisma" npx prisma generate
ETAPA="Limpieza de tipos de Next.js"
rm -rf -- .next/types
ejecutar "Typecheck" npx tsc --noEmit
ejecutar "Lint y arquitectura" npm run lint

MIGRACIONES_INICIADAS=1
ejecutar "Migraciones de BD" npx prisma migrate deploy
ejecutar "Build de produccion" npm run build

if (( EJECUTAR_TEST_FLOWS == 1 )) && [[ -f scripts/verificar-flujos.mjs ]]; then
  ejecutar "Pruebas de regresion" npm run test:flows
fi

ejecutar "Recarga de systemd" systemctl daemon-reload
ETAPA="Arranque del servicio"
log "Arrancando $SERVICE..."
if ! systemctl start "$SERVICE"; then
  err "No se pudo arrancar $SERVICE con la version nueva."
  mostrar_diagnostico_servicio
  exit 1
fi

ETAPA="Verificacion HTTP del servicio"
if ! verificar_salud; then
  err "La nueva version no paso la verificacion de salud ($HEALTH_URL)."
  mostrar_diagnostico_servicio
  exit 1
fi

DESPLIEGUE_INICIADO=0
log "Actualizacion completada correctamente."
log "Commit activo: $(git log -1 --oneline)"
log "Servicio $SERVICE: $(systemctl is-active "$SERVICE")"
log "Registro: $LOG_FILE"
