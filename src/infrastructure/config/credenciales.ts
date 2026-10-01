import type { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import type { IPasswordHasher } from '@/application/ports/IPasswordHasher';
import { prisma } from '@/infrastructure/database/client';
import { PrismaAccesoRepository } from '@/infrastructure/repositories/PrismaAccesoRepository';
import { BcryptPasswordHasher } from '@/infrastructure/services/auth/BcryptPasswordHasher';

export function getAccesoRepository(): IAccesoRepository {
  return new PrismaAccesoRepository(prisma);
}

export function getPasswordHasher(): IPasswordHasher {
  return new BcryptPasswordHasher();
}
