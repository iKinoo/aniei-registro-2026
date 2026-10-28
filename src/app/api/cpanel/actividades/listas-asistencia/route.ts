import { NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import {
  getActividadRepository,
  getInscripcionActividadRepository,
  getPdfService,
  getZipService,
  reportarErrorEnAccion,
} from '@/infrastructure/config/container';
import { DescargarListasAsistencia } from '@/application/use-cases/DescargarListasAsistencia';

function respuestaAcceso(error: unknown): NextResponse | null {
  if (!(error instanceof Error)) return null;
  if (error.message === 'UNAUTHORIZED') {
    return NextResponse.json(
      { error: 'Inicia sesión como administrador para descargar las listas.' },
      { status: 401 },
    );
  }
  if (error.message === 'FORBIDDEN') {
    return NextResponse.json(
      { error: 'Solo un administrador puede descargar las listas.' },
      { status: 403 },
    );
  }
  return null;
}

export async function GET() {
  try {
    await requireAdmin();
  } catch (error) {
    const respuesta = respuestaAcceso(error);
    if (respuesta) return respuesta;
    reportarErrorEnAccion('Error al verificar acceso para descargar listas de asistencia', error);
    return NextResponse.json({ error: 'No se pudo verificar el acceso.' }, { status: 500 });
  }

  try {
    const resultado = await new DescargarListasAsistencia(
      getActividadRepository(),
      getInscripcionActividadRepository(),
      getPdfService(),
      getZipService(),
    ).ejecutar();

    if (!resultado) {
      return NextResponse.json(
        { error: 'No hay actividades registradas para descargar.' },
        { status: 404 },
      );
    }

    return new NextResponse(new Uint8Array(resultado.contenido), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${resultado.nombreArchivo}"`,
        'Content-Length': String(resultado.contenido.byteLength),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    reportarErrorEnAccion('Error al generar el ZIP de listas de asistencia', error);
    return NextResponse.json(
      { error: 'No se pudieron generar las listas de asistencia.' },
      { status: 500 },
    );
  }
}
