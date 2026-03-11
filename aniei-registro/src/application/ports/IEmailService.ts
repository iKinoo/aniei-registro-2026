export interface ConfirmacionData {
  nombre: string;
  apellido: string;
  folio: string;
  institucion: string;
  fecha: string;
}

export interface IEmailService {
  enviarConfirmacionRegistro(destinatario: string, datos: ConfirmacionData): Promise<void>;
  enviarConstancia(destinatario: string, pdfBuffer: Buffer, folio: string): Promise<void>;
}
