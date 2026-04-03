'use server';

import { getAdminQueryService, getUsuarioRepository, getCatalogoRepository, getEmailService } from '@/infrastructure/config/container';
import { EnviarConfirmacion } from '@/application/use-cases/EnviarConfirmacion';
import { ObtenerUsuariosForAdmin } from '@/application/use-cases/ObtenerUsuariosForAdmin';

export async function getUsuariosAdminAction(page: number, limit: number, search?: string) {
  try {
    const adminService = getAdminQueryService();
    const obtenerUsuariosAdmin = new ObtenerUsuariosForAdmin(adminService);

    const result = await obtenerUsuariosAdmin.execute(page, limit, search);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getUsuariosAdminAction:', error);
    return { success: false, error: 'Ocurrió un error al obtener usuarios' };
  }
}

export async function reenviarConstanciaAction(idUsuario: number) {
  try {
    const enviarConfirmacion = new EnviarConfirmacion(
      getEmailService(),
      getUsuarioRepository(),
      getCatalogoRepository()
    );

    await enviarConfirmacion.execute(idUsuario);

    return { success: true, message: 'Constancia reenviada exitosamente' };
  } catch (error) {
    console.error(`Error in reenviarConstanciaAction for user ${idUsuario}:`, error);
    return { success: false, error: 'Ocurrió un error al reenviar la constancia' };
  }
}
