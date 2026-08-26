import { IAdminQueryService } from '../ports/IAdminQueryService';
import { UsuarioForAdminDTO } from '../dtos/UsuarioForAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export class ObtenerUsuariosForAdmin {
  constructor(private readonly adminQueryService: IAdminQueryService) { }

  async execute(page: number, limit: number, search?: string, idInstitucion?: number): Promise<PaginatedResult<UsuarioForAdminDTO>> {
    return this.adminQueryService.obtenerUsuariosForAdmin(page, limit, search, idInstitucion);
  }
}
