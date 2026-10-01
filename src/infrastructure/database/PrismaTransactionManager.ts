import { PrismaPonentesRepository } from '@/infrastructure/repositories/PrismaPonentesRepository';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from './client';
import type { ITransactionManager, TransactionContext } from '@/application/ports/ITransactionManager';
import { PrismaUsuarioRepository } from '@/infrastructure/repositories/PrismaUsuarioRepository';
import { PrismaDepositoRepository } from '@/infrastructure/repositories/PrismaDepositoRepository';
import { PrismaFacturacionRepository } from '@/infrastructure/repositories/PrismaFacturacionRepository';
import { PrismaAccesoRepository } from '@/infrastructure/repositories/PrismaAccesoRepository';
import { PrismaInscripcionActividadRepository } from '@/infrastructure/repositories/PrismaInscripcionActividadRepository';
import { PrismaFolioGenerator } from './PrismaFolioGenerator';
import { mapPrismaError } from '@/infrastructure/errors/prismaErrorMapper';

export class PrismaTransactionManager implements ITransactionManager {
  async run<T>(fn: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    try {
      return await prisma.$transaction(async (tx) => fn({
        ponentesRepo: new PrismaPonentesRepository(tx),
        usuarioRepo: new PrismaUsuarioRepository(tx, new PrismaFolioGenerator(tx)),
        depositoRepo: new PrismaDepositoRepository(tx),
        accesoRepo: new PrismaAccesoRepository(tx),
        facturacionRepo: new PrismaFacturacionRepository(tx),
        inscripcionRepo: new PrismaInscripcionActividadRepository(tx),
      }), { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, timeout: 8000 });
    } catch (error) {
      throw mapPrismaError(error) ?? error;
    }
  }
}
