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
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';
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
): Promise<{ success: true; folioRegistro: string } | { success: false; error: string }> {
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
    const folioRegistro = usuarioPersistido.folioRegistro!;

    // 4. Generar credenciales
    const generatedPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    await getAccesoRepository().crear(
      datos.correo,
      passwordHash,
      'USER',
      folioRegistro,
      `${datos.nombre} ${datos.apellido}`,
    );

    // 5. Asignar folio
    const folio = folioRegistro;

    // 6. Vincular como ponente de la actividad
    await getPonentesRepository().vincular(idActividad, folioRegistro, rol || 'Ponente');

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

    return { success: true, folioRegistro };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { success: false, error: msg };
  }
}
