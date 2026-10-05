'use server';

import { reportarErrorEnAccion, getStorageService, getAuthService, getAccesoRepository, getDepositoRepository } from '@/infrastructure/config/container';
import { ObtenerAccesoArchivo } from '@/application/use-cases/ObtenerAccesoArchivo';
import { requireUser } from '@/shared/auth/requireAdmin';

export async function obtenerUrlComprobanteAction(ruta: string): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireUser();
    const url = await new ObtenerAccesoArchivo(getStorageService(), getAuthService(), getAccesoRepository(),
      getDepositoRepository()).execute(ruta);
    return { success: true, url };
  } catch (error) {
    reportarErrorEnAccion('Error al obtener comprobante', error);
    return { success: false, error: 'Error al obtener acceso al comprobante' };
  }
}
