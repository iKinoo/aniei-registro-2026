'use server';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getActividadRepository, getEquipoRepository } from '@/infrastructure/config/container';
import { GestionarEquipos } from '@/application/use-cases/GestionarEquipos';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';
import { CrearEquipoDTO, ActualizarEquipoDTO } from '@/application/dtos/EquipoDTO';

export async function getActividadesConEquiposAction() {
  try {
    await requireAdmin();
    const actRepo = getActividadRepository();
    const todas = await actRepo.listar();
    const conEquipos = todas.filter((a) => a.tipoActividad?.manejaEquipos);
    return { success: true as const, data: conEquipos };
  } catch (error) {
    console.error('Error en getActividadesConEquiposAction:', error);
    return { success: false as const, error: 'Error al cargar actividades' };
  }
}

export async function getEquiposAction(idActividad: number) {
  try {
    await requireAdmin();
    const useCase = new GestionarEquipos(getEquipoRepository());
    const equipos = await useCase.listarPorActividad(idActividad);
    return { success: true as const, data: equipos };
  } catch (error) {
    console.error('Error en getEquiposAction:', error);
    return { success: false as const, error: 'Error al cargar equipos' };
  }
}

export async function crearEquipoAction(data: CrearEquipoDTO) {
  try {
    await requireAdmin();
    const useCase = new GestionarEquipos(getEquipoRepository());
    const equipo = await useCase.crearEquipo(data);
    return { success: true as const, data: equipo };
  } catch (error) {
    console.error('Error en crearEquipoAction:', error);
    const message = error instanceof Error ? error.message : 'Error al crear equipo';
    return { success: false as const, error: message };
  }
}

export async function actualizarEquipoAction(idEquipo: number, data: ActualizarEquipoDTO) {
  try {
    await requireAdmin();
    const useCase = new GestionarEquipos(getEquipoRepository());
    const equipo = await useCase.actualizarEquipo(idEquipo, data);
    return { success: true as const, data: equipo };
  } catch (error) {
    console.error('Error en actualizarEquipoAction:', error);
    const message = error instanceof Error ? error.message : 'Error al actualizar equipo';
    return { success: false as const, error: message };
  }
}

export async function eliminarEquipoAction(idEquipo: number) {
  try {
    await requireAdmin();
    const useCase = new GestionarEquipos(getEquipoRepository());
    await useCase.eliminarEquipo(idEquipo);
    return { success: true as const };
  } catch (error) {
    console.error('Error en eliminarEquipoAction:', error);
    const message = error instanceof Error ? error.message : 'Error al eliminar equipo';
    return { success: false as const, error: message };
  }
}

export async function buscarUsuariosEquipoAction(query: string) {
  try {
    await requireAdmin();
    const useCase = new GestionarEquipos(getEquipoRepository());
    const usuarios = await useCase.buscarUsuarios(query);
    return { success: true as const, data: usuarios };
  } catch (error) {
    console.error('Error en buscarUsuariosEquipoAction:', error);
    return { success: false as const, error: 'Error al buscar usuarios', data: [] };
  }
}

export async function getActividadDetalleAction(idActividad: number) {
  try {
    await requireAdmin();
    const actRepo = getActividadRepository();
    const actividad = await actRepo.obtenerPorId(idActividad);
    if (!actividad) {
      return { success: false as const, error: 'Actividad no encontrada' };
    }
    return { success: true as const, data: actividad };
  } catch (error) {
    console.error('Error en getActividadDetalleAction:', error);
    return { success: false as const, error: 'Error al cargar actividad' };
  }
}
