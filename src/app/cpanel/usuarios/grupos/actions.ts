'use server';

import { reportarErrorEnAccion, getAdminQueryService } from '@/infrastructure/config/container';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { ObtenerGruposForAdmin } from '@/application/use-cases/ObtenerGruposForAdmin';
import { z } from 'zod';

const filtrosGruposSchema = z.object({
  page: z.number().int().positive().max(1_000_000),
  limit: z.number().int().min(1).max(100),
  search: z.string().trim().max(200).optional(),
});

export async function getGruposAdminAction(page: number, limit: number, search?: string) {
  try {
    await requireAdmin();
    const filtros = filtrosGruposSchema.safeParse({ page, limit, search });
    if (!filtros.success) {
      return { success: false as const, error: 'Los filtros de grupos no son válidos.' };
    }
    const result = await new ObtenerGruposForAdmin(getAdminQueryService()).execute(
      filtros.data.page, filtros.data.limit, filtros.data.search
    );
    return { success: true as const, data: result };
  } catch (error) {
    reportarErrorEnAccion('Error en getGruposAdminAction', error);
    return { success: false as const, error: 'Ocurrió un error al obtener grupos' };
  }
}
