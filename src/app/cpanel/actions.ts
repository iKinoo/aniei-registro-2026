'use server';

import { getAdminQueryService, getUsuarioRepository, getCatalogoRepository, getEmailService } from '@/infrastructure/config/container';
import { EnviarConfirmacion } from '@/application/use-cases/EnviarConfirmacion';

export async function getUsuariosAdminAction(page: number, limit: number, search?: string) {
  try {
    const adminService = getAdminQueryService();
    // In next.js server actions, you normally can just return serializable objects.
    const result = await adminService.obtenerUsuariosAdmin(page, limit, search);
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
