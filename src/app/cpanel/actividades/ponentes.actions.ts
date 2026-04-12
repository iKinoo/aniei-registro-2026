'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/infrastructure/database/client';
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
import { FolioRecibo } from '@/core/value-objects/FolioRecibo';
import { PonenteDTO } from '@/application/dtos/ActividadDTO';

// ---------- Búsqueda de usuarios ----------

export interface UsuarioBusquedaResult {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
}

export async function buscarUsuariosAction(query: string): Promise<{ success: true; data: UsuarioBusquedaResult[] } | { success: false; error: string }> {
  if (!query || query.trim().length < 2) return { success: true, data: [] };
  try {
    const q = query.trim();
    const rows = await prisma.usuarios.findMany({
      where: {
        OR: [
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
          { correo: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id_usuario: true, nombre: true, apellido: true, correo: true },
      take: 10,
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
    return {
      success: true,
      data: rows.map((r) => ({
        idUsuario: r.id_usuario,
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
  idUsuario: number,
  rol: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await getPonentesRepository().vincular(idActividad, idUsuario, rol || 'Ponente');
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function desvincularPonenteAction(
  idActividad: number,
  idUsuario: number,
): Promise<{ success: boolean; error?: string }> {
  try {
    await getPonentesRepository().desvincular(idActividad, idUsuario);
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}

export async function obtenerPonentesPorActividadAction(
  idActividad: number,
): Promise<{ success: true; data: PonenteDTO[] } | { success: false; error: string }> {
  try {
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
  idCargo?: number;
  idTipoUsuario?: number;
}

export async function registrarPonenteAction(
  datos: RegistroPonenteInput,
  idActividad: number,
  rol: string,
): Promise<{ success: true; idUsuario: number } | { success: false; error: string }> {
  try {
    // 1. Verificar correo duplicado
    const correoVO = Email.create(datos.correo);
    const usuarioRepo = getUsuarioRepository();
    const existente = await usuarioRepo.buscarPorCorreo(correoVO);
    if (existente) {
      return { success: false, error: `El correo ${datos.correo} ya está registrado en el sistema.` };
    }

    // 2. Obtener institución name para correo
    const catalogoRepo = getCatalogoRepository();
    let nombreActividad = '';
    try {
      const act = await prisma.actividades.findUnique({
        where: { id_actividad: idActividad },
        select: { nombre: true },
      });
      nombreActividad = act?.nombre ?? '';
    } catch { /* best-effort */ }

    // 3. Crear entidad Usuario (sin deposito ni facturación)
    // Se usan valores por defecto para campos requeridos no provistos en el registro simplificado
    const usuario = Usuario.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      correo: correoVO,
      telefono: null,
      genero: Genero.OTRO,
      carrera: null,
      dependencia: null,
      idCargo: datos.idCargo ?? 0,
      idTipoUsuario: datos.idTipoUsuario ?? 0,
      idInstitucion: datos.idInstitucion ?? 0,
      idEntidadFederativa: 0,
    });

    const usuarioPersistido = await usuarioRepo.crear(usuario);
    const idUsuario = usuarioPersistido.idUsuario!;

    // 4. Generar credenciales
    const generatedPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    await getAccesoRepository().crear(
      datos.correo,
      passwordHash,
      'USER',
      idUsuario,
      `${datos.nombre} ${datos.apellido}`,
    );

    // 5. Asignar folio
    const folio = `ANIEI-2026-${String(idUsuario).padStart(4, '0')}`;
    const folioVO = FolioRecibo.create(folio);
    usuarioPersistido.asignarFolio(folioVO);
    await usuarioRepo.actualizarFolio(idUsuario, folioVO);

    // 6. Vincular como ponente de la actividad
    await getPonentesRepository().vincular(idActividad, idUsuario, rol || 'Ponente');

    // 7. Enviar correo de notificación (best-effort)
    try {
      await getEmailService().enviarNotificacionPonente(datos.correo, {
        nombre: datos.nombre,
        apellido: datos.apellido,
        correo: datos.correo,
        password: generatedPassword,
        nombreActividad,
        rol: rol || 'Ponente',
      });
    } catch (emailErr) {
      console.error('Error al enviar correo de ponente:', emailErr);
    }

    return { success: true, idUsuario };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}
