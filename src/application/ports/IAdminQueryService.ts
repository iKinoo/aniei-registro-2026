import { UsuarioAdminDTO } from '../dtos/UsuarioAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export interface IAdminQueryService {
  obtenerUsuariosAdmin(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResult<UsuarioAdminDTO>>;
}
