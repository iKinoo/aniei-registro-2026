import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService } from '@/application/ports/IStorageService';
import { IConstanciaManualRepository, ConstanciaManualEntity } from '@/application/ports/IConstanciaManualRepository';
import { ConstanciaManualDTO, ConstanciaManualArchivo, TipoConstanciaManual } from '@/application/dtos/ConstanciaManualDTO';
import { contenidoParaManual, textoPlanoContenido, unirNombres } from '@/application/services/RedactorConstancia';

const TIPOS_EQUIPO: TipoConstanciaManual[] = ['PONENTE', 'TESIS', 'HACKATHON', 'CONCURSO_PROGRAMACION'];

export class GenerarConstanciaManualUseCase {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly storageService: IStorageService,
    private readonly constanciaManualRepo: IConstanciaManualRepository,
  ) {}

  obtenerTodas() { return this.constanciaManualRepo.obtenerTodas(); }

  async execute(dto: ConstanciaManualDTO): Promise<ConstanciaManualEntity> {
    const esEquipo = TIPOS_EQUIPO.includes(dto.tipoConstancia);
    const timestamp = Date.now();
    const archivos: ConstanciaManualArchivo[] = [];
    const subidos: string[] = [];
    let descripcion = '';

    try {
      if (esEquipo) {
        const contenido = contenidoParaManual(dto, unirNombres(dto.destinatarios));
        descripcion = textoPlanoContenido(contenido);
        const pdf = await this.pdfService.generarConstancia(contenido);
        const ruta = `constancias/manuales/${this.slugBase(dto)}-${timestamp}.pdf`;
        await this.storageService.subir(ruta, pdf, 'application/pdf');
        subidos.push(ruta);
        archivos.push({ destinatario: null, ruta });
      } else {
        for (let i = 0; i < dto.destinatarios.length; i++) {
          const destinatario = dto.destinatarios[i];
          const contenido = contenidoParaManual(dto, destinatario);
          if (i === 0) {
            descripcion = textoPlanoContenido(contenido);
            if (dto.destinatarios.length > 1) descripcion += ` (+${dto.destinatarios.length - 1} destinatarios más)`;
          }
          const pdf = await this.pdfService.generarConstancia(contenido);
          const ruta = `constancias/manuales/${this.slugBase(dto)}-${timestamp}-${i + 1}.pdf`;
          await this.storageService.subir(ruta, pdf, 'application/pdf');
          subidos.push(ruta);
          archivos.push({ destinatario, ruta });
        }
      }
    } catch (error) {
      for (const ruta of subidos) {
        try { await this.storageService.eliminar(ruta); } catch (cleanupError) { console.error('Error al compensar constancia manual:', cleanupError); }
      }
      throw error;
    }

    return this.constanciaManualRepo.guardar({
      tipoConstancia: dto.tipoConstancia,
      destinatarios: dto.destinatarios,
      descripcion,
      archivos,
    });
  }

  private slugBase(dto: ConstanciaManualDTO): string {
    const base = dto.tipoConstancia.toLowerCase();
    if (TIPOS_EQUIPO.includes(dto.tipoConstancia)) return `${base}-equipo`;
    const nombre = dto.destinatarios[0]
      ?.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 30);
    return `${base}-${nombre ?? 'manual'}`;
  }
}
