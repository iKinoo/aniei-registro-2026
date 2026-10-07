'use server';

import { z } from 'zod';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getPonentesRepository, getActividadRepository, getRegistroQueryService, getEmailService,
  getTransactionManager, getPasswordHasher, getPasswordGenerator, reportarErrorEnAccion } from '@/infrastructure/config/container';
import { GestionarPonentes, RegistrarPonente } from '@/application/use-cases/GestionarPonentes';
import { ConsultarRegistros } from '@/application/use-cases/ConsultarRegistros';
import type { PonenteDTO } from '@/application/dtos/ActividadDTO';
import type { RegistroPonenteDTO } from '@/application/dtos/ActualizarUsuarioDTO';
import { RegistroError } from '@/core/errors/RegistroError';


export interface UsuarioBusquedaResult {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
}

export async function buscarUsuariosAction(query: string): Promise<{ success: true; data: UsuarioBusquedaResult[] } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const data = await new ConsultarRegistros(getRegistroQueryService()).buscarUsuarios(query);
    return { success: true, data };
  } catch {
    return { success: false, error: 'Error al gestionar ponentes' };
  }
}


export async function vincularPonenteAction(
  idActividad: number,
  folioRegistro: string,
  rol: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await new GestionarPonentes(getPonentesRepository()).vincular(idActividad, folioRegistro, rol);
    return { success: true };
  } catch {
    return { success: false, error: 'Error al gestionar ponentes' };
  }
}

export async function desvincularPonenteAction(
  idActividad: number,
  folioRegistro: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await new GestionarPonentes(getPonentesRepository()).desvincular(idActividad, folioRegistro);
    return { success: true };
  } catch {
    return { success: false, error: 'Error al gestionar ponentes' };
  }
}

export async function obtenerPonentesPorActividadAction(
  idActividad: number,
): Promise<{ success: true; data: PonenteDTO[] } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const data = await new GestionarPonentes(getPonentesRepository()).obtenerPorActividad(idActividad);
    return { success: true, data };
  } catch {
    return { success: false, error: 'Error al gestionar ponentes' };
  }
}


export type RegistroPonenteInput = RegistroPonenteDTO;

const registroPonenteSchema = z.object({
  nombre: z.string().trim().min(1).max(125), apellido: z.string().trim().min(1).max(256),
  correo: z.string().email().max(100), idInstitucion: z.number().int().positive().optional(),
  telefono: z.string().max(20).optional(), idTitulo: z.number().int().nonnegative().optional(),
  idTipoParticipante: z.number().int().nonnegative().optional(),
});

export async function registrarPonenteAction(
  datos: RegistroPonenteInput,
  idActividad: number,
  rol: string,
): Promise<{ success: true; folioRegistro: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const parsed = registroPonenteSchema.safeParse(datos);
    if (!parsed.success) return { success: false, error: 'Los datos del ponente son inválidos' };
    const folioRegistro = await new RegistrarPonente(getTransactionManager(), getActividadRepository(),
      getPasswordHasher(), getPasswordGenerator(), getEmailService()).execute(parsed.data, idActividad, rol);

    return { success: true, folioRegistro };
  } catch (e) {
    if (e instanceof RegistroError) return { success: false, error: e.message };
    reportarErrorEnAccion('Error al registrar ponente', e);
    return { success: false, error: 'Error al registrar ponente' };
  }
}
