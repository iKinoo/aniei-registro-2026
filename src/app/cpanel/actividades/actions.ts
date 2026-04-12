'use server';

import { getActividadRepository, getCatalogoRepository } from '@/infrastructure/config/container';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';
import { CrearActividadDTO, ActualizarActividadDTO } from '@/application/dtos/ActividadDTO';

export async function getActividadesAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const data = await useCase.listar();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error en getActividadesAction:', error);
    return { success: false as const, error: 'Error al obtener las actividades' };
  }
}

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

export async function getInstitucionesAction() {
  try {
    const repo = getCatalogoRepository();
    const data = await repo.obtenerInstituciones();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error en getInstitucionesAction:', error);
    return { success: false as const, error: 'Error al obtener instituciones' };
  }
}

export async function crearActividadAction(data: CrearActividadDTO) {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const actividad = await useCase.crear(data);
    return { success: true as const, data: actividad };
  } catch (error) {
    console.error('Error en crearActividadAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al crear la actividad';
    return { success: false as const, error: msg };
  }
}

export async function actualizarActividadAction(id: number, data: ActualizarActividadDTO) {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const actividad = await useCase.actualizar(id, data);
    return { success: true as const, data: actividad };
  } catch (error) {
    console.error('Error en actualizarActividadAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al actualizar la actividad';
    return { success: false as const, error: msg };
  }
}
