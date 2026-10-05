import type { AlertaErrorData, IAlertaErrorService } from '@/application/ports/IAlertaErrorService';

interface Ventana {
  primera: AlertaErrorData;
  acumuladas: number;
}

export class ThrottleAlertaErrorService implements IAlertaErrorService {
  private readonly ventanas = new Map<string, Ventana>();

  constructor(
    private readonly destino: IAlertaErrorService,
    private readonly ventanaMs: number,
  ) {}

  async notificarError(datos: AlertaErrorData): Promise<void> {
    const clave = `${datos.contexto}|${datos.mensaje}`;
    const existente = this.ventanas.get(clave);
    if (existente) {
      existente.acumuladas += 1;
      return;
    }
    this.ventanas.set(clave, { primera: datos, acumuladas: 0 });
    setTimeout(() => this.cerrarVentana(clave), this.ventanaMs);
    await this.enviar(datos);
  }

  private cerrarVentana(clave: string): void {
    const ventana = this.ventanas.get(clave);
    if (!ventana) return;
    this.ventanas.delete(clave);
    if (ventana.acumuladas > 0) {
      void this.enviar({
        ...ventana.primera,
        timestamp: new Date().toISOString(),
        cantidadAcumulada: ventana.acumuladas,
      });
    }
  }

  private async enviar(datos: AlertaErrorData): Promise<void> {
    try {
      await this.destino.notificarError(datos);
    } catch (error) {
      console.error('No se pudo enviar la alerta de error por correo:', error);
    }
  }
}
