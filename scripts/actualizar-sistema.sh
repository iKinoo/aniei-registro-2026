#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Actualización del Sistema de Registro ANIEI 2026
# Uso: sudo bash scripts/actualizar-sistema.sh [--yes]
#   --yes  : no preguntar confirmación (modo no interactivo)
# ============================================================

APP_DIR="/opt/aniei-registro-2026"
SERVICE="aniei"
RAMA="main"
REMOTO="origin"
EJECUTAR_TEST_FLOWS=1   # 1 = correr npm run test:flows tras el build

log()  { printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
err()  { printf '[%s] ERROR: %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*" >&2; }
fail() { err "$*"; exit 1; }

CONFIRMACION_PREVIAS=0
[[ "${1:-}" == "--yes" ]] && CONFIRMACION_PREVIAS=1

# ---------- Precondiciones ----------
command -v git   >/dev/null || fail "git no está instalado"
command -v npm   >/dev/null || fail "npm no está instalado"
command -v systemctl >/dev/null || fail "systemctl no disponible (ejecutar en el servidor)"

cd "$APP_DIR" || fail "No existe el directorio $APP_DIR"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "$APP_DIR no es un repositorio git"

if [[ -n "$(git status --porcelain)" ]]; then
  fail "Hay cambios sin commitear en $APP_DIR. Commitéalos o descártalos antes de actualizar."
fi

# ---------- Detectar cambios remotos ----------
log "Consultando $REMOTO/$RAMA..."
git fetch "$REMOTO" "$RAMA"

LOCAL_SHA="$(git rev-parse HEAD)"
REMOTO_SHA="$(git rev-parse "$REMOTO/$RAMA")"

if [[ "$LOCAL_SHA" == "$REMOTO_SHA" ]]; then
  log "Sin cambios: $APP_DIR ya está en $REMOTO/$RAMA ($LOCAL_SHA). No se hace nada."
  exit 0
fi

log "Hay cambios pendientes:"
git log --oneline "HEAD..$REMOTO/$RAMA"
echo
git diff --stat "HEAD..$REMOTO/$RAMA"
echo
log "Servicio actual: $(systemctl is-active "$SERVICE" || true)"

# ---------- Confirmación ----------
if [[ $CONFIRMACION_PREVIAS -eq 0 ]]; then
  read -r -p "¿Actualizar el sistema ahora? [s/N] " respuesta
  [[ "$respuesta" =~ ^[sS](i)?$ ]] || { log "Actualización cancelada por el usuario."; exit 0; }
fi

PREV_SHA="$LOCAL_SHA"

rollback() {
  err "Validación fallida. Revertiendo código a $PREV_SHA..."
  git reset --hard "$PREV_SHA" >/dev/null
  log "Reconstruyendo versión anterior..."
  if npm run build; then
    log "Intentando reiniciar el servicio con la versión previa..."
    systemctl start "$SERVICE" || err "No se pudo arrancar $SERVICE. Revisar: systemctl status $SERVICE"
  else
    err "El build de la versión anterior también falló. DEJAR el servicio detenido y revisar manualmente."
  fi
  fail "Actualización abortada. Sistema revertido a $PREV_SHA."
}

# ---------- Detener servicio ----------
log "Deteniendo servicio $SERVICE..."
systemctl stop "$SERVICE"
sleep 2

# ---------- Pull ----------
log "git pull $REMOTO $RAMA..."
if ! git pull --ff-only "$REMOTO" "$RAMA"; then
  systemctl start "$SERVICE" || true
  fail "git pull falló (¿historial divergente?). Servicio rearrancado con la versión anterior."
fi
log "Actualizado a $(git rev-parse --short HEAD)"

# ---------- Cargar variables de entorno para Prisma CLI ----------
if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
fi

# ---------- Validaciones ----------
log "Instalando dependencias (npm ci)..."
npm ci || rollback

log "Generando cliente Prisma..."
npx prisma generate || rollback

log "Typecheck (tsc --noEmit)..."
npx tsc --noEmit || rollback

log "Lint + control de arquitectura..."
npm run lint || rollback

log "Aplicando migraciones de BD..."
npx prisma migrate deploy || rollback

log "Build de producción..."
npm run build || rollback

if [[ $EJECUTAR_TEST_FLOWS -eq 1 && -f scripts/verificar-flujos.mjs ]]; then
  log "Regresiones de flujos (npm run test:flows)..."
  npm run test:flows || rollback
fi

# ---------- Reiniciar servicio ----------
log "Arrancando servicio $SERVICE..."
systemctl daemon-reload
if ! systemctl start "$SERVICE"; then
  fail "El servicio no arrancó. Revisar: journalctl -u $SERVICE -n 50"
fi

sleep 3
ESTADO="$(systemctl is-active "$SERVICE" || true)"
if [[ "$ESTADO" != "active" ]]; then
  fail "Servicio en estado '$ESTADO'. Revisar: systemctl status $SERVICE --no-pager"
fi

log "Actualización completada con éxito."
log "Commit activo: $(git log -1 --oneline)"
log "Servicio $SERVICE: $ESTADO"
