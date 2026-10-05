'use server';

import { z } from 'zod';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import {
  getTransactionManager,
  getPasswordHasher,
  getPasswordGenerator,
  getEmailService,
} from '@/infrastructure/config/container';
import { CambiarContrasenaUsuario } from '@/application/use-cases/CambiarContrasenaUsuario';
import { CredencialesError } from '@/core/errors/CredencialesError';

const cambiarContrasenaSchema = z.object({
  password: z.string().trim().max(72).optional(),
});

export type CambiarContrasenaResultado =
  | { success: true; password: string; destinatario: string | null; correoEnviado: boolean }
  | { success: false; error: string };

export async function cambiarContrasenaAction(
  folioRegistro: string,
  password?: string
): Promise<CambiarContrasenaResultado> {
  try {
    await requireAdmin();

    const parsed = cambiarContrasenaSchema.safeParse({ password });
    if (!parsed.success) return { success: false, error: 'La contraseña es inválida' };

    const useCase = new CambiarContrasenaUsuario(
      getTransactionManager(),
      getPasswordHasher(),
      getPasswordGenerator(),
      getEmailService(),
    );
    const resultado = await useCase.ejecutar(folioRegistro, parsed.data.password || null);

    return {
      success: true,
      password: resultado.password,
      destinatario: resultado.destinatario,
      correoEnviado: resultado.correoEnviado,
    };
  } catch (error) {
    console.error(`Error in cambiarContrasenaAction for folio ${folioRegistro}:`, error);
    if (error instanceof CredencialesError) return { success: false, error: error.message };
    return { success: false, error: 'Ocurrió un error al cambiar la contraseña' };
  }
}
