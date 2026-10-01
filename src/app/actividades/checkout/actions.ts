'use server';

import { getActividadRepository, getUsuarioRepository, getTransactionManager, getStorageService,
  getCatalogoRepository, getEmailService, getIdGenerator } from '@/infrastructure/config/container';
import { requireUser } from '@/shared/auth/requireAdmin';
import { depositoSchema, facturacionSchema, validarArchivo } from '@/shared/validation/registro.schema';
import { ConfirmarInscripciones } from '@/application/use-cases/ConfirmarInscripciones';
import { GestionarActividades } from '@/application/use-cases/GestionarActividades';
import { ConsultarCatalogos } from '@/application/use-cases/ConsultarCatalogos';
import type { ConfirmacionInscripcionResult, CheckoutDTO } from '@/application/dtos/CheckoutDTO';
import { RegistroError } from '@/core/errors/RegistroError';

export type { ConfirmacionInscripcionResult } from '@/application/dtos/CheckoutDTO';

export async function getActividadesPorIdsAction(ids: number[]) {
  try {
    await requireUser();
    const data = await new GestionarActividades(getActividadRepository()).obtenerPorIds(ids);
    return { success: true as const, data };
  } catch (error) {
    console.error('Error al cargar carrito:', error);
    return { success: false as const, error: 'Error al cargar actividades del carrito' };
  }
}

export async function getEstadosCheckoutAction() {
  try {
    await requireUser();
    const data = await new ConsultarCatalogos(getCatalogoRepository()).obtenerEstados();
    return { success: true as const, data };
  } catch (error) {
    console.error('Error al cargar estados:', error);
    return { success: false as const, error: 'Error al cargar estados' };
  }
}

export async function confirmarInscripcionesAction(formData: FormData, idsActividades: number[], tieneCosto: boolean):
  Promise<{ success: false; errors: Record<string, string> } | ConfirmacionInscripcionResult> {
  try {
    const { folioRegistro } = await requireUser();
    const dto: CheckoutDTO = { idsActividades };
    const errors: Record<string, string> = {};
    if (tieneCosto) {
      const parsed = depositoSchema.safeParse(Object.fromEntries(formData.entries()));
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors[issue.path.join('.')] = issue.message;
        return { success: false, errors };
      }
      const file = formData.get('comprobante') as File;
      const archivoError = validarArchivo(file);
      if (archivoError) return { success: false, errors: { comprobante: archivoError } };
      dto.deposito = parsed.data;
      dto.archivo = { nombre: file.name, mime: file.type, tamanio: file.size, buffer: new Uint8Array(await file.arrayBuffer()) };
    }
    if (formData.get('requiereFacturacion') === 'true') {
      const parsed = facturacionSchema.safeParse(Object.fromEntries(formData.entries()));
      if (!parsed.success) {
        for (const issue of parsed.error.issues) errors[`facturacion.${issue.path.join('.')}`] = issue.message;
        return { success: false, errors };
      }
      dto.facturacion = parsed.data;
    }
    return await new ConfirmarInscripciones(getActividadRepository(), getUsuarioRepository(), getTransactionManager(),
      getStorageService(), getEmailService(), getIdGenerator()).execute(folioRegistro, dto);
  } catch (error) {
    console.error('Error al confirmar inscripciones:', error);
    return { success: false, errors: { _form: error instanceof RegistroError ? error.message : 'Error al confirmar las inscripciones' } };
  }
}
