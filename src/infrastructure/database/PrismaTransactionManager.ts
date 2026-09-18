import { prisma } from "./client";
import type { ITransactionManager } from "@/application/ports/ITransactionManager";
import { PrismaUsuarioRepository } from "@/infrastructure/repositories/PrismaUsuarioRepository";
import { PrismaDepositoRepository } from "@/infrastructure/repositories/PrismaDepositoRepository";
import { PrismaFacturacionRepository } from "@/infrastructure/repositories/PrismaFacturacionRepository";
import { PrismaAccesoRepository } from "@/infrastructure/repositories/PrismaAccesoRepository";
import { PrismaInscripcionActividadRepository } from "@/infrastructure/repositories/PrismaInscripcionActividadRepository";
import { PrismaFolioGenerator } from "@/infrastructure/database/PrismaFolioGenerator";

export class PrismaTransactionManager implements ITransactionManager {
  async run<T>(fn: (ctx: Parameters<ITransactionManager["run"]>[0] extends (c: infer C) => Promise<T> ? C : never) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      const ctx = {
        usuarioRepo: new PrismaUsuarioRepository(tx as any, new PrismaFolioGenerator(tx as any)),
        depositoRepo: new PrismaDepositoRepository(tx as any),
        accesoRepo: new PrismaAccesoRepository(tx as any),
        facturacionRepo: new PrismaFacturacionRepository(tx as any),
        inscripcionRepo: new PrismaInscripcionActividadRepository(tx as any),
      };
      // @ts-expect-error tx context
      return fn(ctx);
    }) as Promise<T>;
  }
}
