import type { NotificacionIndividualData } from './NotificacionRegistro';

export interface ResultadoRegistro {
  success: boolean;
  folio: string;
  urlConstancia: string;
  correo: string;
  passwordPlana: string;
  notificacion: NotificacionIndividualData;
}
