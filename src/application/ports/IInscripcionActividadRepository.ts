import { InscritoDTO } from '@/application/dtos/ActividadDTO';

export interface IInscripcionActividadRepository {
  /** Crea inscripciones masivas, ignorando duplicados */
  crearMuchas(folioRegistro: string, idsActividades: number[]): Promise<void>;
  /** Retorna los ids de actividades en las que ya está inscrito el usuario */
  obtenerIdsPorUsuario(folioRegistro: string): Promise<number[]>;
  /** Retorna los usuarios inscritos a una actividad específica */
  obtenerPorActividad(idActividad: number): Promise<InscritoDTO[]>;
  /**
   * Inscribe al usuario en varias actividades con validación de cupo atómica.
   * Usa SELECT FOR UPDATE por actividad para evitar race conditions.
   * @returns ok: ids inscritos exitosamente · sinCupo: ids rechazados por cupo lleno
   */
  crearMuchasConValidacion(
    folioRegistro: string,
    idsActividades: number[],
  ): Promise<{ ok: number[]; sinCupo: number[] }>;
  
  /** Actualiza la url de la constancia generada para el usuario participante */
  actualizarUrlConstancia(idActividad: number, folioRegistro: string, url: string): Promise<void>;
}
