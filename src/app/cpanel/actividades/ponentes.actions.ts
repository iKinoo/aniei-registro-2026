'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/infrastructure/database/client';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import {
  getPonentesRepository,
  getUsuarioRepository,
  getAccesoRepository,
  getCatalogoRepository,
  getEmailService,
} from '@/infrastructure/config/container';
import { Genero } from '@/core/enums/Genero';
import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { PonenteDTO } from '@/application/dtos/ActividadDTO';

// ---------- Búsqueda de usuarios ----------

export interface UsuarioBusquedaResult {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
}

export async function buscarUsuariosAction(query: string): Promise<{ success: true; data: UsuarioBusquedaResult[] } | { success: false; error: string }> {
  if (!query || query.trim().length < 2) return { success: true, data: [] };
  try {
    await requireAdmin();
    const q = query.trim();
    const rows = await prisma.usuarios.findMany({
      where: {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
          { correo: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { folio_registro: true, nombre: true, apellido: true, correo: true },
      take: 10,
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
    return {
      success: true,
      data: rows.map((r) => ({
        folioRegistro: r.folio_registro,
        nombre: r.nombre,
        apellido: r.apellido,
        correo: r.correo,
      })),
    };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ---------- Vincular / desvincular ponente ----------

export async function vincularPonenteAction(
  idActividad: number,
  folioRegistro: string,
  rol: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await getPonentesRepository().vincular(idActividad, folioRegistro, rol || 'Ponente');
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function desvincularPonenteAction(
  idActividad: number,
  folioRegistro: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();
    await getPonentesRepository().desvincular(idActividad, folioRegistro);
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function obtenerPonentesPorActividadAction(
  idActividad: number,
): Promise<{ success: true; data: PonenteDTO[] } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const data = await getPonentesRepository().obtenerPorActividad(idActividad);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

// ---------- Registro rápido de ponente ----------

export interface RegistroPonenteInput {
  nombre: string;
  apellido: string;
  correo: string;
  idInstitucion?: number;
  telefono?: string;
  idTitulo?: number;
  idTipoParticipante?: number;
}

export async function registrarPonenteAction(
  datos: RegistroPonenteInput,
  idActividad: number,
  rol: string,
): Promise<{ success: true; folioRegistro: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const correoVO = Email.create(datos.correo);
    const usuarioRepo = getUsuarioRepository();

    let nombreActividad = '';
    const actividadExiste = idActividad > 0;
    if (actividadExiste) {
      try {
        const act = await prisma.actividades.findUnique({
          where: { id_actividad: idActividad },
          select: { nombre: true },
        });
        nombreActividad = act?.nombre ?? '';
      } catch { /* best-effort */ }
    }

    const usuario = Usuario.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: correoVO,
      telefono: null,
      genero: Genero.OTRO,
      carrera: null,
      dependencia: null,
      idTitulo: datos.idTitulo ?? 0,
      idTipoParticipante: datos.idTipoParticipante ?? 0,
      idInstitucion: datos.idInstitucion ?? null,
      idEntidadFederativa: 0,
    });

    const usuarioPersistido = await usuarioRepo.crear(usuario);
    const folioRegistro = usuarioPersistido.folioRegistro!;

    const { generateSecurePassword } = await import('@/shared/security/password');
    const generatedPassword = generateSecurePassword(12, false);
    const passwordHash = await bcrypt.hash(generatedPassword, 10);

    const accesoRepo = getAccesoRepository();
    await accesoRepo.crear(
      passwordHash,
      'USER',
      folioRegistro,
      `${datos.nombre} ${datos.apellido}`,
      datos.correo,
    );

    const folio = folioRegistro;

    if (actividadExiste) {
      await getPonentesRepository().vincular(idActividad, folioRegistro, rol || 'Ponente');
    }

    try {
      await getEmailService().enviarNotificacionPonente(datos.correo, {
        nombre: datos.nombre,
        apellido: datos.apellido,
        folio: folioRegistro,
        password: generatedPassword,
        nombreActividad,
        rol: rol || 'Ponente',
      });
    } catch (emailErr) {
      console.error('Error al enviar correo de ponente:', emailErr);
    }

    return { success: true, folioRegistro };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}
