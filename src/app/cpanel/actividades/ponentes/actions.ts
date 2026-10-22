'use server';

import { after } from 'next/server';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import {
  getPonentesRepository,
  getInscripcionActividadRepository,
  getActividadRepository,
  getPdfService,
  getEmailService,
  reportarErrorEnAccion,
} from '@/infrastructure/config/container';
import { ConsultarPonentes } from '@/application/use-cases/ConsultarPonentes';
import { EnviarListasAsistencia } from '@/application/use-cases/EnviarListasAsistencia';
import type { PonenteResumenDTO } from '@/application/dtos/ActividadDTO';

function crearEnviarListas(): EnviarListasAsistencia {
  return new EnviarListasAsistencia(
    getPonentesRepository(),
    getInscripcionActividadRepository(),
    getActividadRepository(),
    getPdfService(),
    getEmailService(),
  );
}

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

export async function enviarListasAsistenciaPonenteAction(
  folioRegistro: string,
): Promise<{ success: true; actividades: number; correo: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const useCase = crearEnviarListas();
    const resumen = await useCase.preparar(folioRegistro);
    after(async () => {
      try {
        await useCase.enviar(resumen);
      } catch (error) {
        reportarErrorEnAccion(`Error al enviar listas de asistencia a ${resumen.folioRegistro}`, error);
      }
    });
    return { success: true as const, actividades: resumen.vinculos.length, correo: resumen.correo };
  } catch (error) {
    reportarErrorEnAccion(`Error en enviarListasAsistenciaPonenteAction para ${folioRegistro}`, error);
    if (error instanceof Error && error.message.startsWith('El ponente')) {
      return { success: false as const, error: error.message };
    }
    return { success: false as const, error: 'Ocurrió un error al enviar las listas' };
  }
}

export async function enviarTodasLasListasAction(): Promise<
  { success: true; ponentes: number; actividades: number } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const useCase = crearEnviarListas();
    const resumenes = await useCase.prepararTodos();
    if (resumenes.length === 0) {
      return { success: false as const, error: 'No hay ponentes con actividades asignadas' };
    }
    const actividadesUnicas = new Set(resumenes.flatMap((r) => r.vinculos.map((v) => v.idActividad))).size;
    after(async () => {
      const resultados = await useCase.enviarTodos(resumenes);
      for (const fallo of resultados.filter((r) => !r.exito)) {
        reportarErrorEnAccion(`Error al enviar listas de asistencia a ${fallo.folioRegistro}`, new Error(fallo.error));
      }
    });
    return { success: true as const, ponentes: resumenes.length, actividades: actividadesUnicas };
  } catch (error) {
    reportarErrorEnAccion('Error en enviarTodasLasListasAction', error);
    return { success: false as const, error: 'Ocurrió un error al enviar las listas' };
  }
}
