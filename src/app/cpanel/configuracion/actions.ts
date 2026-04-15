'use server';

import { getActividadRepository } from '@/infrastructure/config/container';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';

export async function getTiposActividadAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const data = await useCase.obtenerTiposActividad();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error en getTiposActividadAction:', error);
    return { success: false as const, error: 'Error al obtener tipos de actividad' };
  }
}
