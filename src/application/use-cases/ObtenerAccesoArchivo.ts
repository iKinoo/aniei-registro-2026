import { IStorageService, parseFileReference } from '@/application/ports/IStorageService';
import { IAuthService } from '@/application/ports/IAuthService';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';

export class ObtenerAccesoArchivo {
  constructor(
    private readonly storage: IStorageService,
    private readonly authService: IAuthService,
    private readonly accesoRepo: IAccesoRepository
  ) {}

  async execute(ruta: string): Promise<string> {
    const session = await this.authService.getCurrentSession();
    if (!session) {
      throw new Error('Unauthorized: Sesión inválida');
    }

    const acceso = await this.accesoRepo.buscarPorFolioRegistro(session.folioRegistro);
    if (!acceso || !acceso.isAdmin()) {
      throw new Error('Unauthorized: Se requieren los permisos de administrador para realizar esta accion');
    }

    const file = parseFileReference(ruta);
    return await this.storage.getAccess(file);
  }
}
