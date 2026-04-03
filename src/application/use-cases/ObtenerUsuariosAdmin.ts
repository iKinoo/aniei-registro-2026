import { IAdminQueryService } from '../ports/IAdminQueryService';
import { UsuarioAdminDTO } from '../dtos/UsuarioAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export class ObtenerUsuariosAdmin {
  constructor(private readonly adminQueryService: IAdminQueryService) {}

  /**
   * Ejecuta la consulta para obtener los usuarios administrativos paginados.
   */
  async execute(page: number, limit: number, search?: string): Promise<PaginatedResult<UsuarioAdminDTO>> {
    return this.adminQueryService.obtenerUsuariosAdmin(page, limit, search);
  }
}
