export interface IInscripcionActividadRepository {
  /** Crea inscripciones masivas, ignorando duplicados */
  crearMuchas(idUsuario: number, idsActividades: number[]): Promise<void>;
  /** Retorna los ids de actividades en las que ya está inscrito el usuario */
  obtenerIdsPorUsuario(idUsuario: number): Promise<number[]>;
}
