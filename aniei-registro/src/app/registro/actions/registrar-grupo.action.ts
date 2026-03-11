'use server';

import { grupoSchema } from '@/shared/validation/grupo.schema';
import { validarArchivo } from '@/shared/validation/registro.schema';
import { RegistrarGrupo } from '@/application/use-cases/RegistrarGrupo';
import { Genero } from '@/core/enums/Genero';
import {
  getUsuarioRepository,
  getComprobantePagoRepository,
  getStorageService,
  getEmailService,
  getPdfService,
  getCatalogoRepository,
} from '@/infrastructure/config/container';

export interface GrupoActionState {
  success: boolean;
  totalRegistrados?: number;
  folios?: string[];
  errors?: Record<string, string>;
}

export async function registrarGrupoAction(
  _prevState: GrupoActionState,
  formData: FormData,
): Promise<GrupoActionState> {
  try {
    // Parse responsable data
    const responsable = {
      nombre: formData.get('resp_nombre') as string,
      apellido: formData.get('resp_apellido') as string,
      correo: formData.get('resp_correo') as string,
      telefono: formData.get('resp_telefono') as string,
      lada: formData.get('resp_lada') as string,
      extension: formData.get('resp_extension') as string,
      genero: formData.get('resp_genero') as string,
      carrera: formData.get('resp_carrera') as string,
      dependencia: formData.get('resp_dependencia') as string,
      idCargo: formData.get('resp_idCargo') as string,
      idTipoUsuario: formData.get('resp_idTipoUsuario') as string,
      idInstitucion: formData.get('resp_idInstitucion') as string,
      idEntidadFederativa: formData.get('resp_idEntidadFederativa') as string,
    };

    // Parse miembros (dynamic count)
    const miembrosCount = Number(formData.get('miembros_count') ?? 0);
    const miembros = [];
    for (let i = 0; i < miembrosCount; i++) {
      miembros.push({
        nombre: formData.get(`miembro_${i}_nombre`) as string,
        apellido: formData.get(`miembro_${i}_apellido`) as string,
        correo: formData.get(`miembro_${i}_correo`) as string,
        genero: formData.get(`miembro_${i}_genero`) as string,
        carrera: formData.get(`miembro_${i}_carrera`) as string,
        idTipoUsuario: formData.get(`miembro_${i}_idTipoUsuario`) as string,
      });
    }

    // Validate with Zod
    const parsed = grupoSchema.safeParse({ responsable, miembros });
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

    // Validate file
    const file = formData.get('comprobante') as File;
    const archivoError = validarArchivo(file);
    if (archivoError) {
      return { success: false, errors: { comprobante: archivoError } };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const useCase = new RegistrarGrupo(
      getUsuarioRepository(),
      getComprobantePagoRepository(),
      getStorageService(),
      getEmailService(),
      getPdfService(),
      getCatalogoRepository(),
    );

    const resultado = await useCase.execute({
      responsable: {
        ...parsed.data.responsable,
        telefono: parsed.data.responsable.telefono || null,
        lada: parsed.data.responsable.lada || null,
        extension: parsed.data.responsable.extension || null,
        genero: parsed.data.responsable.genero as Genero,
        carrera: parsed.data.responsable.carrera || null,
        dependencia: parsed.data.responsable.dependencia || null,
      },
      miembros: parsed.data.miembros.map((m) => ({
        ...m,
        genero: m.genero as Genero,
        carrera: m.carrera || null,
      })),
      archivo: {
        nombre: file.name,
        mime: file.type,
        tamanio: file.size,
        buffer,
      },
    });

    return {
      success: true,
      totalRegistrados: resultado.totalRegistrados,
      folios: resultado.folios,
    };
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      const domainError = error as Error & { code: string };
      if (domainError.code === 'MIEMBRO_CORREO_DUPLICADO') {
        return { success: false, errors: { miembros: domainError.message } };
      }
    }
    console.error('Error en registro grupal:', error);
    return { success: false, errors: { _form: 'Ocurrió un error inesperado. Intente de nuevo.' } };
  }
}
