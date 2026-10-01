import { RegistroError } from '@/core/errors/RegistroError';

function extraerError(error: unknown): { code?: string; meta?: { target?: unknown } } | null {
  if (!error || typeof error !== 'object') return null;
  if ('code' in error && typeof error.code === 'string') {
    return { code: error.code, meta: 'meta' in error && error.meta && typeof error.meta === 'object' ? error.meta : undefined };
  }
  return 'cause' in error ? extraerError(error.cause) : null;
}

export function mapPrismaError(error: unknown, fallbackCorreo?: string): Error | null {
  const info = extraerError(error);
  if (!info) return null;
  if (info.code === 'P2002') {
    const raw = info.meta?.target;
    const target = Array.isArray(raw) ? raw.join(',') : typeof raw === 'string' ? raw : '';
    if (target.includes('correo') || target.includes('email')) return RegistroError.CORREO_DUPLICADO(fallbackCorreo ?? 'proporcionado');
    return new RegistroError('Ya existe un registro con los datos proporcionados', 'P2002');
  }
  const errores: Record<string, [string, string]> = {
    P2003: ['Referencia a catálogo inexistente', 'FK_INVALIDA'],
    P2025: ['Registro no encontrado', 'NO_ENCONTRADO'],
    P2024: ['Timeout de transacción, intente de nuevo', 'TX_TIMEOUT'],
    P2034: ['Transacción en conflicto, intente de nuevo', 'TX_CONFLICTO'],
  };
  const datos = info.code ? errores[info.code] : undefined;
  return datos ? new RegistroError(...datos) : null;
}
