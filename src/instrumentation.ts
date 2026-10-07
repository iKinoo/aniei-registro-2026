import type { Instrumentation } from 'next';

const DIGESTS_ESPERADOS = /^NEXT_(NOT_FOUND|REDIRECT\b)/;

export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const digest =
    typeof err === 'object' && err !== null && 'digest' in err
      ? String((err as { digest?: unknown }).digest)
      : undefined;
  if (digest && DIGESTS_ESPERADOS.test(digest)) return;
  if (request.path.startsWith('/_next/')) return;
  const { getAlertaErrorService } = await import('@/infrastructure/config/alertas');
  const mensaje = err instanceof Error ? err.message : String(err);
  const ruta = `${request.method} ${request.path}`;
  try {
    await getAlertaErrorService().notificarError({
      contexto: `onRequestError (${context.routeType}) ${context.routePath}`,
      mensaje: mensaje.slice(0, 500),
      stack: err instanceof Error ? err.stack : undefined,
      origen: 'framework',
      entorno: process.env.NODE_ENV ?? 'desconocido',
      timestamp: new Date().toISOString(),
      ruta: digest ? `${ruta} — digest: ${digest}` : ruta,
    });
  } catch (error) {
    console.error('No se pudo enviar la alerta de error desde onRequestError:', error);
  }
};
