import nodemailer from 'nodemailer';
import { IEmailService, ConfirmacionData, ConfirmacionActividadesData, NotificacionPonenteData, ConfirmacionGrupoRapidoData } from '@/application/ports/IEmailService';
import { renderConfirmacionHTML } from './templates/confirmacion';
import { renderConstanciaEmailHTML } from './templates/constancia';
import { renderConfirmacionActividadesHTML } from './templates/confirmacion-actividades';
import { renderNotificacionPonenteHTML } from './templates/notificacion-ponente';

export class NodemailerEmailService implements IEmailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(user: string, pass: string, from: string) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
    this.from = from;
  }

  async enviarConfirmacionRegistro(destinatario: string, datos: ConfirmacionData): Promise<void> {
    const html = renderConfirmacionHTML(datos);

    await this.transporter.sendMail({
      from: this.from,
      to: destinatario,
      subject: `Registro Confirmado — ANIEI 2026 (Folio: ${datos.folio})`,
      html,
    });
  }

  async enviarConstancia(destinatario: string, pdfBuffer: Buffer, folio: string): Promise<void> {
    const html = renderConstanciaEmailHTML({
      nombre: '',
      apellido: '',
      folio,
    });

    await this.transporter.sendMail({
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
  }

  async enviarConfirmacionActividades(destinatario: string, datos: ConfirmacionActividadesData): Promise<void> {
    const html = renderConfirmacionActividadesHTML(datos);

    await this.transporter.sendMail({
      from: this.from,
      to: destinatario,
      subject: `Inscripción a Actividades Confirmada — ANIEI 2026 (Folio: ${datos.folio})`,
      html,
    });
  }

  async enviarNotificacionPonente(destinatario: string, datos: NotificacionPonenteData): Promise<void> {
    const html = renderNotificacionPonenteHTML(datos);

    await this.transporter.sendMail({
      from: this.from,
      to: destinatario,
      subject: `Has sido registrado como Ponente — ANIEI 2026`,
      html,
    });
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

    await this.transporter.sendMail({
      from: this.from,
      to: destinatario,
      subject: `Constancia de Participación - ${nombreActividad}`,
      html,
      attachments: [{
        filename: `constancia-ponente-${nombrePonente.trim().replace(/\\s+/g, '-')}.pdf`,
        content: pdfBuffer,
      }],
    });
  }

  async enviarConstanciaParticipante(
    destinatario: string,
    pdfBuffer: Buffer,
    nombreParticipante: string,
    nombreActividad: string
  ): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #eee; padding-bottom: 10px;">Constancia de Participación</h2>
        <p>Estimado(a) <strong>${nombreParticipante}</strong>,</p>
        <p>El Comité Organizador del Congreso Nacional ANIEI 2026 le agradece haber participado en la actividad <strong>"${nombreActividad}"</strong>.</p>
        <p>Adjunto a este correo encontrará su constancia digital de participación.</p>
        <br/>
        <p>Atentamente,<br/><strong>El Comité Organizador ANIEI 2026</strong></p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: destinatario,
      subject: `Constancia de Participación - ${nombreActividad}`,
      html,
      attachments: [{
        filename: `constancia-participante-${nombreParticipante.trim().replace(/\\s+/g, '-')}.pdf`,
        content: pdfBuffer,
      }],
    });
  }

  async enviarConfirmacionGrupoRapido(
    destinatario: string,
    datos: ConfirmacionGrupoRapidoData,
  ): Promise<void> {
    const html = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2b6cb0;">Confirmación de Registro Grupal - ANIEI 2026</h2>
        <p>Hola <strong>${datos.nombreResponsable} ${datos.apellidoResponsable}</strong>,</p>
        <p>Tu registro grupal ha sido procesado con éxito. Se han registrado <strong>${datos.totalMiembros}</strong> miembros.</p>
        <br/>
        <p>Cada miembro ha recibido un correo electrónico con sus credenciales de acceso (folio y contraseña) para ingresar al sistema.</p>
        <br/>
        <p>¡Gracias por sumarte al Congreso de la ANIEI 2026!</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.from,
      to: destinatario,
      subject: `Confirmación de Registro Grupal Rápido — ANIEI 2026`,
      html,
    });
  }
}
