'use server';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getRegistroQueryService, getPdfService } from '@/infrastructure/config/container';
import { GenerarReporteInstituciones } from '@/application/use-cases/GenerarReporteInstituciones';
import type { InstitucionReporteItem } from '@/application/dtos/ConsultaRegistroDTO';

export type { InstitucionReporteItem } from '@/application/dtos/ConsultaRegistroDTO';

export async function obtenerReporteInstitucionesAction(): Promise<
  { success: true; data: InstitucionReporteItem[]; totalParticipantes: number } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const resultado = await new GenerarReporteInstituciones(getRegistroQueryService(), getPdfService()).obtener();
    return { success: true, ...resultado };
  } catch (error) {
    console.error('Error al obtener reporte de instituciones:', error);
    return { success: false, error: 'Error al obtener el reporte de instituciones' };
  }
}

export async function generarReporteInstitucionesPdfAction(): Promise<
  { success: true; data: { base64: string; nombreArchivo: string } } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const pdf = await new GenerarReporteInstituciones(getRegistroQueryService(), getPdfService()).generar();
    return { success: true, data: { base64: Buffer.from(pdf).toString('base64'), nombreArchivo: 'reporte_instituciones_participantes.pdf' } };
  } catch (error) {
    console.error('Error al generar reporte de instituciones:', error);
    return { success: false, error: 'Error al generar el reporte' };
  }
}
