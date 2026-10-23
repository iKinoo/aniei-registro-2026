import type { ExportacionBaseDatosDTO } from '@/application/dtos/ExportacionBaseDatosDTO';

export interface CancelacionExportacion {
  estaCancelada(): boolean;
  alCancelar(callback: () => void): void;
}

export interface IExportacionBaseDatosService {
  exportar(cancelacion: CancelacionExportacion): Promise<ExportacionBaseDatosDTO>;
}
