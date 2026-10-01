'use server';

import { getAdminQueryService, getUsuarioRepository, getCatalogoRepository, getEmailService, getStorageService, getAuthService, getAccesoRepository, getDepositoRepository } from '@/infrastructure/config/container';
import { EnviarConfirmacion } from '@/application/use-cases/EnviarConfirmacion';
import { ObtenerUsuariosForAdmin } from '@/application/use-cases/ObtenerUsuariosForAdmin';
import { ObtenerAccesoArchivo } from '@/application/use-cases/ObtenerAccesoArchivo';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getTransactionManager } from '@/infrastructure/config/container';
import { ConsultarCatalogos } from '@/application/use-cases/ConsultarCatalogos';
import { GestionarUsuarios } from '@/application/use-cases/GestionarUsuarios';

export async function getInstitucionesAction() {
  try {
    await requireAdmin();
    const data = await new ConsultarCatalogos(getCatalogoRepository()).obtenerInstituciones();
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
    const obtenerAccesoArchivo = new ObtenerAccesoArchivo(getStorageService(), getAuthService(), getAccesoRepository(), getDepositoRepository());
    const signedUrl = await obtenerAccesoArchivo.execute(ruta);
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error(`Error in obtenerUrlArchivoAction for file ${ruta}:`, error);
    return { success: false, error: 'Error al obtener acceso al archivo' };
  }
}

export async function eliminarUsuarioAction(folioRegistro: string): Promise<{ success: true; message: string } | { success: false; error: string }> {
  try {
    await requireAdmin();

    await new GestionarUsuarios(getTransactionManager(), getStorageService()).eliminar(folioRegistro);

    return { success: true, message: 'Usuario eliminado correctamente' };
  } catch (error) {
    console.error(`Error in eliminarUsuarioAction for folio ${folioRegistro}:`, error);
    return { success: false, error: 'Ocurrió un error al eliminar el usuario' };
  }
}
