import { UsuarioForAdminDTO } from '../dtos/UsuarioForAdminDTO';
import { GrupoForAdminDTO } from '../dtos/GrupoForAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export interface IAdminQueryService {
  obtenerUsuariosForAdmin(
    page: number,
    limit: number,
    search?: string,
    idInstitucion?: number
  ): Promise<PaginatedResult<UsuarioForAdminDTO>>;
  listarTodosUsuariosForAdmin(): Promise<UsuarioForAdminDTO[]>;
  obtenerGruposForAdmin(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResult<GrupoForAdminDTO>>;
}
