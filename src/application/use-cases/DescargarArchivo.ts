import type { IStorageService } from '../ports/IStorageService';
import type { IAuthService } from '../ports/IAuthService';
import type { IAccesoRepository } from '../ports/IAccesoRepository';
import type { IDepositoRepository } from '../ports/IDepositoRepository';
import type { IEnlaceArchivoService } from '../ports/IEnlaceArchivoService';
import { AutorizarArchivo } from './AutorizarArchivo';
import { ArchivoAccesoError } from '@/core/errors/ArchivoAccesoError';

export class DescargarArchivo {
  constructor(private readonly storage: IStorageService, private readonly auth: IAuthService,
    private readonly accesos: IAccesoRepository, private readonly depositos: IDepositoRepository,
    private readonly enlaces: IEnlaceArchivoService) {}

  async execute(ruta: string, exp: string, sig: string): Promise<Uint8Array> {
    const estado = this.enlaces.validar(ruta, exp, sig);
    if (estado !== 'VALIDO') throw new ArchivoAccesoError(estado === 'EXPIRADO' ? 'ENLACE_EXPIRADO' : 'ENLACE_INVALIDO');
    await new AutorizarArchivo(this.auth, this.accesos, this.depositos).execute(ruta);
    try { return await this.storage.descargar(ruta); }
    catch { throw new ArchivoAccesoError('NO_ENCONTRADO'); }
  }
}
