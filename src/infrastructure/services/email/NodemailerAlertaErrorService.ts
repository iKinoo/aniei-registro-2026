import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { AlertaErrorData, IAlertaErrorService } from '@/application/ports/IAlertaErrorService';
import { renderAlertaErrorHTML } from './templates/alerta-error';

export class NodemailerAlertaErrorService implements IAlertaErrorService {
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly destinatarios: string[];

  constructor(user: string, pass: string, from: string, destinatarios: string[]) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    this.from = from;
    this.destinatarios = destinatarios;
  }

  async notificarError(datos: AlertaErrorData): Promise<void> {
    const resumen = datos.cantidadAcumulada ? ` (+${datos.cantidadAcumulada} acum.)` : '';
    await this.transporter.sendMail({
      from: this.from,
      to: this.destinatarios.join(', '),
      subject: `[ERROR ANIEI 2026]${resumen} ${datos.contexto} — ${datos.mensaje.slice(0, 80)}`,
      html: renderAlertaErrorHTML(datos),
    });
  }
}
