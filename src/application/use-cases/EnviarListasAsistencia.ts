import type { IPonentesRepository } from '../ports/IPonentesRepository';
import type { IInscripcionActividadRepository } from '../ports/IInscripcionActividadRepository';
import type { IActividadRepository } from '../ports/IActividadRepository';
import type { IPdfService } from '../ports/IPdfService';
import type { IEmailService } from '../ports/IEmailService';
import type { ResultadoEnvioListasDTO, VinculoPonenteDTO } from '../dtos/ActividadDTO';

export interface ResumenPonente {
  folioRegistro: string;
  nombre: string;
  correo: string;
  vinculos: VinculoPonenteDTO[];
}

export class EnviarListasAsistencia {
  constructor(
    private readonly ponentes: IPonentesRepository,
    private readonly inscripciones: IInscripcionActividadRepository,
    private readonly actividades: IActividadRepository,
    private readonly pdf: IPdfService,
    private readonly email: IEmailService,
  ) {}

  /** Validación ligera (sin PDFs ni SMTP) para responder/encolar de inmediato. */
  async preparar(folioPonente: string): Promise<ResumenPonente> {
    const resumen = (await this.resumenesPorFolio()).get(folioPonente);
    if (!resumen) {
      throw new Error('El ponente no tiene actividades asignadas');
    }
    return resumen;
  }

  async prepararTodos(): Promise<ResumenPonente[]> {
    return Array.from((await this.resumenesPorFolio()).values());
  }

  /** Genera los PDF y envía un solo correo con todos los adjuntos. Lanza si Gmail falla. */
  async enviar(resumen: ResumenPonente, cachePdf = new Map<number, Uint8Array>()): Promise<ResultadoEnvioListasDTO> {
    const listas = [];
    for (const vinculo of resumen.vinculos) {
      listas.push({ nombreActividad: vinculo.nombreActividad, pdf: await this.generarLista(vinculo.idActividad, cachePdf) });
    }
    await this.email.enviarListasAsistencia(resumen.correo, {
      nombreCompleto: resumen.nombre,
      folio: resumen.folioRegistro,
      listas,
    });
    return {
      folioRegistro: resumen.folioRegistro,
      nombre: resumen.nombre,
      correo: resumen.correo,
      actividades: listas.length,
      exito: true,
    };
  }

  /**
   * Envío secuencial para todos los ponentes, compartiendo la caché de PDF entre
   * actividades repetidas. Un fallo no aborta el resto: se registra en el resultado.
   */
  async enviarTodos(resumenes: ResumenPonente[]): Promise<ResultadoEnvioListasDTO[]> {
    const cachePdf = new Map<number, Uint8Array>();
    const resultados: ResultadoEnvioListasDTO[] = [];
    for (const resumen of resumenes) {
      try {
        resultados.push(await this.enviar(resumen, cachePdf));
      } catch (error) {
        resultados.push({
          folioRegistro: resumen.folioRegistro,
          nombre: resumen.nombre,
          correo: resumen.correo,
          actividades: resumen.vinculos.length,
          exito: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }
    return resultados;
  }

  private async generarLista(idActividad: number, cachePdf: Map<number, Uint8Array>): Promise<Uint8Array> {
    const cacheado = cachePdf.get(idActividad);
    if (cacheado) return cacheado;
    const actividad = await this.actividades.obtenerPorId(idActividad);
    if (!actividad) throw new Error(`La actividad ${idActividad} no existe`);
    const inscritos = await this.inscripciones.obtenerPorActividad(idActividad);
    const pdf = await this.pdf.generarListaParticipantes({
      nombreActividad: actividad.nombre,
      tipoActividad: actividad.tipoActividad?.descripcion ?? 'Actividad',
      fecha: new Date(actividad.fechaInicio).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
      participantes: inscritos.map((i, index) => ({
        numero: index + 1,
        folio: i.folioRegistro,
        nombre: `${i.nombre} ${i.apellido}`.trim(),
      })),
    });
    cachePdf.set(idActividad, pdf);
    return pdf;
  }

  private async resumenesPorFolio(): Promise<Map<string, ResumenPonente>> {
    const vinculos = await this.ponentes.obtenerTodos();
    const map = new Map<string, ResumenPonente>();
    for (const v of vinculos) {
      let resumen = map.get(v.folioRegistro);
      if (!resumen) {
        resumen = { folioRegistro: v.folioRegistro, nombre: `${v.nombre} ${v.apellido}`, correo: v.correo, vinculos: [] };
        map.set(v.folioRegistro, resumen);
      }
      resumen.vinculos.push(v);
    }
    return map;
  }
}
