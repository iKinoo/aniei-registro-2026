'use server';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { prisma } from '@/infrastructure/database/client';

export interface UsuarioEditarData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  lada: string | null;
  extension: string | null;
  genero: string | null;
  carrera: string | null;
  dependencia: string | null;
  idTitulo: number | null;
  idInstitucion: number | null;
  idEntidadFederativa: number | null;
}

export async function actualizarUsuarioAction(
  folioRegistro: string,
  data: UsuarioEditarData
): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    await requireAdmin();

    await prisma.usuarios.update({
      where: { folio_registro: folioRegistro },
      data: {
        nombre: data.nombre,
        apellido: data.apellido,
        correo: data.correo,
        telefono: data.telefono,
        lada: data.lada,
        extension: data.extension,
        genero: data.genero,
        carrera: data.carrera,
        dependencia: data.dependencia,
        id_titulo: data.idTitulo,
        id_institucion: data.idInstitucion,
        id_entidad_federativa: data.idEntidadFederativa,
      },
    });

    return { success: true, message: 'Usuario actualizado correctamente' };
  } catch (error) {
    console.error(`Error in actualizarUsuarioAction for folio ${folioRegistro}:`, error);
    return { success: false, error: 'Ocurrió un error al actualizar el usuario' };
  }
}
