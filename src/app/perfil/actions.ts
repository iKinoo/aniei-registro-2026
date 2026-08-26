'use server';

import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { getStorageService } from '@/infrastructure/config/container';
import { parseFileReference } from '@/application/ports/IStorageService';

export async function obtenerUrlComprobanteAction(ruta: string): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, error: 'Sesión inválida' };
    }

    const acceso = await prisma.accesos.findUnique({
      where: { email: session.user.email },
      select: { folio_registro: true, rol: true },
    });

    if (!acceso) {
      return { success: false, error: 'Acceso no encontrado' };
    }

    const isAdmin = acceso.rol?.toUpperCase() === 'ADMIN';

    if (!isAdmin) {
      if (!acceso.folio_registro) {
        return { success: false, error: 'No autorizado: cuenta sin folio de registro' };
      }
      const deposito = await prisma.depositos.findFirst({
        where: { folio_registro: acceso.folio_registro, archivo_url: ruta },
        select: { id_deposito: true },
      });
      if (!deposito) {
        return { success: false, error: 'No autorizado: el archivo no pertenece a tu cuenta' };
      }
    }

    const storage = getStorageService();
    const file = parseFileReference(ruta);
    const signedUrl = await storage.getAccess(file);
    return { success: true, url: signedUrl };
  } catch (error) {
    console.error(`Error in obtenerUrlComprobanteAction for file ${ruta}:`, error);
    return { success: false, error: `${error}` };
  }
}
