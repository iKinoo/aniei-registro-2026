export interface ConfirmacionData {
  nombre: string;
  apellido: string;
  folio: string;
  institucion: string;
  fecha: string;
  password?: string;
}

export interface ConfirmacionActividadesData {
  nombre: string;
  apellido: string;
  folio: string;
  actividades: Array<{ nombre: string; fecha: string; costo: string | null }>;
  totalCosto: string | null;
  fecha: string;
}

export interface NotificacionPonenteData {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  nombreActividad: string;
  rol: string;
}

export interface ConfirmacionGrupoRapidoData {
  nombreResponsable: string;
  apellidoResponsable: string;
  token: string;
  totalMiembros: number;
}

export interface IEmailService {
  enviarConfirmacionRegistro(destinatario: string, datos: ConfirmacionData): Promise<void>;
  enviarConstancia(destinatario: string, pdfBuffer: Buffer, folio: string): Promise<void>;
  enviarConfirmacionActividades(destinatario: string, datos: ConfirmacionActividadesData): Promise<void>;
  enviarNotificacionPonente(destinatario: string, datos: NotificacionPonenteData): Promise<void>;
  enviarConstanciaPonente(destinatario: string, pdfBuffer: Buffer, nombrePonente: string, nombreActividad: string): Promise<void>;
  enviarConstanciaParticipante(destinatario: string, pdfBuffer: Buffer, nombreParticipante: string, nombreActividad: string): Promise<void>;
  enviarConfirmacionGrupoRapido(destinatario: string, datos: ConfirmacionGrupoRapidoData, pdfBuffer: Buffer): Promise<void>;
}
