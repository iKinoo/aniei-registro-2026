import type { ICatalogoRepository } from '../ports/ICatalogoRepository';

export class ConsultarCatalogos {
  constructor(private readonly repo: ICatalogoRepository) {}
  obtenerEstados() { return this.repo.obtenerEstados(); }
  obtenerInstituciones() { return this.repo.obtenerInstituciones(); }
  obtenerTitulos() { return this.repo.obtenerTitulos(); }
}
