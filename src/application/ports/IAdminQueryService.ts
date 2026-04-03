import { UsuarioForAdminDTO } from '../dtos/UsuarioAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export interface IAdminQueryService {
  obtenerUsuariosForAdmin(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResult<UsuarioForAdminDTO>>;
}
