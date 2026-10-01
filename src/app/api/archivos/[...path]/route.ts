import { NextRequest, NextResponse } from 'next/server';
import { getStorageService, getAuthService, getAccesoRepository, getDepositoRepository,
  getEnlaceArchivoService } from '@/infrastructure/config/container';
import { DescargarArchivo } from '@/application/use-cases/DescargarArchivo';
import { ArchivoAccesoError } from '@/core/errors/ArchivoAccesoError';

const MIME_POR_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: segmentos } = await params;
    const ruta = (segmentos ?? []).join('/');
    const buffer = await new DescargarArchivo(getStorageService(), getAuthService(), getAccesoRepository(),
      getDepositoRepository(), getEnlaceArchivoService()).execute(ruta,
      request.nextUrl.searchParams.get('exp') ?? '', request.nextUrl.searchParams.get('sig') ?? '');
    const ext = (ruta.split('.').pop() ?? '').toLowerCase();
    const nombre = ruta.split('/').pop() ?? 'archivo';
    return new NextResponse(new Uint8Array(buffer), { status: 200, headers: {
      'Content-Type': MIME_POR_EXTENSION[ext] ?? 'application/octet-stream',
      'Content-Disposition': `inline; filename="${nombre.replace(/["\r\n]/g, '')}"`,
      'Cache-Control': 'private, max-age=60',
    } });
  } catch (error) {
    if (error instanceof ArchivoAccesoError) {
      const status = { ENLACE_INVALIDO: 401, ENLACE_EXPIRADO: 410, SIN_SESION: 401, PROHIBIDO: 403, NO_ENCONTRADO: 404 }[error.motivo];
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error('Error al descargar archivo:', error);
    return NextResponse.json({ error: 'Error al obtener archivo' }, { status: 500 });
  }
}
