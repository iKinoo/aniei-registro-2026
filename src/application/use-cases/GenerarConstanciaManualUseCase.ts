import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService, parseFileReference } from '@/application/ports/IStorageService';
import { IConstanciaManualRepository, ConstanciaManualEntity } from '@/application/ports/IConstanciaManualRepository';
import { ConstanciaManualDTO, TipoConstanciaManual } from '@/application/dtos/ConstanciaManualDTO';

export class GenerarConstanciaManualUseCase {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly storageService: IStorageService,
    private readonly constanciaManualRepo: IConstanciaManualRepository,
  ) {}

  async execute(dto: ConstanciaManualDTO): Promise<ConstanciaManualEntity> {
    const descripcion = this.generarDescripcion(dto);
    const tipoLabel = this.obtenerTipoLabel(dto.tipoConstancia);

    const fechaStr = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const pdfBuffer = await this.pdfService.generarConstanciaManual({
      tipoConstancia: tipoLabel,
      destinatarios: dto.destinatarios,
      descripcion,
      fecha: fechaStr,
    });

    const timestamp = Date.now();
    const nombreArchivo = dto.destinatarios[0]
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 30) ?? 'manual';
    const ruta = `constancias/manuales/${dto.tipoConstancia.toLowerCase()}-${nombreArchivo}-${timestamp}.pdf`;

    await this.storageService.subir(ruta, pdfBuffer, 'application/pdf');

    const fileRef = parseFileReference(ruta);
    const urlPdf = await this.storageService.getAccess(fileRef);

    const constancia = await this.constanciaManualRepo.guardar({
      tipoConstancia: dto.tipoConstancia,
      destinatarios: dto.destinatarios,
      descripcion,
      urlPdf,
    });

    return constancia;
  }

  private generarDescripcion(dto: ConstanciaManualDTO): string {
    switch (dto.tipoConstancia) {
      case 'PARTICIPANTE':
        return 'Por haber participado en el Congreso ANIEI, edición 2026.';

      case 'TALLER':
        return `Por haber participado en el taller "${dto.nombreActividad}" dentro del marco del Congreso ANIEI 2026.`;

      case 'CONFERENCIA_MAGISTRAL':
        return `Por haber impartido la Conferencia Magistral "${dto.nombreActividad}" dentro del marco del Congreso ANIEI 2026.`;

      case 'PONENTE':
        return `Por haber presentado la ponencia "${dto.nombrePonencia}" dentro del marco del Congreso ANIEI 2026.`;

      case 'CONCURSO_PROGRAMACION':
        return `Por haber participado en el Concurso de Programación del Congreso ANIEI 2026, obteniendo el ${dto.lugar ?? 'reconocimiento correspondiente'}.`;

      case 'HACKATHON':
        return `Por haber participado en el Hackathon del Congreso ANIEI 2026, obteniendo el ${dto.lugar ?? 'reconocimiento correspondiente'}.`;

      case 'TESIS':
        return `Por haber presentado la tesis "${dto.nombreTesis}" en el Concurso de Tesis del Congreso ANIEI 2026, logrando el ${dto.lugar ?? 'reconocimiento correspondiente'}.`;

      default:
        return 'Por su participación en el Congreso ANIEI 2026.';
    }
  }

  private obtenerTipoLabel(tipo: TipoConstanciaManual): string {
    const labels: Record<TipoConstanciaManual, string> = {
      PARTICIPANTE: 'Constancia de Participación',
      TALLER: 'Constancia de Taller',
      CONFERENCIA_MAGISTRAL: 'Constancia de Conferencia Magistral',
      PONENTE: 'Constancia de Ponente',
      CONCURSO_PROGRAMACION: 'Constancia de Concurso de Programación',
      HACKATHON: 'Constancia de Hackathon',
      TESIS: 'Constancia de Concurso de Tesis',
    };
    return labels[tipo] ?? 'Constancia';
  }
}
