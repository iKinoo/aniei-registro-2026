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

  async enviarConstanciaPonente(
    destinatario: string,
    pdfBuffer: Buffer,
    nombrePonente: string,
    nombreActividad: string
  ): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #eee; padding-bottom: 10px;">Constancia de Participación</h2>
        <p>Estimado(a) <strong>${nombrePonente}</strong>,</p>
        <p>El Comité Organizador del Congreso Nacional ANIEI 2026 le agradece enormemente su tiempo y dedicación en la impartición de la actividad <strong>"${nombreActividad}"</strong>.</p>
        <p>Adjunto a este correo encontrará su constancia digital de participación.</p>
        <br/>
        <p>Atentamente,<br/><strong>El Comité Organizador ANIEI 2026</strong></p>
      </div>
    `;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: destinatario,
      subject: `Constancia de Participación - ${nombreActividad}`,
      html,
      attachments: [{
        filename: `constancia-ponente-${nombrePonente.trim().replace(/\\s+/g, '-')}.pdf`,
        content: pdfBuffer,
      }],
    });

    if (error) {
      throw new Error(`Error al enviar constancia de ponente: ${error.message}`);
    }
  }
}
