'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  reportarErrorEnAccion,
  getStorageService,
  getAuthService,
  getAccesoRepository,
  getDepositoRepository,
  getRegistroQueryService,
  getUsuarioRepository,
  getPrecioInscripcionRepository,
  getTransactionManager,
  getIdGenerator,
} from '@/infrastructure/config/container';
import { ObtenerAccesoArchivo } from '@/application/use-cases/ObtenerAccesoArchivo';
import { CompletarDatosRegistro } from '@/application/use-cases/CompletarDatosRegistro';
import { RegistrarPagoRegistro } from '@/application/use-cases/RegistrarPagoRegistro';
import { requireUser } from '@/shared/auth/requireAdmin';
import { RegistroError } from '@/core/errors/RegistroError';
import type { Genero } from '@/core/enums/Genero';
import { validarArchivo } from '@/shared/validation/registro.schema';

export async function obtenerUrlComprobanteAction(ruta: string): Promise<{ success: true; url: string } | { success: false; error: string }> {
  try {
    await requireUser();
    const url = await new ObtenerAccesoArchivo(getStorageService(), getAuthService(), getAccesoRepository(),
      getDepositoRepository()).execute(ruta);
    return { success: true, url };
  } catch (error) {
    reportarErrorEnAccion('Error al obtener comprobante', error);
    return { success: false, error: 'Error al obtener acceso al comprobante' };
  }
}

const textoOpcional = (max: number) => z.string().max(max).optional().or(z.literal(''));

const enteroPositivoOpcional = z.preprocess(
  (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
  z.coerce.number().int().positive().optional(),
);

const generoOpcional = z.preprocess(
  (valor) => (typeof valor === 'string' && valor.trim() === '' ? undefined : valor),
  z.enum(['M', 'F', 'O']).optional(),
);

const completarDatosSchema = z.object({
  telefono: textoOpcional(20),
  lada: textoOpcional(10),
  extension: textoOpcional(10),
  genero: generoOpcional,
  carrera: textoOpcional(128),
  dependencia: textoOpcional(128),
  idTitulo: enteroPositivoOpcional,
  idInstitucion: enteroPositivoOpcional,
  institucionExterna: textoOpcional(150),
  idEntidadFederativa: enteroPositivoOpcional,
  idTipoParticipante: enteroPositivoOpcional,
  noAfiliada: z.boolean(),
});

const pagoRegistroSchema = z.object({
  bancoSucursal: textoOpcional(100),
  ciudad: textoOpcional(100),
  referencia: z.string().trim().min(1, 'La referencia es requerida').max(50),
  fechaDeposito: z.coerce.date({ error: 'Ingrese una fecha de depósito válida' }),
  notas: textoOpcional(500),
});

export interface CompletarDatosActionState {
  success: boolean;
  error?: string;
  errors?: Record<string, string>;
}

export interface PagoRegistroActionState {
  success: boolean;
  monto?: number;
  error?: string;
  errors?: Record<string, string>;
}

function textoFormulario(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === 'string' ? valor : '';
}

function erroresDeZod(error: z.ZodError): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const issue of error.issues) {
    const clave = issue.path.join('.');
    if (!errores[clave]) errores[clave] = issue.message;
  }
  return errores;
}

