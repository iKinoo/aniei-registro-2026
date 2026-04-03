import { IAdminQueryService } from '../ports/IAdminQueryService';
import { UsuarioForAdminDTO } from '../dtos/UsuarioAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export class ObtenerUsuariosForAdmin {
  constructor(private readonly adminQueryService: IAdminQueryService) { }

  /**
   * Ejecuta la consulta para obtener los usuarios administrativos paginados.
   */
  async execute(page: number, limit: number, search?: string): Promise<PaginatedResult<UsuarioForAdminDTO>> {
    return this.adminQueryService.obtenerUsuariosForAdmin(page, limit, search);
  }
}
