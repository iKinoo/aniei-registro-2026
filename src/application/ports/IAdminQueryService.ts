import { UsuarioForAdminDTO } from '../dtos/UsuarioForAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export interface IAdminQueryService {
  obtenerUsuariosForAdmin(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResult<UsuarioForAdminDTO>>;
}
