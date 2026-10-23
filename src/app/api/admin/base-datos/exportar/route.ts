import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getExportacionBaseDatosService, reportarErrorEnAccion } from '@/infrastructure/config/container';
import { ExportarBaseDatos } from '@/application/use-cases/ExportarBaseDatos';
import { ExportacionBaseDatosError, type MotivoExportacionBaseDatos } from '@/core/errors/ExportacionBaseDatosError';
import type { CancelacionExportacion } from '@/application/ports/IExportacionBaseDatosService';
import type { ExportacionBaseDatosDTO } from '@/application/dtos/ExportacionBaseDatosDTO';

const ESTADO_POR_MOTIVO: Record<MotivoExportacionBaseDatos, number> = {
  CONCURRENCIA: 409,
  SIN_CONFIGURAR: 503,
  BINARIO_NO_DISPONIBLE: 503,
  TIMEOUT: 504,
  TAMANO_EXCEDIDO: 413,
  CANCELADO: 500,
  FALLO: 500,
};

const MOTIVOS_ESPERADOS: MotivoExportacionBaseDatos[] = ['CONCURRENCIA', 'CANCELADO'];

function crearCancelacion(signal: AbortSignal): CancelacionExportacion {
  const callbacks: Array<() => void> = [];
  let cancelada = signal.aborted;
  if (!cancelada) {
    signal.addEventListener('abort', () => {
      if (cancelada) return;
      cancelada = true;
      for (const callback of callbacks) {
        try {
          callback();
        } catch {
          /* la infraestructura ya registra su propio fallo */
        }
      }
    }, { once: true });
  }
  return {
    estaCancelada: () => cancelada,
    alCancelar: (callback: () => void) => {
      if (cancelada) {
        callback();
      } else {
        callbacks.push(callback);
      }
    },
  };
}

function mismoOrigen(request: NextRequest): boolean {
  const origen = request.headers.get('origin');
  if (!origen) return false;
  const publico = process.env.NEXT_PUBLIC_APP_URL;
  try {
    return origen === new URL(publico ?? request.nextUrl.origin).origin;
  } catch {
    return origen === request.nextUrl.origin;
  }
}

function errorEsperado(error: unknown): boolean {
  const mensaje = error instanceof Error ? error.message : '';
  return mensaje === 'UNAUTHORIZED' || mensaje === 'FORBIDDEN';
}

function respuestaDesdeError(error: unknown): NextResponse {
  if (error instanceof ExportacionBaseDatosError) {
    if (!MOTIVOS_ESPERADOS.includes(error.motivo)) {
      reportarErrorEnAccion('Error al exportar la base de datos', new Error(`ExportacionBaseDatosError:${error.motivo}`));
    }
    return NextResponse.json({ error: error.message }, { status: ESTADO_POR_MOTIVO[error.motivo] });
  }
  if (errorEsperado(error)) {
    const noAutenticado = error instanceof Error && error.message === 'UNAUTHORIZED';
    return NextResponse.json(
      { error: noAutenticado ? 'Inicia sesión como administrador para descargar la base de datos.' : 'Solo un administrador puede descargar la base de datos.' },
      { status: noAutenticado ? 401 : 403 },
    );
  }
  reportarErrorEnAccion('Error no tipado al exportar la base de datos', error);
  return NextResponse.json({ error: 'No se pudo generar el respaldo de la base de datos. Inténtalo de nuevo.' }, { status: 500 });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    return respuestaDesdeError(error);
  }

  if (!mismoOrigen(request)) {
    return NextResponse.json({ error: 'El origen de la solicitud no está permitido.' }, { status: 403 });
  }

  let dto: ExportacionBaseDatosDTO;
  try {
    dto = await new ExportarBaseDatos(getExportacionBaseDatosService()).ejecutar(crearCancelacion(request.signal));
  } catch (error) {
    return respuestaDesdeError(error);
  }

  request.signal.addEventListener('abort', () => {
    void dto.liberar();
  }, { once: true });

  try {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const bloque of dto.contenido) {
            controller.enqueue(bloque);
          }
          controller.close();
        } catch (error) {
          void dto.liberar();
          if (!errorEsperado(error)) {
            reportarErrorEnAccion('Error al transmitir el respaldo de la base de datos', new Error(`ExportacionBaseDatosError:${error instanceof ExportacionBaseDatosError ? error.motivo : 'desconocido'}`));
          }
          controller.error(error);
        }
      },
      cancel: () => dto.liberar(),
    });
    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': `attachment; filename="${dto.nombreArchivo.replace(/["\r\n]/g, '')}"`,
        'Content-Length': String(dto.tamanoBytes),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    await dto.liberar();
    reportarErrorEnAccion('Error al preparar la descarga del respaldo', error);
    return NextResponse.json({ error: 'No se pudo preparar la descarga del respaldo. Inténtalo de nuevo.' }, { status: 500 });
  }
}
