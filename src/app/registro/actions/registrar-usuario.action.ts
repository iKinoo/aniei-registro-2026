'use server';

import { registroSchema, depositoSchema, facturacionSchema, validarArchivo } from '@/shared/validation/registro.schema';
import { RegistrarUsuario } from '@/application/use-cases/RegistrarUsuario';
import { Genero } from '@/core/enums/Genero';
import {
  getUsuarioRepository,
  getDepositoRepository,
  getFacturacionRepository,
  getStorageService,
  getEmailService,
  getPdfService,
  getCatalogoRepository,
} from '@/infrastructure/config/container';

export interface RegistroFormFields {
  nombre?: string;
  apellido?: string;
  correo?: string;
  telefono?: string;
  lada?: string;
  extension?: string;
  genero?: string;
  carrera?: string;
  dependencia?: string;
  idCargo?: string;
  idTipoUsuario?: string;
  idInstitucion?: string;
  idEntidadFederativa?: string;
  bancoSucursal?: string;
  ciudad?: string;
  referencia?: string;
  monto?: string;
  fechaDeposito?: string;
  requiereFacturacion?: boolean;
  razonSocial?: string;
  rfc?: string;
  calle?: string;
  numExterior?: string;
  numInterior?: string;
  colonia?: string;
  municipio?: string;
  codigoPostal?: string;
  idEntidadFederativaRfc?: string;
}

export interface RegistroActionState {
  success: boolean;
  folio?: string;
  correo?: string;
  errors?: Record<string, string>;
  fields?: RegistroFormFields;
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

    const rawDeposito = {
      bancoSucursal: formData.get('bancoSucursal') as string,
      ciudad: formData.get('ciudad') as string,
      referencia: formData.get('referencia') as string,
      monto: formData.get('monto') as string,
      fechaDeposito: formData.get('fechaDeposito') as string,
    };

    const requiereFacturacion = formData.get('requiereFacturacion') === 'true';

    // Capturar todos los campos para restaurarlos en caso de error
    const savedFields: RegistroFormFields = {
      ...rawData,
      ...rawDeposito,
      requiereFacturacion,
      razonSocial: formData.get('razonSocial') as string,
      rfc: formData.get('rfc') as string,
      calle: formData.get('calle') as string,
      numExterior: formData.get('numExterior') as string,
      numInterior: formData.get('numInterior') as string,
      colonia: formData.get('colonia') as string,
      municipio: formData.get('municipio') as string,
      codigoPostal: formData.get('codigoPostal') as string,
      idEntidadFederativaRfc: formData.get('idEntidadFederativaRfc') as string,
    };

    // Validar campos personales/institucionales con Zod
    const parsed = registroSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, errors: fieldErrors, fields: savedFields };
    }

    // Validar datos del depósito
    const parsedDeposito = depositoSchema.safeParse(rawDeposito);
    if (!parsedDeposito.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsedDeposito.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, errors: fieldErrors, fields: savedFields };
    }

    // Validar datos de facturación (solo si el usuario la activó)
    let parsedFacturacion: ReturnType<typeof facturacionSchema.safeParse> | null = null;
    if (requiereFacturacion) {
      const rawFacturacion = {
        razonSocial: formData.get('razonSocial') as string,
        rfc: formData.get('rfc') as string,
        calle: formData.get('calle') as string,
        numExterior: formData.get('numExterior') as string,
        numInterior: formData.get('numInterior') as string,
        colonia: formData.get('colonia') as string,
        municipio: formData.get('municipio') as string,
        codigoPostal: formData.get('codigoPostal') as string,
        idEntidadFederativaRfc: formData.get('idEntidadFederativaRfc') as string,
      };
      parsedFacturacion = facturacionSchema.safeParse(rawFacturacion);
      if (!parsedFacturacion.success) {
        const fieldErrors: Record<string, string> = {};
        for (const issue of parsedFacturacion.error.issues) {
          const key = `facturacion.${issue.path.join('.')}`;
          if (!fieldErrors[key]) fieldErrors[key] = issue.message;
        }
        return { success: false, errors: fieldErrors, fields: savedFields };
      }
    }

    // Validar archivo
    const file = formData.get('comprobante') as File;
    const archivoError = validarArchivo(file);
    if (archivoError) {
      return { success: false, errors: { comprobante: archivoError }, fields: savedFields };
    }

    // Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ejecutar caso de uso
    const useCase = new RegistrarUsuario(
      getUsuarioRepository(),
      getDepositoRepository(),
      getFacturacionRepository(),
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
      deposito: {
        bancoSucursal: parsedDeposito.data.bancoSucursal || null,
        ciudad: parsedDeposito.data.ciudad || null,
        referencia: parsedDeposito.data.referencia,
        monto: parsedDeposito.data.monto,
        fechaDeposito: parsedDeposito.data.fechaDeposito,
      },
      archivo: {
        nombre: file.name,
        mime: file.type,
        tamanio: file.size,
        buffer,
      },
      facturacion:
        requiereFacturacion && parsedFacturacion?.success
          ? {
              razonSocial: parsedFacturacion.data.razonSocial,
              rfc: parsedFacturacion.data.rfc,
              calle: parsedFacturacion.data.calle || null,
              numExterior: parsedFacturacion.data.numExterior || null,
              numInterior: parsedFacturacion.data.numInterior || null,
              colonia: parsedFacturacion.data.colonia || null,
              municipio: parsedFacturacion.data.municipio || null,
              codigoPostal: parsedFacturacion.data.codigoPostal || null,
              idEntidadFederativaRfc: parsedFacturacion.data.idEntidadFederativaRfc ?? null,
            }
          : null,
    });

    return {
      success: true,
      folio: resultado.folio,
      correo: resultado.correo,
    };
  } catch (error) {
    const savedFieldsOnError: RegistroFormFields = {
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
      bancoSucursal: formData.get('bancoSucursal') as string,
      ciudad: formData.get('ciudad') as string,
      referencia: formData.get('referencia') as string,
      monto: formData.get('monto') as string,
      fechaDeposito: formData.get('fechaDeposito') as string,
      requiereFacturacion: formData.get('requiereFacturacion') === 'true',
      razonSocial: formData.get('razonSocial') as string,
      rfc: formData.get('rfc') as string,
      calle: formData.get('calle') as string,
      numExterior: formData.get('numExterior') as string,
      numInterior: formData.get('numInterior') as string,
      colonia: formData.get('colonia') as string,
      municipio: formData.get('municipio') as string,
      codigoPostal: formData.get('codigoPostal') as string,
      idEntidadFederativaRfc: formData.get('idEntidadFederativaRfc') as string,
    };
    if (error instanceof Error && 'code' in error) {
      const domainError = error as Error & { code: string };
      if (domainError.code === 'CORREO_DUPLICADO') {
        return { success: false, errors: { correo: domainError.message }, fields: savedFieldsOnError };
      }
    }
    // Error de validación RFC u otros errores de dominio
    if (error instanceof Error && error.message.includes('RFC')) {
      return { success: false, errors: { 'facturacion.rfc': error.message }, fields: savedFieldsOnError };
    }
    console.error('Error en registro:', error);
    return { success: false, errors: { _form: 'Ocurrió un error inesperado. Intente de nuevo.' }, fields: savedFieldsOnError };
  }
}
