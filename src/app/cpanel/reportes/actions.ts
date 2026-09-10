'use server';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { prisma } from '@/infrastructure/database/client';
import { getPdfService } from '@/infrastructure/config/container';

export interface InstitucionReporteItem {
  idInstitucion: number;
  nombre: string;
  abreviatura: string | null;
  totalParticipantes: number;
}

export async function obtenerReporteInstitucionesAction(): Promise<
  { success: true; data: InstitucionReporteItem[]; totalParticipantes: number } | { success: false; error: string }
> {
  try {
    await requireAdmin();

    const resultados = await prisma.usuarios.groupBy({
      by: ['id_institucion'],
      _count: { folio_registro: true },
      orderBy: { _count: { folio_registro: 'desc' } },
    });

    const instituciones = await prisma.instituciones.findMany({
      where: {
        id_institucion: { in: resultados.map(r => r.id_institucion ?? 0).filter(id => id > 0) },
      },
    });

    const institucionMap = new Map(instituciones.map(i => [i.id_institucion, i]));

    const data: InstitucionReporteItem[] = resultados
      .filter(r => r.id_institucion !== null && r.id_institucion > 0)
      .map(r => {
        const inst = institucionMap.get(r.id_institucion!);
        return {
          idInstitucion: r.id_institucion!,
          nombre: inst?.nombre ?? 'Desconocida',
          abreviatura: inst?.abreviatura ?? null,
          totalParticipantes: r._count.folio_registro,
        };
      });

    const totalParticipantes = data.reduce((sum, d) => sum + d.totalParticipantes, 0);

    return { success: true, data, totalParticipantes };
  } catch (error) {
    console.error('Error in obtenerReporteInstitucionesAction:', error);
    return { success: false, error: 'Error al obtener el reporte de instituciones' };
  }
}

export async function generarReporteInstitucionesPdfAction(): Promise<
  { success: true; data: { base64: string; nombreArchivo: string } } | { success: false; error: string }
> {
  try {
    await requireAdmin();

    const reporteResult = await obtenerReporteInstitucionesAction();
    if (!reporteResult.success) {
      return { success: false, error: reporteResult.error };
    }

    const pdfService = getPdfService();
    const pdfBuffer = await pdfService.generarReporteInstituciones({
      totalInstituciones: reporteResult.data.length,
      totalParticipantes: reporteResult.totalParticipantes,
      instituciones: reporteResult.data.map((inst, index) => ({
        numero: index + 1,
        nombre: inst.abreviatura ? `${inst.abreviatura} - ${inst.nombre}` : inst.nombre,
        totalParticipantes: inst.totalParticipantes,
      })),
    });

    const base64 = pdfBuffer.toString('base64');
    return {
      success: true,
      data: {
        base64,
        nombreArchivo: 'reporte_instituciones_participantes.pdf',
      },
    };
  } catch (error) {
    console.error('Error in generarReporteInstitucionesPdfAction:', error);
    return { success: false, error: 'Error al generar el reporte' };
  }
}
