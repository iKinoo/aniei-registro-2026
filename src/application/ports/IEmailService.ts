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

export interface IEmailService {
  enviarConfirmacionRegistro(destinatario: string, datos: ConfirmacionData): Promise<void>;
  enviarConstancia(destinatario: string, pdfBuffer: Buffer, folio: string): Promise<void>;
  enviarConfirmacionActividades(destinatario: string, datos: ConfirmacionActividadesData): Promise<void>;
}
