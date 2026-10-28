import type { IRegistroQueryService } from '../ports/IRegistroQueryService';
import type { IPdfService } from '../ports/IPdfService';
import type { TalleristaReporteItem } from '../dtos/ConsultaRegistroDTO';

export class GenerarReporteTalleristas {
  constructor(private readonly consultas: IRegistroQueryService, private readonly pdf: IPdfService) {}

  async obtener(): Promise<TalleristaReporteItem[]> {
    return this.consultas.obtenerReporteTalleristas();
  }

  async generar(): Promise<Uint8Array> {
    const talleristas = await this.obtener();
    const totalTalleres = new Set(talleristas.map((t) => t.idActividad)).size;
    const totalTalleristas = new Set(talleristas.map((t) => t.folioRegistro)).size;

    return this.pdf.generarReporteTalleristas({
      totalTalleres,
      totalTalleristas,
      talleristas: talleristas.map((t, index) => ({
        numero: index + 1,
        folio: t.folioRegistro,
        nombre: t.nombreTallerista,
        taller: t.nombreTaller,
        modalidad: t.modalidad,
        correo: t.correo,
        ligaOLugar: t.modalidad === 'VIRTUAL'
          ? t.enlaceSesion ?? 'Sin liga'
          : [t.sede, t.sala].filter(Boolean).join(' / ') || 'Por definir',
      })),
    });
  }
}
