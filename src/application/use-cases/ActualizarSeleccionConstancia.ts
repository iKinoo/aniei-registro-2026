import type { ITransactionManager } from '../ports/ITransactionManager';
import { RegistroError } from '@/core/errors/RegistroError';

export class ActualizarSeleccionConstancia {
  constructor(private readonly transacciones: ITransactionManager) {}

  async execute(idActividad: number, folioRegistro: string | null, incluir: boolean): Promise<void> {
    if (!Number.isSafeInteger(idActividad) || idActividad <= 0) {
      throw new RegistroError('La actividad no es válida', 'DATOS_INVALIDOS');
    }

    await this.transacciones.run(async (ctx) => {
      if (folioRegistro) {
        await ctx.inscripcionRepo.actualizarInclusionConstancia(idActividad, folioRegistro, incluir);
      } else {
        await ctx.inscripcionRepo.actualizarInclusionConstanciaMasiva(idActividad, incluir);
      }
    });
  }
}
