import { Resend } from 'resend';
import { IEmailService, ConfirmacionData, ConfirmacionActividadesData, NotificacionPonenteData } from '@/application/ports/IEmailService';
import { renderConfirmacionHTML } from './templates/confirmacion';
import { renderConstanciaEmailHTML } from './templates/constancia';
import { renderConfirmacionActividadesHTML } from './templates/confirmacion-actividades';
import { renderNotificacionPonenteHTML } from './templates/notificacion-ponente';

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
  async enviarConfirmacionActividades(destinatario: string, datos: ConfirmacionActividadesData): Promise<void> {
    const html = renderConfirmacionActividadesHTML(datos);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: destinatario,
      subject: `Inscripción a Actividades Confirmada — ANIEI 2026 (Folio: ${datos.folio})`,
      html,
    });

    if (error) {
      throw new Error(`Error al enviar correo de actividades: ${error.message}`);
    }
  }

  async enviarNotificacionPonente(destinatario: string, datos: NotificacionPonenteData): Promise<void> {
    const html = renderNotificacionPonenteHTML(datos);

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: destinatario,
      subject: `Has sido registrado como Ponente — ANIEI 2026`,
      html,
    });

    if (error) {
      throw new Error(`Error al enviar notificación a ponente: ${error.message}`);
    }
  }
}
