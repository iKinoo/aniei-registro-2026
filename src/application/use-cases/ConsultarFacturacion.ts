import type { IFacturacionRepository } from '../ports/IFacturacionRepository';

export class ConsultarFacturacion {
  constructor(private readonly repo: IFacturacionRepository) {}
  buscarPorUsuario(folio: string) { return this.repo.buscarPorUsuario(folio); }
}
