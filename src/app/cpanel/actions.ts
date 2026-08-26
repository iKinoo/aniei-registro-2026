'use server';

import { getAdminQueryService, getUsuarioRepository, getCatalogoRepository, getEmailService, getStorageService, getAuthService, getAccesoRepository } from '@/infrastructure/config/container';
import { EnviarConfirmacion } from '@/application/use-cases/EnviarConfirmacion';
import { ObtenerUsuariosForAdmin } from '@/application/use-cases/ObtenerUsuariosForAdmin';
import { ObtenerAccesoArchivo } from '@/application/use-cases/ObtenerAccesoArchivo';
import { requireAdmin } from '@/shared/auth/requireAdmin';

export async function getUsuariosAdminAction(page: number, limit: number, search?: string) {
  try {
    await requireAdmin();
    const adminService = getAdminQueryService();
    const obtenerUsuariosAdmin = new ObtenerUsuariosForAdmin(adminService);

    const result = await obtenerUsuariosAdmin.execute(page, limit, search);
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