export async function completarDatosRegistroAction(
  _prevState: CompletarDatosActionState,
  formData: FormData,
): Promise<CompletarDatosActionState> {
  try {
    const { folioRegistro, acceso } = await requireUser();
    if (acceso.rol.toUpperCase() === 'ADMIN') {
      return { success: false, error: 'Los administradores no completan datos de registro.' };
    }

    const parsed = completarDatosSchema.safeParse({
      telefono: textoFormulario(formData, 'telefono'),
      lada: textoFormulario(formData, 'lada'),
      extension: textoFormulario(formData, 'extension'),
      genero: textoFormulario(formData, 'genero'),
      carrera: textoFormulario(formData, 'carrera'),
      dependencia: textoFormulario(formData, 'dependencia'),
      idTitulo: textoFormulario(formData, 'idTitulo'),
      idInstitucion: textoFormulario(formData, 'idInstitucion'),
      institucionExterna: textoFormulario(formData, 'institucionExterna'),
      idEntidadFederativa: textoFormulario(formData, 'idEntidadFederativa'),
      idTipoParticipante: textoFormulario(formData, 'idTipoParticipante'),
      noAfiliada: formData.get('noAfiliada') === 'true',
    });

    if (!parsed.success) {
      return { success: false, errors: erroresDeZod(parsed.error), error: 'Revise los datos ingresados.' };
    }

    await new CompletarDatosRegistro(getRegistroQueryService(), getUsuarioRepository()).execute(folioRegistro, {
      telefono: parsed.data.telefono || null,
      lada: parsed.data.lada || null,
      extension: parsed.data.extension || null,
      genero: parsed.data.genero as Genero | undefined,
      carrera: parsed.data.carrera || null,
      dependencia: parsed.data.dependencia || null,
      idTitulo: parsed.data.idTitulo ?? null,
      idInstitucion: parsed.data.idInstitucion ?? null,
      institucionExterna: parsed.data.institucionExterna || null,
      idEntidadFederativa: parsed.data.idEntidadFederativa ?? null,
      idTipoParticipante: parsed.data.idTipoParticipante ?? null,
      noAfiliada: parsed.data.noAfiliada,
    });

    revalidatePath('/perfil');
    return { success: true };
  } catch (error) {
    if (error instanceof RegistroError) {
      return { success: false, error: error.message };
    }
    reportarErrorEnAccion('Error en completarDatosRegistroAction', error);
    return { success: false, error: 'No se pudieron guardar los datos. Intente de nuevo.' };
  }
}

export async function registrarPagoRegistroAction(
  _prevState: PagoRegistroActionState,
  formData: FormData,
): Promise<PagoRegistroActionState> {
  try {
    const { folioRegistro, acceso } = await requireUser();
    if (acceso.rol.toUpperCase() === 'ADMIN') {
      return { success: false, error: 'Los administradores no registran pagos de inscripción.' };
    }

    const parsed = pagoRegistroSchema.safeParse({
      bancoSucursal: textoFormulario(formData, 'bancoSucursal'),
      ciudad: textoFormulario(formData, 'ciudad'),
      referencia: textoFormulario(formData, 'referencia'),
      fechaDeposito: textoFormulario(formData, 'fechaDeposito'),
      notas: textoFormulario(formData, 'notas'),
    });

    if (!parsed.success) {
      return { success: false, errors: erroresDeZod(parsed.error), error: 'Revise los datos ingresados.' };
    }

    const archivo = formData.get('comprobante') as File;
    const archivoError = validarArchivo(archivo);
    if (archivoError) {
      return { success: false, errors: { comprobante: archivoError }, error: archivoError };
    }

    const resultado = await new RegistrarPagoRegistro(
      getRegistroQueryService(),
      getDepositoRepository(),
      getPrecioInscripcionRepository(),
      getStorageService(),
      getTransactionManager(),
      getIdGenerator(),
    ).execute(folioRegistro, {
      bancoSucursal: parsed.data.bancoSucursal || null,
      ciudad: parsed.data.ciudad || null,
      referencia: parsed.data.referencia,
      fechaDeposito: parsed.data.fechaDeposito,
      notas: parsed.data.notas || null,
      archivo: {
        nombre: archivo.name,
        mime: archivo.type,
        tamanio: archivo.size,
        buffer: new Uint8Array(await archivo.arrayBuffer()),
      },
    });

    revalidatePath('/perfil');
    return { success: true, monto: resultado.monto };
  } catch (error) {
    if (error instanceof RegistroError) {
      return { success: false, error: error.message };
    }
    reportarErrorEnAccion('Error en registrarPagoRegistroAction', error);
    return { success: false, error: 'No se pudo registrar el pago. Intente de nuevo.' };
  }
}
