import type { IInscripcionActividadRepository } from '../ports/IInscripcionActividadRepository';
import type { IStorageService } from '../ports/IStorageService';

export class EliminarInscripcionActividad {
  constructor(
    private readonly inscripciones: IInscripcionActividadRepository,
    private readonly storage: IStorageService,
  ) {}

  async execute(idActividad: number, folioRegistro: string): Promise<void> {
    const rutaConstancia = await this.inscripciones.eliminar(idActividad, folioRegistro);
    if (rutaConstancia) {
      try {
        await this.storage.eliminar(rutaConstancia);
      } catch (error) {
        console.error(`Error al eliminar constancia ${rutaConstancia} tras borrar inscripción:`, error);
      }
    }
  }
}
