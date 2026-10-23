import { IAdminQueryService } from '../ports/IAdminQueryService';
import { GrupoForAdminDTO } from '../dtos/GrupoForAdminDTO';
import { PaginatedResult } from '../dtos/PaginatedResult';

export class ObtenerGruposForAdmin {
  constructor(private readonly adminQueryService: IAdminQueryService) { }

  async execute(page: number, limit: number, search?: string): Promise<PaginatedResult<GrupoForAdminDTO>> {
    return this.adminQueryService.obtenerGruposForAdmin(page, limit, search);
  }
}
