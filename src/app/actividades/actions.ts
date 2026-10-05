'use server';

import { requireUser } from '@/shared/auth/requireAdmin';
import { ConsultarInscripciones } from '@/application/use-cases/ConsultarInscripciones';
import { reportarErrorEnAccion, getActividadRepository, getInscripcionActividadRepository } from '@/infrastructure/config/container';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';

export async function getActividadesDisponiblesAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    await requireUser();
    const disponibles = await useCase.listarPorCategoria('disponibles');
    return { success: true as const, data: disponibles };
  } catch (error) {
    reportarErrorEnAccion('Error en getActividadesDisponiblesAction', error);
    return { success: false as const, error: 'Error al cargar las actividades' };
  }
}

export async function getTalleresAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    await requireUser();
    return { success: true as const, data: await useCase.listarPorCategoria('taller') };
  } catch (error) {
    reportarErrorEnAccion('Error en getTalleresAction', error);
    return { success: false as const, error: 'Error al cargar los talleres' };
  }
}

export async function getConcursosAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    await requireUser();
    return { success: true as const, data: await useCase.listarPorCategoria('concurso') };
  } catch (error) {
    reportarErrorEnAccion('Error en getConcursosAction', error);
    return { success: false as const, error: 'Error al cargar los concursos' };
  }
}

export async function getActividadesAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    await requireUser();
    return { success: true as const, data: await useCase.listarPorCategoria('actividad') };
  } catch (error) {
    reportarErrorEnAccion('Error en getActividadesAction', error);
    return { success: false as const, error: 'Error al cargar las actividades' };
  }
}

export async function getInscripcionesUsuarioAction() {
  try {
    const { folioRegistro } = await requireUser();
    const ids = await new ConsultarInscripciones(getInscripcionActividadRepository()).obtenerIdsPorUsuario(folioRegistro);
    return { success: true as const, data: ids };
  } catch (error) {
    reportarErrorEnAccion('Error en getInscripcionesUsuarioAction', error);
    return { success: false as const, error: 'Error al cargar inscripciones' };
  }
}
