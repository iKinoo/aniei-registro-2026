'use server';

import { getAdminQueryService, getUsuarioRepository, getCatalogoRepository, getEmailService, getStorageService, getAuthService, getAccesoRepository, getDepositoRepository, getFacturacionRepository, getInscripcionActividadRepository } from '@/infrastructure/config/container';
import { EnviarConfirmacion } from '@/application/use-cases/EnviarConfirmacion';
import { ObtenerUsuariosForAdmin } from '@/application/use-cases/ObtenerUsuariosForAdmin';
import { ObtenerAccesoArchivo } from '@/application/use-cases/ObtenerAccesoArchivo';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { prisma } from '@/infrastructure/database/client';

export async function getInstitucionesAction() {
  try {
    const data = await getCatalogoRepository().obtenerInstituciones();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error in getInstitucionesAction:', error);
    return { success: false as const, error: 'Error al obtener instituciones' };
  }
}

export async function getUsuariosAdminAction(page: number, limit: number, search?: string, idInstitucion?: number) {
  try {
    await requireAdmin();
    const adminService = getAdminQueryService();
    const obtenerUsuariosAdmin = new ObtenerUsuariosForAdmin(adminService);

    const result = await obtenerUsuariosAdmin.execute(page, limit, search, idInstitucion);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getUsuariosAdminAction:', error);
    return { success: false, error: 'Ocurrió un error al obtener usuarios' };
  }
}

export async function reenviarConstanciaAction(folioRegistro: string) {
  try {
    await requireAdmin();
    const enviarConfirmacion = new EnviarConfirmacion(
      getEmailService(),
      getUsuarioRepository(),
      getCatalogoRepository(),
      getStorageService()
    );

    await enviarConfirmacion.execute(folioRegistro);

    return { success: true, message: 'Constancia reenviada exitosamente' };
  } catch (error) {
    console.error(`Error in reenviarConstanciaAction for user ${folioRegistro}:`, error);
    return { success: false, error: 'Ocurrió un error al reenviar la constancia' };
  }
}

export async function obtenerUrlArchivoAction(ruta: string): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const obtenerAccesoArchivo = new ObtenerAccesoArchivo(getStorageService(), getAuthService(), getAccesoRepository());
    const signedUrl = await obtenerAccesoArchivo.execute(ruta);
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error(`Error in obtenerUrlArchivoAction for file ${ruta}:`, error);
    return { success: false, error: `${error}` };
  }
}

export async function eliminarUsuarioAction(folioRegistro: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    await requireAdmin();

    const usuario = await prisma.usuarios.findUnique({
      where: { folio_registro: folioRegistro },
      select: { correo: true },
    });

    if (!usuario) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.inscripcion_actividades.deleteMany({
        where: { folio_registro: folioRegistro },
      });

      const depositos = await tx.depositos.findMany({
        where: { folio_registro: folioRegistro },
        select: { archivo_url: true },
      });

      const storage = getStorageService();
      for (const dep of depositos) {
        if (dep.archivo_url) {
          try {
            await storage.eliminar(dep.archivo_url);
          } catch (e) {
            console.warn(`No se pudo eliminar archivo ${dep.archivo_url}:`, e);
          }
        }
      }

      await tx.facturaciones.deleteMany({
        where: { folio_registro: folioRegistro },
      });

      await tx.depositos.deleteMany({
        where: { folio_registro: folioRegistro },
      });

      await tx.usuarios.delete({
        where: { folio_registro: folioRegistro },
      });

      await tx.accesos.deleteMany({
        where: { folio_registro: folioRegistro },
      });
    });

    return { success: true, message: 'Usuario eliminado correctamente' };
  } catch (error) {
    console.error(`Error in eliminarUsuarioAction for folio ${folioRegistro}:`, error);
    return { success: false, error: 'Ocurrió un error al eliminar el usuario' };
  }
}
