import type { IActividadRepository } from '../ports/IActividadRepository';
import type { ITransactionManager } from '../ports/ITransactionManager';
import type { ResultadoInscripcionManualDTO } from '../dtos/InscripcionActividadDTO';
import { RegistroError } from '@/core/errors/RegistroError';

export class InscribirParticipantesActividad {
  constructor(
    private readonly actividades: IActividadRepository,
    private readonly transacciones: ITransactionManager,
  ) {}

  async execute(idActividad: number, folios: string[]): Promise<ResultadoInscripcionManualDTO[]> {
    if (!Number.isSafeInteger(idActividad) || idActividad <= 0) {
      throw new RegistroError('La actividad no es válida', 'DATOS_INVALIDOS');
    }

    const foliosUnicos = [...new Set(folios.map((folio) => folio.trim()).filter(Boolean))];
    if (foliosUnicos.length === 0) {
      throw new RegistroError('Selecciona al menos un participante', 'DATOS_INVALIDOS');
    }

    const actividad = await this.actividades.obtenerPorId(idActividad);
    if (!actividad) {
      throw new RegistroError('Actividad no encontrada', 'ACTIVIDAD_INEXISTENTE');
    }

    const resultados: ResultadoInscripcionManualDTO[] = [];
    for (const folioRegistro of foliosUnicos) {
      resultados.push(await this.inscribir(idActividad, folioRegistro));
    }
    return resultados;
  }

  private async inscribir(idActividad: number, folioRegistro: string): Promise<ResultadoInscripcionManualDTO> {
    try {
      await this.transacciones.run(async (ctx) => {
        const usuario = await ctx.usuarioRepo.buscarPorId(folioRegistro);
        if (!usuario) {
          throw new RegistroError('El usuario no existe', 'USUARIO_INEXISTENTE');
        }

        const inscripciones = await ctx.inscripcionRepo.obtenerIdsPorUsuario(folioRegistro);
        if (inscripciones.includes(idActividad)) {
          throw new RegistroError('El usuario ya está inscrito en esta actividad', 'INSCRIPCION_DUPLICADA');
        }

        const { sinCupo } = await ctx.inscripcionRepo.crearMuchasConValidacion(folioRegistro, [idActividad]);
        if (sinCupo.includes(idActividad)) {
          throw new RegistroError('La actividad ya no tiene cupo disponible', 'SIN_CUPO');
        }
      });

      return { folioRegistro, exito: true };
    } catch (error) {
      if (!(error instanceof RegistroError)) {
        console.error(`Error al inscribir manualmente a ${folioRegistro} en la actividad ${idActividad}:`, error);
      }
      return {
        folioRegistro,
        exito: false,
        error: error instanceof RegistroError ? this.mensajeError(error) : 'No se pudo inscribir al participante',
      };
    }
  }

  private mensajeError(error: RegistroError): string {
    if (error.code === 'P2002' || error.message.includes('Ya existe una inscripción')) {
      return 'El usuario ya está inscrito en esta actividad';
    }
    return error.message;
  }
}
