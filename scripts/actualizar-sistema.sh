
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

for cmd in git npm npx systemctl curl flock tee runuser chgrp chmod; do
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
