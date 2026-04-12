export interface IInscripcionActividadRepository {
  /** Crea inscripciones masivas, ignorando duplicados */
  crearMuchas(idUsuario: number, idsActividades: number[]): Promise<void>;
  /** Retorna los ids de actividades en las que ya está inscrito el usuario */
  obtenerIdsPorUsuario(idUsuario: number): Promise<number[]>;
  /**
   * Inscribe al usuario en varias actividades con validación de cupo atómica.
   * Usa SELECT FOR UPDATE por actividad para evitar race conditions.
   * @returns ok: ids inscritos exitosamente · sinCupo: ids rechazados por cupo lleno
   */
  crearMuchasConValidacion(
    idUsuario: number,
    idsActividades: number[],
  ): Promise<{ ok: number[]; sinCupo: number[] }>;
}
