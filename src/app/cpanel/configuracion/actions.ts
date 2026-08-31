'use server';

import { revalidatePath } from 'next/cache';
import { getActividadRepository, getPrecioInscripcionRepository, getTipoParticipanteRepository } from '@/infrastructure/config/container';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';
import { GestionarPrecios } from '@/application/use-cases/GestionarPrecios';
import { GestionarTiposParticipante } from '@/application/use-cases/GestionarTiposParticipante';
import { ActualizarPrecioDTO, CrearPrecioDTO } from '@/application/ports/IPrecioInscripcionRepository';
import { CrearTipoParticipanteDTO, ActualizarTipoParticipanteDTO } from '@/application/ports/ITipoParticipanteRepository';

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

export async function crearPrecioAction(data: CrearPrecioDTO) {
  try {
    await requireAdmin();
    const useCase = new GestionarPrecios(getPrecioInscripcionRepository());
    const precio = await useCase.crearPrecio(data);
    revalidatePath('/cpanel/configuracion');
    return { success: true as const, data: precio };
  } catch (error) {
    console.error('Error en crearPrecioAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al crear el precio';
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

export async function obtenerTiposParticipanteAction() {
  try {
    await requireAdmin();
    const useCase = new GestionarTiposParticipante(getTipoParticipanteRepository());
    const data = await useCase.obtenerTodos();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error en obtenerTiposParticipanteAction:', error);
    return { success: false as const, error: 'Error al obtener tipos de participante' };
  }
}

export async function guardarTipoParticipanteAction(id: number, data: ActualizarTipoParticipanteDTO) {
  try {
    await requireAdmin();
    const useCase = new GestionarTiposParticipante(getTipoParticipanteRepository());
    const tipo = await useCase.actualizar(id, data);
    revalidatePath('/cpanel/configuracion');
    return { success: true as const, data: tipo };
  } catch (error) {
    console.error('Error en guardarTipoParticipanteAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al guardar el tipo de participante';
    return { success: false as const, error: msg };
  }
}

export async function crearTipoParticipanteAction(data: CrearTipoParticipanteDTO) {
  try {
    await requireAdmin();
    const useCase = new GestionarTiposParticipante(getTipoParticipanteRepository());
    const tipo = await useCase.crear(data);
    revalidatePath('/cpanel/configuracion');
    return { success: true as const, data: tipo };
  } catch (error) {
    console.error('Error en crearTipoParticipanteAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al crear el tipo de participante';
    return { success: false as const, error: msg };
  }
}

export async function eliminarTipoParticipanteAction(id: number) {
  try {
    await requireAdmin();
    const useCase = new GestionarTiposParticipante(getTipoParticipanteRepository());
    await useCase.eliminar(id);
    revalidatePath('/cpanel/configuracion');
    return { success: true as const };
  } catch (error) {
    console.error('Error en eliminarTipoParticipanteAction:', error);
    const msg = error instanceof Error ? error.message : 'Error al eliminar el tipo de participante';
    return { success: false as const, error: msg };
  }
}
