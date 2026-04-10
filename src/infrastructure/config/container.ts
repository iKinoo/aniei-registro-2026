import { prisma } from '@/infrastructure/database/client';
import { PrismaUsuarioRepository } from '@/infrastructure/repositories/PrismaUsuarioRepository';
import { PrismaDepositoRepository } from '@/infrastructure/repositories/PrismaDepositoRepository';
import { PrismaFacturacionRepository } from '@/infrastructure/repositories/PrismaFacturacionRepository';
import { PrismaCatalogoRepository } from '@/infrastructure/repositories/PrismaCatalogoRepository';
import { PrismaAccesoRepository } from '@/infrastructure/repositories/PrismaAccesoRepository';
import { ResendEmailService } from '@/infrastructure/services/email/ResendEmailService';
import { ReactPdfService } from '@/infrastructure/services/pdf/ReactPdfService';
import { SupabaseStorageService } from '@/infrastructure/services/storage/SupabaseStorageService';
import { AuthJsAuthService } from '@/infrastructure/services/auth/AuthJsAuthService';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IAuthService } from '@/application/ports/IAuthService';
import { IDepositoRepository } from '@/application/ports/IDepositoRepository';
import { IFacturacionRepository } from '@/application/ports/IFacturacionRepository';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import { IAdminQueryService } from '@/application/ports/IAdminQueryService';
import { PrismaAdminQueryService } from '@/infrastructure/services/PrismaAdminQueryService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService } from '@/application/ports/IStorageService';
import { deprecate } from 'node:util';

export function getUsuarioRepository(): IUsuarioRepository {
  return new PrismaUsuarioRepository(prisma);
}

export function getDepositoRepository(): IDepositoRepository {
  return new PrismaDepositoRepository(prisma);
}

export function getFacturacionRepository(): IFacturacionRepository {
  return new PrismaFacturacionRepository(prisma);
}

export function getCatalogoRepository(): ICatalogoRepository {
  return new PrismaCatalogoRepository(prisma);
}

export function getAccesoRepository(): IAccesoRepository {
  return new PrismaAccesoRepository(prisma);
}

export function getEmailService(): IEmailService {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY y EMAIL_FROM deben estar configuradas');
  }
  return new ResendEmailService(apiKey, from);
}

export function getPdfService(): IPdfService {
  return new ReactPdfService();
}

export function getStorageService(): IStorageService {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas');
  }
  return new SupabaseStorageService(url, key);
}

export function getAdminQueryService(): IAdminQueryService {
  return new PrismaAdminQueryService(prisma);
}

export function getAuthService(): IAuthService {
  return new AuthJsAuthService();
}
