import type { IRegistroQueryService } from '../ports/IRegistroQueryService';
import type { HojaExcel, IExcelService } from '../ports/IExcelService';
import type { ParticipanteTallerReporteItem } from '../dtos/ConsultaRegistroDTO';

export class GenerarReporteParticipantesTalleresXls {
  constructor(private readonly consultas: IRegistroQueryService, private readonly excel: IExcelService) {}

  async obtener(): Promise<ParticipanteTallerReporteItem[]> {
    return this.consultas.obtenerReporteParticipantesTalleres();
  }

  async generar(): Promise<Uint8Array> {
    const participantes = await this.obtener();
    const hoja: HojaExcel = {
      nombre: 'Participantes por taller',
      columnas: [
        { titulo: 'Taller', tipo: 'texto', ancho: 44 },
        { titulo: 'Folio del participante', tipo: 'texto', ancho: 20 },
        { titulo: 'Nombre del participante', tipo: 'texto', ancho: 34 },
        { titulo: 'Correo electrónico', tipo: 'texto', ancho: 34 },
        { titulo: 'Asistencia', tipo: 'texto', ancho: 12 },
      ],
      filas: participantes.map((participante) => [
        participante.nombreTaller,
        participante.folioRegistro,
        participante.nombreParticipante,
        participante.correo,
        participante.incluirEnConstancia ? 'Sí' : 'No',
      ]),
    };
    return this.excel.generarHoja(hoja);
  }
}
