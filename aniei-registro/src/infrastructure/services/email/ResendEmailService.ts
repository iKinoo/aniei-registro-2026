import { Resend } from 'resend';
import { IEmailService, ConfirmacionData } from '@/application/ports/IEmailService';
import { renderConfirmacionHTML } from './templates/confirmacion';
import { renderConstanciaEmailHTML } from './templates/constancia';

export class ResendEmailService implements IEmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(apiKey: string, from: string) {
    this.resend = new Resend(apiKey);
    this.from = from;
  }

  async enviarConfirmacionRegistro(destinatario: string, datos: ConfirmacionData): Promise<void> {
    const html = renderConfirmacionHTML(datos);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: destinatario,
      subject: `Registro Confirmado — ANIEI 2026 (Folio: ${datos.folio})`,
      html,
    });

    if (error) {
      throw new Error(`Error al enviar correo de confirmación: ${error.message}`);
    }
  }

  async enviarConstancia(destinatario: string, pdfBuffer: Buffer, folio: string): Promise<void> {
    const html = renderConstanciaEmailHTML({
      nombre: '',
      apellido: '',
      folio,
    });

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: destinatario,
      subject: `Constancia de Inscripción — ANIEI 2026 (${folio})`,
      html,
      attachments: [
        {
          filename: `constancia-${folio}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) {
      throw new Error(`Error al enviar constancia: ${error.message}`);
    }
  }
}
