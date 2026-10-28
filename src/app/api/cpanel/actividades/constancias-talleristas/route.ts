import { NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import {
  getActividadRepository,
  getPdfService,
  getZipService,
  reportarErrorEnAccion,
} from '@/infrastructure/config/container';
import { DescargarConstanciasTalleristas } from '@/application/use-cases/DescargarConstanciasTalleristas';

function respuestaAcceso(error: unknown): NextResponse | null {
  if (!(error instanceof Error)) return null;
  if (error.message === 'UNAUTHORIZED') {
    return NextResponse.json(
      { error: 'Inicia sesión como administrador para descargar las constancias.' },
      { status: 401 },
    );
  }
  if (error.message === 'FORBIDDEN') {
    return NextResponse.json(
      { error: 'Solo un administrador puede descargar las constancias.' },
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
    reportarErrorEnAccion('Error al verificar acceso para descargar constancias de talleristas', error);
    return NextResponse.json({ error: 'No se pudo verificar el acceso.' }, { status: 500 });
  }

  try {
    const resultado = await new DescargarConstanciasTalleristas(
      getActividadRepository(),
      getPdfService(),
      getZipService(),
    ).ejecutar();

    if (!resultado) {
      return NextResponse.json(
        { error: 'No hay talleres con talleristas asignados para descargar.' },
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
    reportarErrorEnAccion('Error al generar el ZIP de constancias de talleristas', error);
    return NextResponse.json(
      { error: 'No se pudieron generar las constancias de los talleristas.' },
      { status: 500 },
    );
  }
}
