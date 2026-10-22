'use server';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getPonentesRepository, reportarErrorEnAccion } from '@/infrastructure/config/container';
import { ConsultarPonentes } from '@/application/use-cases/ConsultarPonentes';
import type { PonenteResumenDTO } from '@/application/dtos/ActividadDTO';

export async function getPonentesResumenAction(): Promise<
  { success: true; data: PonenteResumenDTO[] } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const data = await new ConsultarPonentes(getPonentesRepository()).ejecutar();
    return { success: true as const, data };
  } catch (error) {
    reportarErrorEnAccion('Error en getPonentesResumenAction', error);
    return { success: false as const, error: 'Error al cargar los ponentes' };
  }
}
