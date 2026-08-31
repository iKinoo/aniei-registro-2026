'use server';

import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { RegistrarGrupoRapido } from '@/application/use-cases/RegistrarGrupoRapido';
import {
  getUsuarioRepository,
  getDepositoRepository,
  getStorageService,
  getEmailService,
  getPdfService,
  getAccesoRepository,
} from '@/infrastructure/config/container';
import { z } from 'zod';
import { depositoSchema } from '@/shared/validation/registro.schema';

const miembroRapidoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(125),
  apellido: z.string().min(1, 'El apellido es requerido').max(256),
  correo: z.email('Formato de correo inválido').max(100),
});

const grupoRapidoFormSchema = z.object({
  miembros: z.array(miembroRapidoSchema).min(1, 'Agregue al menos un miembro al grupo'),
  deposito: depositoSchema,
});

export interface GrupoRapidoActionState {
  success: boolean;
  totalRegistrados?: number;
  folios?: string[];
  data?: { folioPadre: string };
  errors?: Record<string, string>;
  error?: string;
  fields?: Record<string, string>;
}

function validarArchivo(file: File): string | null {
  if (!file) return 'Seleccione un archivo';
  if (file.size === 0) return 'El archivo no puede estar vacío';
  
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) return 'El archivo debe pesar menos de 5MB';
  
  const allowedMimes = ['image/png', 'image/jpeg', 'application/pdf'];
  if (!allowedMimes.includes(file.type)) {
    return 'Solo se permiten archivos PNG, JPEG o PDF';
  }
  
  return null;
}

export async function registrarGrupoRapidoAction(
  _prevState: GrupoRapidoActionState,
  formData: FormData,
): Promise<GrupoRapidoActionState> {
  try {
    const session = await auth();
    const folioRegistro = (session?.user as any)?.folioRegistro;
    if (!folioRegistro) {
      return {
        success: false,
        error: 'No hay una sesión activa',
      };
    }

    const acceso = await prisma.accesos.findFirst({
      where: { folio_registro: folioRegistro },
      select: { folio_registro: true },
    });

    if (!acceso?.folio_registro) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    const grupoActivo = formData.get('grupoActivo') === 'true';
    const numMiembros = parseInt((formData.get('numMiembros') as string) ?? '0', 10) || 0;
    
    const miembros: { nombre: string; apellido: string; correo: string }[] = [];
    for (let i = 0; i < numMiembros; i++) {
      const nombre = (formData.get(`miembro_${i}_nombre`) as string) ?? '';
      const apellido = (formData.get(`miembro_${i}_apellido`) as string) ?? '';
      const correo = (formData.get(`miembro_${i}_correo`) as string) ?? '';
      if (nombre.trim() && apellido.trim() && correo.trim()) {
        miembros.push({ nombre: nombre.trim(), apellido: apellido.trim(), correo: correo.trim() });
      }
    }

    const rawDeposito = {
      bancoSucursal: formData.get('bancoSucursal') as string,
      ciudad: formData.get('ciudad') as string,
      referencia: formData.get('referencia') as string,
      monto: formData.get('monto') as string,
      fechaDeposito: formData.get('fechaDeposito') as string,
      notas: formData.get('notas') as string,
    };

    const savedFields: Record<string, string> = {
      bancoSucursal: rawDeposito.bancoSucursal,
      ciudad: rawDeposito.ciudad,
      referencia: rawDeposito.referencia,
      monto: rawDeposito.monto,
      fechaDeposito: rawDeposito.fechaDeposito,
      notas: rawDeposito.notas,
    };

    if (grupoActivo && miembros.length > 0) {
      const parseResult = grupoRapidoFormSchema.safeParse({
        miembros,
        deposito: rawDeposito,
      });

      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parseResult.error.issues) {
          const key = issue.path.join('.');
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        return { success: false, errors: fieldErrors, error: 'Por favor corrija los errores en el formulario', fields: savedFields };
      }
    } else if (!grupoActivo) {
      const parseResult = depositoSchema.safeParse(rawDeposito);
      if (!parseResult.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parseResult.error.issues) {
          const key = issue.path.join('.');
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        return { success: false, errors: fieldErrors, error: 'Por favor corrija los errores en el formulario', fields: savedFields };
      }
    }

    const file = formData.get('archivo') as File;
    const archivoError = validarArchivo(file);
    if (archivoError) {
      return { success: false, errors: { archivo: archivoError }, error: archivoError, fields: savedFields };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const useCase = new RegistrarGrupoRapido(
      getUsuarioRepository(),
      getDepositoRepository(),
      getStorageService(),
      getEmailService(),
      getPdfService(),
    );

    const resultado = await useCase.execute({
      responsableId: acceso.folio_registro,
      miembros: grupoActivo ? miembros : [],
      deposito: {
        bancoSucursal: rawDeposito.bancoSucursal || null,
        ciudad: rawDeposito.ciudad || null,
        referencia: rawDeposito.referencia,
        monto: parseFloat(rawDeposito.monto),
        fechaDeposito: new Date(rawDeposito.fechaDeposito),
        notas: rawDeposito.notas || null,
      },
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
      data: { folioPadre: folioRegistro }
    };
  } catch (error) {
    console.error('Error en registrarGrupoRapidoAction:', error);
    const message = error instanceof Error ? error.message : 'Error al registrar el grupo';
    return {
      success: false,
      error: message,
    };
  }
}
