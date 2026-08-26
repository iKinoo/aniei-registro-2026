'use server';

import { revalidatePath } from 'next/cache';
import { getActividadRepository, getPrecioInscripcionRepository } from '@/infrastructure/config/container';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';
import { GestionarPrecios } from '@/application/use-cases/GestionarPrecios';
import { ActualizarPrecioDTO } from '@/application/ports/IPrecioInscripcionRepository';

export async function getTiposActividadAction() {
  try {
    await requireAdmin();
    const useCase = new GestionarActividades(getActividadRepository());
    const data = await useCase.obtenerTiposActividad();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error en getTiposActividadAction:', error);
    return { success: false as const, error: 'Error al obtener tipos de actividad' };
  }
}

export async function obtenerPreciosAction() {
  try {
    await requireAdmin();
    const useCase = new GestionarPrecios(getPrecioInscripcionRepository());
    const data = await useCase.obtenerPrecios();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error en obtenerPreciosAction:', error);
    return { success: false as const, error: 'Error al obtener precios' };
  }
}

export async function guardarPrecioAction(id: number, data: ActualizarPrecioDTO) {
  try {
    await requireAdmin();
    const useCase = new GestionarPrecios(getPrecioInscripcionRepository());
    const precio = await useCase.guardarPrecio(id, data);
    revalidatePath('/cpanel/configuracion');
    return { success: true as const, data: precio };
  } catch (error) {
    console.error('Error en guardarPrecioAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al guardar el precio';
    return { success: false as const, error: msg };
  }
}

export async function eliminarPrecioAction(id: number) {
  try {
    await requireAdmin();
    const useCase = new GestionarPrecios(getPrecioInscripcionRepository());
    await useCase.eliminarPrecio(id);
    revalidatePath('/cpanel/configuracion');
    return { success: true as const };
  } catch (error) {
    console.error('Error en eliminarPrecioAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al eliminar el precio';
    return { success: false as const, error: msg };
  }
}
