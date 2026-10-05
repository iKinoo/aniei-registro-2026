'use server';

import { z } from 'zod';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { reportarErrorEnAccion, getTransactionManager, getStorageService } from '@/infrastructure/config/container';
import { GestionarUsuarios } from '@/application/use-cases/GestionarUsuarios';

export type { ActualizarUsuarioDTO as UsuarioEditarData } from '@/application/dtos/ActualizarUsuarioDTO';
import type { ActualizarUsuarioDTO as UsuarioEditarData } from '@/application/dtos/ActualizarUsuarioDTO';

const actualizarUsuarioSchema = z.object({
  nombre: z.string().trim().min(1).max(125), apellido: z.string().trim().min(1).max(256),
  correo: z.string().email().max(100), telefono: z.string().max(20).nullable(),
  lada: z.string().max(10).nullable(), extension: z.string().max(10).nullable(),
  genero: z.enum(['M', 'F', 'O']).nullable(), carrera: z.string().max(128).nullable(),
  dependencia: z.string().max(256).nullable(), idTitulo: z.number().int().positive().nullable(),
  idInstitucion: z.number().int().positive().nullable(), idEntidadFederativa: z.number().int().positive().nullable(),
});

export async function actualizarUsuarioAction(
  folioRegistro: string,
  data: UsuarioEditarData
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    await requireAdmin();

    const parsed = actualizarUsuarioSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: 'Los datos del usuario son inválidos' };
    await new GestionarUsuarios(getTransactionManager(), getStorageService()).actualizar(folioRegistro, parsed.data);

    return { success: true, message: 'Usuario actualizado correctamente' };
  } catch (error) {
    reportarErrorEnAccion(`Error in actualizarUsuarioAction for folio ${folioRegistro}`, error);
    return { success: false, error: 'Ocurrió un error al actualizar el usuario' };
  }
}
