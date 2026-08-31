'use server';

import { registroSchema, depositoSchema, facturacionSchema, validarArchivo } from '@/shared/validation/registro.schema';

import { RegistrarUsuario } from '@/application/use-cases/RegistrarUsuario';
import { RegistrarGrupoRapido } from '@/application/use-cases/RegistrarGrupoRapido';
import { Genero } from '@/core/enums/Genero';
import { signIn } from '@/auth';
import { mapPrismaError } from '@/infrastructure/errors/prismaErrorMapper';
import {
  getUsuarioRepository,
  getDepositoRepository,
  getFacturacionRepository,
  getStorageService,
  getEmailService,
  getPdfService,
  getCatalogoRepository,
  getAccesoRepository,
  getInscripcionActividadRepository,
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
  idTitulo?: string;
  idTipoParticipante?: string;
  idInstitucion?: string;
  institucionExterna?: string;
  noAfiliada?: string;
  idEntidadFederativa?: string;
  bancoSucursal?: string;
  ciudad?: string;
  referencia?: string;
  monto?: string;
  fechaDeposito?: string;
  notas?: string;
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
      idTitulo: formData.get('idTitulo') as string,
      idTipoParticipante: formData.get('idTipoParticipante') as string,
      idInstitucion: formData.get('idInstitucion') as string,
      institucionExterna: formData.get('institucionExterna') as string,
      noAfiliada: formData.get('noAfiliada') as string,
      idEntidadFederativa: formData.get('idEntidadFederativa') as string,
    };

    const rawDeposito = {
      bancoSucursal: formData.get('bancoSucursal') as string,
      ciudad: formData.get('ciudad') as string,
      referencia: formData.get('referencia') as string,
      monto: formData.get('monto') as string,
      fechaDeposito: formData.get('fechaDeposito') as string,
      notas: formData.get('notas') as string,
    };

    const requiereFacturacion = formData.get('requiereFacturacion') === 'true';

    const numMiembros = parseInt((formData.get('numMiembros') as string) ?? '0', 10) || 0;
    const miembros: { nombre: string; apellido: string; correo: string; idTipoParticipante: number }[] = [];
    for (let i = 0; i < numMiembros; i++) {
      const nombre = (formData.get(`miembro_${i}_nombre`) as string) ?? '';
      const apellido = (formData.get(`miembro_${i}_apellido`) as string) ?? '';
      const correo = (formData.get(`miembro_${i}_correo`) as string) ?? '';
      const idTipoParticipante = parseInt((formData.get(`miembro_${i}_idTipoParticipante`) as string) ?? '0', 10) || 0;
      if (nombre.trim() && apellido.trim() && correo.trim()) {
        miembros.push({ nombre: nombre.trim(), apellido: apellido.trim(), correo: correo.trim(), idTipoParticipante });
      }
    }

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

    const parsed = registroSchema.safeParse(rawData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, errors: fieldErrors, fields: savedFields };
    }

    const parsedDeposito = depositoSchema.safeParse(rawDeposito);
    if (!parsedDeposito.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsedDeposito.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, errors: fieldErrors, fields: savedFields };
    }

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

    const file = formData.get('comprobante') as File;
    const archivoError = validarArchivo(file);
    if (archivoError) {
      return { success: false, errors: { comprobante: archivoError }, fields: savedFields };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const t0 = Date.now();
    const logPhase = (phase: string, start: number) => {
      const ms = Date.now() - start;
      console.log(`[registro] ${phase} ${ms}ms`);
      return Date.now();
    };
    let tPhase = t0;
    console.log(`[registro] start correo=${rawData.correo} file=${file.name} ${file.size} bytes`);

    const useCase = new RegistrarUsuario(
      getUsuarioRepository(),
      getDepositoRepository(),
      getFacturacionRepository(),
      getStorageService(),
      getEmailService(),
      getPdfService(),
      getCatalogoRepository(),
      getAccesoRepository(),
      getInscripcionActividadRepository(),
    );

    const idInstitucion = parsed.data.noAfiliada !== true ? (parsed.data.idInstitucion ?? null) : null;
    const institucionExterna = parsed.data.noAfiliada === true ? (parsed.data.institucionExterna || null) : null;

    const resultado = await useCase.execute({
      ...parsed.data,
      telefono: parsed.data.telefono || null,
      lada: parsed.data.lada || null,
      extension: parsed.data.extension || null,
      genero: parsed.data.genero as Genero,
      carrera: parsed.data.carrera || null,
      dependencia: parsed.data.dependencia || null,
      idTipoParticipante: parsed.data.idTipoParticipante,
      idInstitucion,
      institucionExterna,
      deposito: {
        bancoSucursal: parsedDeposito.data.bancoSucursal || null,
        ciudad: parsedDeposito.data.ciudad || null,
        referencia: parsedDeposito.data.referencia,
        monto: parsedDeposito.data.monto,
        fechaDeposito: parsedDeposito.data.fechaDeposito,
        notas: parsedDeposito.data.notas || null,
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
    tPhase = logPhase('useCase.execute', tPhase);
    console.log(`[registro] success folio=${resultado.folio} total=${Date.now() - t0}ms`);

    if (miembros.length > 0) {
      try {
        const grupoUseCase = new RegistrarGrupoRapido(
          getUsuarioRepository(),
          getDepositoRepository(),
          getStorageService(),
          getEmailService(),
          getPdfService(),
        );
        await grupoUseCase.execute({
          responsableId: resultado.folio,
          miembros: miembros.map((m) => ({ nombre: m.nombre, apellido: m.apellido, correo: m.correo })),
          deposito: {
            bancoSucursal: parsedDeposito.data.bancoSucursal || null,
            ciudad: parsedDeposito.data.ciudad || null,
            referencia: parsedDeposito.data.referencia,
            monto: parsedDeposito.data.monto,
            fechaDeposito: parsedDeposito.data.fechaDeposito,
            notas: parsedDeposito.data.notas || null,
          },
          archivo: {
            nombre: file.name,
            mime: file.type,
            tamanio: file.size,
            buffer,
          },
        });
      } catch (grupoError) {
        console.error('Error en registro grupal (usuario principal registrado correctamente):', grupoError);
      }
    }

    try {
      await signIn('credentials', {
        email: resultado.correo,
        password: resultado.passwordPlana,
        redirect: false,
      });
    } catch (_) {
    }

    return {
      success: true,
      folio: resultado.folio,
      correo: resultado.correo,
    };
  } catch (error) {
    const anyErr = error as { code?: string; cause?: { code?: string; message?: string }; meta?: unknown; stack?: string };
    const prismaMapped = mapPrismaError(error, (formData.get('correo') as string) || undefined);
    if (prismaMapped) {
      console.error('[registro] prismaMapped', { code: (prismaMapped as { code?: string }).code, message: prismaMapped.message, meta: anyErr.meta });
      error = prismaMapped;
    } else {
      console.error('[registro] Error en registro:', {
        message: error instanceof Error ? error.message : String(error),
        code: anyErr.code ?? anyErr.cause?.code,
        cause: anyErr.cause,
        meta: anyErr.meta,
        stack: error instanceof Error ? error.stack?.slice(0, 800) : undefined,
      });
    }
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
      idTitulo: formData.get('idTitulo') as string,
      idTipoParticipante: formData.get('idTipoParticipante') as string,
      idInstitucion: formData.get('idInstitucion') as string,
      institucionExterna: formData.get('institucionExterna') as string,
      noAfiliada: formData.get('noAfiliada') as string,
      idEntidadFederativa: formData.get('idEntidadFederativa') as string,
      bancoSucursal: formData.get('bancoSucursal') as string,
      ciudad: formData.get('ciudad') as string,
      referencia: formData.get('referencia') as string,
      monto: formData.get('monto') as string,
      fechaDeposito: formData.get('fechaDeposito') as string,
      notas: formData.get('notas') as string,
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
      if (domainError.code === 'FK_INVALIDA') {
        return { success: false, errors: { _form: `Catálogo inválido: ${domainError.message}` }, fields: savedFieldsOnError };
      }
      if (domainError.code === 'TX_TIMEOUT' || domainError.code === 'TX_CONFLICTO') {
        return { success: false, errors: { _form: `${domainError.message}. Por favor intente de nuevo.` }, fields: savedFieldsOnError };
      }
      if (domainError.code === 'P2002') {
        return { success: false, errors: { correo: domainError.message }, fields: savedFieldsOnError };
      }
    }
    if (error instanceof Error && error.message.includes('RFC')) {
      return { success: false, errors: { 'facturacion.rfc': error.message }, fields: savedFieldsOnError };
    }
    if (error instanceof Error && error.message.includes('Error al subir archivo a storage')) {
      return { success: false, errors: { comprobante: error.message }, fields: savedFieldsOnError };
    }
    if (error instanceof Error && error.message.includes('Archivo')) {
      return { success: false, errors: { comprobante: error.message }, fields: savedFieldsOnError };
    }
    const isDev = process.env.NODE_ENV !== 'production';
    return {
      success: false,
      errors: {
        _form: isDev && error instanceof Error ? `Error: ${error.message} (ver logs server)` : 'Ocurrió un error inesperado. Intente de nuevo.',
      },
      fields: savedFieldsOnError,
    };
  }
}
