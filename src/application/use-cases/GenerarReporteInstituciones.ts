import type { IRegistroQueryService } from '../ports/IRegistroQueryService';
import type { IPdfService } from '../ports/IPdfService';

export class GenerarReporteInstituciones {
  constructor(private readonly consultas: IRegistroQueryService, private readonly pdf: IPdfService) {}

  async obtener() {
    const data = await this.consultas.obtenerReporteInstituciones();
    return { data, totalParticipantes: data.reduce((sum, d) => sum + d.totalParticipantes, 0) };
  }

  async generar(): Promise<Uint8Array> {
    const { data, totalParticipantes } = await this.obtener();
    return this.pdf.generarReporteInstituciones({ totalInstituciones: data.length, totalParticipantes,
      instituciones: data.map((i, index) => ({ numero: index + 1,
        nombre: i.abreviatura ? `${i.abreviatura} - ${i.nombre}` : i.nombre, totalParticipantes: i.totalParticipantes })),
    });
  }
}
