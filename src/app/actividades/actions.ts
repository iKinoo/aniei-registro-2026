'use server';

import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { getActividadRepository, getInscripcionActividadRepository } from '@/infrastructure/config/container';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';

/** Tipos de actividad excluidos del flujo general (son casos especiales) */
function esActividadEspecial(tipo: ActividadDTO['tipoActividad']): boolean {
  if (!tipo) return false;
  const clave = (tipo.clave ?? '').toLowerCase();
  const desc = tipo.descripcion.toLowerCase();
  return clave.includes('hackaton') || clave.includes('concurso') || desc.includes('hackaton') || desc.includes('concurso');
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

export async function getInscripcionesUsuarioAction() {
  try {
    const session = await auth();
    if (!session?.user?.email) return { success: true as const, data: [] as number[] };

    const acceso = await prisma.accesos.findUnique({
      where: { email: session.user.email },
      select: { id_usuario: true },
    });
    if (!acceso?.id_usuario) return { success: true as const, data: [] as number[] };

    const repo = getInscripcionActividadRepository();
    const ids = await repo.obtenerIdsPorUsuario(acceso.id_usuario);
    return { success: true as const, data: ids };
  } catch (error) {
    console.error('Error en getInscripcionesUsuarioAction:', error);
    return { success: false as const, error: 'Error al cargar inscripciones' };
  }
}
