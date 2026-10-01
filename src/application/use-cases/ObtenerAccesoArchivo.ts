import type { IStorageService } from '../ports/IStorageService';
import { parseFileReference } from '../ports/IStorageService';
import type { IAuthService } from '../ports/IAuthService';
import type { IAccesoRepository } from '../ports/IAccesoRepository';
import type { IDepositoRepository } from '../ports/IDepositoRepository';
import { AutorizarArchivo } from './AutorizarArchivo';

export class ObtenerAccesoArchivo {
  constructor(private readonly storage: IStorageService, private readonly auth: IAuthService,
    private readonly accesos: IAccesoRepository, private readonly depositos: IDepositoRepository) {}

  async execute(ruta: string): Promise<string> {
    await new AutorizarArchivo(this.auth, this.accesos, this.depositos).execute(ruta);
    return this.storage.getAccess(parseFileReference(ruta));
  }
}
