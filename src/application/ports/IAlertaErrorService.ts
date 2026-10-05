export type OrigenAlerta = 'accion' | 'framework';

export interface AlertaErrorData {
  contexto: string;
  mensaje: string;
  stack?: string;
  origen: OrigenAlerta;
  entorno: string;
  timestamp: string;
  folio?: string;
  ruta?: string;
  codigo?: string;
  cantidadAcumulada?: number;
}

export interface IAlertaErrorService {
  notificarError(datos: AlertaErrorData): Promise<void>;
}
