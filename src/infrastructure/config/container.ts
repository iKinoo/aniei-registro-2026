import { prisma } from '@/infrastructure/database/client';
import { PrismaUsuarioRepository } from '@/infrastructure/repositories/PrismaUsuarioRepository';
import { PrismaDepositoRepository } from '@/infrastructure/repositories/PrismaDepositoRepository';
import { PrismaFacturacionRepository } from '@/infrastructure/repositories/PrismaFacturacionRepository';
import { PrismaCatalogoRepository } from '@/infrastructure/repositories/PrismaCatalogoRepository';
import { PrismaAccesoRepository } from '@/infrastructure/repositories/PrismaAccesoRepository';
import { PrismaActividadRepository } from '@/infrastructure/repositories/PrismaActividadRepository';
import { PrismaInscripcionActividadRepository } from '@/infrastructure/repositories/PrismaInscripcionActividadRepository';
import { PrismaPonentesRepository } from '@/infrastructure/repositories/PrismaPonentesRepository';
import { PrismaPrecioInscripcionRepository } from '@/infrastructure/repositories/PrismaPrecioInscripcionRepository';
import { NodemailerEmailService } from '@/infrastructure/services/email/NodemailerEmailService';
import { PuppeteerPdfService } from '@/infrastructure/services/pdf/PuppeteerPdfService';
import { SupabaseStorageService } from '@/infrastructure/services/storage/SupabaseStorageService';
import { AuthJsAuthService } from '@/infrastructure/services/auth/AuthJsAuthService';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IAuthService } from '@/application/ports/IAuthService';
import { IDepositoRepository } from '@/application/ports/IDepositoRepository';
import { IFacturacionRepository } from '@/application/ports/IFacturacionRepository';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import { IAdminQueryService } from '@/application/ports/IAdminQueryService';
import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { IInscripcionActividadRepository } from '@/application/ports/IInscripcionActividadRepository';
import { IPonentesRepository } from '@/application/ports/IPonentesRepository';
import { IPrecioInscripcionRepository } from '@/application/ports/IPrecioInscripcionRepository';
import { PrismaAdminQueryService } from '@/infrastructure/services/PrismaAdminQueryService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService } from '@/application/ports/IStorageService';

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

export function getActividadRepository(): IActividadRepository {
  return new PrismaActividadRepository(prisma);
}

export function getInscripcionActividadRepository(): IInscripcionActividadRepository {
  return new PrismaInscripcionActividadRepository(prisma);
}

export function getPonentesRepository(): IPonentesRepository {
  return new PrismaPonentesRepository(prisma);
}

export function getEmailService(): IEmailService {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const from = process.env.EMAIL_FROM || user;
  if (!user || !pass || !from) {
    throw new Error('GMAIL_USER, GMAIL_APP_PASSWORD y EMAIL_FROM deben estar configuradas');
  }
  return new NodemailerEmailService(user, pass, from);
}

export function getPdfService(): IPdfService {
  return new PuppeteerPdfService();
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

export function getPrecioInscripcionRepository(): IPrecioInscripcionRepository {
  return new PrismaPrecioInscripcionRepository(prisma);
}
