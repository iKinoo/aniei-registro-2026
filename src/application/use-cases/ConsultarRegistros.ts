import type { IRegistroQueryService } from '../ports/IRegistroQueryService';

export class ConsultarRegistros {
  constructor(private readonly consultas: IRegistroQueryService) {}

  obtenerUsuario(folio: string) { return this.consultas.obtenerUsuario(folio); }
  obtenerDetalle(folio: string) { return this.consultas.obtenerDetalle(folio); }
  obtenerPerfil(folio: string) { return this.consultas.obtenerPerfil(folio); }
  obtenerGrupo(token: string) { return this.consultas.obtenerGrupo(token); }
  buscarUsuarios(query: string) { return this.consultas.buscarUsuarios(query); }
}
