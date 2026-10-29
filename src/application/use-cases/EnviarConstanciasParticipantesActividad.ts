import type { IActividadRepository } from '../ports/IActividadRepository';
import type { IEmailService } from '../ports/IEmailService';
import type { IInscripcionActividadRepository } from '../ports/IInscripcionActividadRepository';
import type { InscritoDTO, ResultadoEnvioConstanciaDTO } from '../dtos/ActividadDTO';
import type { GenerarConstanciaParticipanteUseCase } from './GenerarConstanciaParticipanteUseCase';
import { RegistroError } from '@/core/errors/RegistroError';

export interface ResumenEnvioConstancias {
  idActividad: number;
  nombreActividad: string;
  total: number;
  garantizadas: number;
  porGenerar: number;
  participantes: InscritoDTO[];
}

export class EnviarConstanciasParticipantesActividad {
  constructor(
    private readonly inscripciones: IInscripcionActividadRepository,
    private readonly actividades: IActividadRepository,
    private readonly generarConstancia: GenerarConstanciaParticipanteUseCase,
    private readonly email: IEmailService,
  ) {}

  async preparar(idActividad: number): Promise<ResumenEnvioConstancias> {
    const actividad = await this.actividades.obtenerPorId(idActividad);
    if (!actividad) {
      throw new RegistroError('Actividad no encontrada', 'ACTIVIDAD_INEXISTENTE');
    }

    const inscritos = await this.inscripciones.obtenerPorActividad(idActividad);
    const seleccionados = inscritos.filter((inscrito) => inscrito.incluirEnConstancia);
    if (seleccionados.length === 0) {
      throw new RegistroError(
        'No hay participantes seleccionados para enviar constancias',
        'SIN_SELECCIONADOS',
      );
    }

    const garantizadas = seleccionados.filter((inscrito) => inscrito.urlConstancia).length;
    return {
      idActividad,
      nombreActividad: actividad.nombre,
      total: seleccionados.length,
      garantizadas,
      porGenerar: seleccionados.length - garantizadas,
      participantes: seleccionados,
    };
  }

  async enviar(resumen: ResumenEnvioConstancias): Promise<ResultadoEnvioConstanciaDTO[]> {
    const resultados: ResultadoEnvioConstanciaDTO[] = [];

    for (const participante of resumen.participantes) {
      const nombre = `${participante.nombre} ${participante.apellido}`.trim();
      try {
        const { pdf } = await this.generarConstancia.execute(resumen.idActividad, participante.folioRegistro);
        await this.email.enviarConstanciaParticipante(
          participante.correo,
          pdf,
          nombre,
          resumen.nombreActividad,
        );
        await this.inscripciones.marcarCorreoEnviado(resumen.idActividad, participante.folioRegistro);
        resultados.push({
          folioRegistro: participante.folioRegistro,
          nombre,
          correo: participante.correo,
          exito: true,
        });
      } catch (error) {
        resultados.push({
          folioRegistro: participante.folioRegistro,
          nombre,
          correo: participante.correo,
          exito: false,
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    return resultados;
  }
}
