'use server';

import { registroSchema, validarArchivo } from '@/shared/validation/registro.schema';
import { RegistrarUsuario } from '@/application/use-cases/RegistrarUsuario';
import { Genero } from '@/core/enums/Genero';
import {
  getUsuarioRepository,
  getComprobantePagoRepository,
  getStorageService,
  getEmailService,
  getPdfService,
  getCatalogoRepository,
} from '@/infrastructure/config/container';

export interface RegistroActionState {
  success: boolean;
  folio?: string;
  correo?: string;
  errors?: Record<string, string>;
}

export async function registrarUsuarioAction(
  _prevState: RegistroActionState,
  formData: FormData,
): Promise<RegistroActionState> {
  try {
    // Extraer campos del formulario
    const rawData = {
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
      correo: formData.get('correo') as string,
      telefono: formData.get('telefono') as string,
      lada: formData.get('lada') as string,
      extension: formData.get('extension') as string,
      genero: formData.get('genero') as string,
      carrera: formData.get('carrera') as string,
      dependencia: formData.get('dependencia') as string,
      idCargo: formData.get('idCargo') as string,
      idTipoUsuario: formData.get('idTipoUsuario') as string,
      idInstitucion: formData.get('idInstitucion') as string,
      idEntidadFederativa: formData.get('idEntidadFederativa') as string,
    };

    // Validar campos con Zod
    const parsed = registroSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return { success: false, errors: fieldErrors };
    }

    // Validar archivo
    const file = formData.get('comprobante') as File;
    const archivoError = validarArchivo(file);
    if (archivoError) {
      return { success: false, errors: { comprobante: archivoError } };
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ejecutar caso de uso
    const useCase = new RegistrarUsuario(
      getUsuarioRepository(),
      getComprobantePagoRepository(),
      getStorageService(),
      getEmailService(),
      getPdfService(),
      getCatalogoRepository(),
    );

    const resultado = await useCase.execute({
      ...parsed.data,
      telefono: parsed.data.telefono || null,
      lada: parsed.data.lada || null,
      extension: parsed.data.extension || null,
      genero: parsed.data.genero as Genero,
      carrera: parsed.data.carrera || null,
      dependencia: parsed.data.dependencia || null,
      archivo: {
        nombre: file.name,
        mime: file.type,
        tamanio: file.size,
        buffer,
      },
    });

    return {
      success: true,
      folio: resultado.folio,
      correo: resultado.correo,
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const domainError = error as Error & { code: string };
      if (domainError.code === 'CORREO_DUPLICADO') {
        return { success: false, errors: { correo: domainError.message } };
      }
    }
    console.error('Error en registro:', error);
    return { success: false, errors: { _form: 'Ocurrió un error inesperado. Intente de nuevo.' } };
  }
}
