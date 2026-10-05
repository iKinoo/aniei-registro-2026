import type { AlertaErrorData, IAlertaErrorService } from '@/application/ports/IAlertaErrorService';
import { AlertaErrorServiceDeshabilitado } from '@/infrastructure/services/email/AlertaErrorServiceDeshabilitado';
import { NodemailerAlertaErrorService } from '@/infrastructure/services/email/NodemailerAlertaErrorService';
import { ThrottleAlertaErrorService } from '@/infrastructure/services/email/ThrottleAlertaErrorService';

let instancia: IAlertaErrorService | null = null;

export function getAlertaErrorService(): IAlertaErrorService {
  if (instancia) return instancia;
  const user = process.env.ALERTA_EMAIL_USER;
  const pass = process.env.ALERTA_EMAIL_APP_PASSWORD;
  const destinatarios = (process.env.ALERTA_EMAIL_TO ?? '')
    .split(',')
    .map((destino) => destino.trim())
    .filter(Boolean);
  if (process.env.NODE_ENV !== 'production' || !user || !pass || destinatarios.length === 0) {
    instancia = new AlertaErrorServiceDeshabilitado();
    return instancia;
  }
  const from = process.env.ALERTA_EMAIL_FROM || user;
  const ventanaSegundos = Number(process.env.ALERTA_ERROR_WINDOW_SECONDS ?? '300') || 300;
  instancia = new ThrottleAlertaErrorService(
    new NodemailerAlertaErrorService(user, pass, from, destinatarios),
    ventanaSegundos * 1000,
  );
  return instancia;
}

export function reportarErrorEnAccion(
  contexto: string,
  error: unknown,
  extra?: { folio?: string; ruta?: string; codigo?: string },
): void {
  console.error(`${contexto}:`, error);
  const mensaje = error instanceof Error ? error.message : String(error);
  const datos: AlertaErrorData = {
    contexto,
    mensaje: mensaje.slice(0, 500),
    stack: error instanceof Error ? error.stack : undefined,
    origen: 'accion',
    entorno: process.env.NODE_ENV ?? 'desconocido',
    timestamp: new Date().toISOString(),
    folio: extra?.folio,
    ruta: extra?.ruta,
    codigo: extra?.codigo,
  };
  getAlertaErrorService()
    .notificarError(datos)
    .catch((errorAlerta: unknown) => console.error('No se pudo enviar la alerta de error:', errorAlerta));
}
