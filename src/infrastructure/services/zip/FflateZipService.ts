import { zipSync, type Zippable } from 'fflate';
import type { ArchivoZip, IZipService } from '@/application/ports/IZipService';

export class FflateZipService implements IZipService {
  async comprimir(archivos: ArchivoZip[]): Promise<Uint8Array> {
    const entradas: Zippable = {};

    for (const archivo of archivos) {
      entradas[archivo.nombre] = [archivo.contenido, { level: 6 }];
    }

    return zipSync(entradas, { level: 6 });
  }
}
