import type { IInscripcionActividadRepository } from '../ports/IInscripcionActividadRepository';

export class ConsultarInscripciones {
  constructor(private readonly repo: IInscripcionActividadRepository) {}
  obtenerIdsPorUsuario(folio: string) { return this.repo.obtenerIdsPorUsuario(folio); }
}
