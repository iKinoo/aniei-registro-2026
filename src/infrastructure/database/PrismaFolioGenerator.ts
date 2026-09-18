import type { PrismaClient } from '@/generated/prisma/client';
import type { IFolioGenerator } from '@/application/ports/IFolioGenerator';

const PREFIJO = 'ANI26';
const DIGITOS = 4;

export class PrismaFolioGenerator implements IFolioGenerator {
  constructor(private readonly prisma: PrismaClient) {}

  async siguiente(): Promise<string> {
    const fila = await this.prisma.folios_contador.create({ data: {} });
    return `${PREFIJO}-${String(fila.id).padStart(DIGITOS, '0')}`;
  }
}
