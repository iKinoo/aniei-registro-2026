import path from 'node:path';
import type { IEnlaceArchivoService } from '@/application/ports/IEnlaceArchivoService';
import { verificarFirma } from './firmaEnlaceArchivo';

export class HmacEnlaceArchivoService implements IEnlaceArchivoService {
  constructor(private readonly secret: string) {}

  validar(ruta: string, exp: string, sig: string): 'VALIDO' | 'INVALIDO' {
    if (!ruta || ruta.includes('\0') || ruta.includes('\\') || path.posix.isAbsolute(ruta)) return 'INVALIDO';
    const normalizada = path.posix.normalize(ruta);
    if (normalizada !== ruta || ruta.split('/').some(p => p === '..' || p === '.')) return 'INVALIDO';
    return verificarFirma(ruta, exp, sig, this.secret) ? 'VALIDO' : 'INVALIDO';
  }
}
