import { Prisma } from '@/generated/prisma/client';
import { RegistroError } from '@/core/errors/RegistroError';

export function mapPrismaError(e: unknown, fallbackCorreo?: string): Error | null {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002 unique constraint
    if (e.code === 'P2002') {
      const target = (e.meta?.target as string[] | undefined)?.join(',') ?? '';
      if (target.includes('correo') || target.includes('email')) {
        return RegistroError.CORREO_DUPLICADO(fallbackCorreo ?? 'correo');
      }
      return new RegistroError(`Restricción única violada: ${target}`, 'P2002');
    }
    if (e.code === 'P2003') {
      return new RegistroError(`Referencia a catálogo inexistente (FK): ${(e.meta?.field_name as string) ?? ''}`, 'FK_INVALIDA');
    }
    if (e.code === 'P2025') {
      return new RegistroError('Registro no encontrado', 'NO_ENCONTRADO');
    }
    if (e.code === 'P2024') {
      return new RegistroError('Timeout de transacción, intente de nuevo', 'TX_TIMEOUT');
    }
    if (e.code === 'P2034') {
      return new RegistroError('Transacción en conflicto, intente de nuevo', 'TX_CONFLICTO');
    }
  }
  // DriverAdapterError wraps Prisma code in cause
  const anyErr = e as { code?: string; cause?: { code?: string; meta?: { target?: string[] } }; meta?: { target?: string[] } };
  const code = anyErr.code ?? anyErr.cause?.code;
  if (code === 'P2002') {
    const target = (anyErr.meta?.target ?? anyErr.cause?.meta?.target)?.join(',') ?? '';
    if (target.includes('correo') || target.includes('email')) {
      return RegistroError.CORREO_DUPLICADO(fallbackCorreo ?? 'correo');
    }
    return new RegistroError(`Restricción única violada: ${target}`, 'P2002');
  }
  return null;
}
