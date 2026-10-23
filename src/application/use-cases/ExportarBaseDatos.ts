import type { ExportacionBaseDatosDTO } from '../dtos/ExportacionBaseDatosDTO';
import type { CancelacionExportacion, IExportacionBaseDatosService } from '../ports/IExportacionBaseDatosService';

export class ExportarBaseDatos {
  constructor(private readonly servicio: IExportacionBaseDatosService) {}

  async ejecutar(cancelacion: CancelacionExportacion): Promise<ExportacionBaseDatosDTO> {
    return this.servicio.exportar(cancelacion);
  }
}
