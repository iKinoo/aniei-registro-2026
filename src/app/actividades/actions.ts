'use server';

import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { getActividadRepository, getInscripcionActividadRepository } from '@/infrastructure/config/container';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';

function esActividadEspecial(tipo: ActividadDTO['tipoActividad']): boolean {
  if (!tipo) return false;
  const clave = (tipo.clave ?? '').toLowerCase();
  const desc = tipo.descripcion.toLowerCase();
  return clave.includes('hackaton') || clave.includes('concurso') || desc.includes('hackaton') || desc.includes('concurso');
}

function filtrarPorClave(actividades: ActividadDTO[], clave: string): ActividadDTO[] {
  return actividades.filter((a) => a.tipoActividad?.clave?.toLowerCase() === clave);
}

export async function getActividadesDisponiblesAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const todas = await useCase.listar();
    const disponibles = todas.filter((a) => !esActividadEspecial(a.tipoActividad));
    return { success: true as const, data: disponibles };
  } catch (error) {
    console.error('Error en getActividadesDisponiblesAction:', error);
    return { success: false as const, error: 'Error al cargar las actividades' };
  }
}

export async function getTalleresAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const todas = await useCase.listar();
    return { success: true as const, data: filtrarPorClave(todas, 'taller') };
  } catch (error) {
    console.error('Error en getTalleresAction:', error);
    return { success: false as const, error: 'Error al cargar los talleres' };
  }
}

export async function getConcursosAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const todas = await useCase.listar();
    return { success: true as const, data: filtrarPorClave(todas, 'concurso') };
  } catch (error) {
    console.error('Error en getConcursosAction:', error);
    return { success: false as const, error: 'Error al cargar los concursos' };
  }
}

export async function getActividadesAction() {
  try {
    const useCase = new GestionarActividades(getActividadRepository());
    const todas = await useCase.listar();
    return { success: true as const, data: filtrarPorClave(todas, 'actividad') };
  } catch (error) {
    console.error('Error en getActividadesAction:', error);
    return { success: false as const, error: 'Error al cargar las actividades' };
  }
}

export async function getInscripcionesUsuarioAction() {
  try {
    const session = await auth();
    const folioRegistro = (session?.user as any)?.folioRegistro;
    if (!folioRegistro) return { success: true as const, data: [] as number[] };

    const acceso = await prisma.accesos.findFirst({
      where: { folio_registro: folioRegistro },
      select: { folio_registro: true },
    });
    if (!acceso?.folio_registro) return { success: true as const, data: [] as number[] };

    const repo = getInscripcionActividadRepository();
    const ids = await repo.obtenerIdsPorUsuario(acceso.folio_registro);
    return { success: true as const, data: ids };
  } catch (error) {
    console.error('Error en getInscripcionesUsuarioAction:', error);
    return { success: false as const, error: 'Error al cargar inscripciones' };
  }
}
