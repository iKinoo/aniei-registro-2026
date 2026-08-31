'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/infrastructure/database/client';
import {
  getInscripcionActividadRepository,
  getDepositoRepository,
  getFacturacionRepository,
  getStorageService,
  getCatalogoRepository,
  getEmailService,
} from '@/infrastructure/config/container';
import { depositoSchema, facturacionSchema, validarArchivo } from '@/shared/validation/registro.schema';
import { Deposito } from '@/core/entities/Deposito';
import { Facturacion } from '@/core/entities/Facturacion';
import { Monto } from '@/core/value-objects/Monto';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';

export async function getActividadesPorIdsAction(ids: number[]) {
  if (ids.length === 0) return { success: true as const, data: [] as ActividadDTO[] };
  try {
    const rows = await prisma.actividades.findMany({
      where: { id_actividad: { in: ids } },
      include: { tipo_actividad: true, instituciones: true },
    });
    const data: ActividadDTO[] = rows.map((r) => ({
      idActividad: r.id_actividad,
      nombre: r.nombre,
      cupoMaximo: r.cupo_maximo ?? 0,
      fechaInicio: r.fecha_inicio.toISOString(),
      fechaFin: r.fecha_fin.toISOString(),
      idTipoActividad: r.id_tipo_actividad ?? null,
      idInstitucionSede: r.id_institucion_sede ?? null,
      idSala: r.id_sala ?? null,
      tipoActividad: r.tipo_actividad ? {
        idTipoActividad: r.tipo_actividad.id_tipo_actividad,
        descripcion: r.tipo_actividad.descripcion,
        clave: r.tipo_actividad.clave ?? null,
        manejaEquipos: r.tipo_actividad.maneja_equipos ?? false,
        generaConstanciaParticipante: r.tipo_actividad.genera_constancia_participante ?? false,
      } : null,
      institucionSede: r.instituciones ? {
        idInstitucion: r.instituciones.id_institucion,
        nombre: r.instituciones.nombre,
        abreviatura: r.instituciones.abreviatura ?? null,
      } : null,
      costo: r.costo ? Number(r.costo) : 0,
      cupoOcupado: 0,
      ponentes: [],
    }));
    return { success: true as const, data };
  } catch {
    return { success: false as const, error: 'Error al cargar actividades del carrito' };
  }
}

export async function getEstadosCheckoutAction() {
  try {
    const repo = getCatalogoRepository();
    const estados = await repo.obtenerEstados();
    return { success: true as const, data: estados };
  } catch {
    return { success: false as const, error: 'Error al cargar estados' };
  }
}

export interface ConfirmacionInscripcionResult {
  success: true;
  nombre: string;
  folio: string;
  correo: string;
  actividades: Array<{ nombre: string; fecha: string; costo: string | null }>;
  totalCosto: string | null;
}

export async function confirmarInscripcionesAction(
  formData: FormData,
  idsActividades: number[],
  tieneCosto: boolean,
): Promise<{ success: false; errors: Record<string, string> } | ConfirmacionInscripcionResult> {
  const session = await auth();
  const folioRegistro = (session?.user as any)?.folioRegistro;
  if (!folioRegistro) redirect('/login');

  const acceso = await prisma.accesos.findFirst({
    where: { folio_registro: folioRegistro },
    select: { folio_registro: true, nombre: true, email: true, usuarios: { select: { folio_registro: true, nombre: true, apellido: true, correo: true } } },
  });
  if (!acceso?.folio_registro) redirect('/login');

  const folioUsuario = acceso.folio_registro;
  const correo = acceso.email ?? acceso.usuarios?.correo ?? '';
  const errors: Record<string, string> = {};

  if (tieneCosto) {
    const rawDeposito = {
      bancoSucursal: formData.get('bancoSucursal') as string,
      ciudad: formData.get('ciudad') as string,
      referencia: formData.get('referencia') as string,
      monto: formData.get('monto') as string,
      fechaDeposito: formData.get('fechaDeposito') as string,
      notas: formData.get('notas') as string,
    };
    const parsedDeposito = depositoSchema.safeParse(rawDeposito);
    if (!parsedDeposito.success) {
      for (const issue of parsedDeposito.error.issues) {
        errors[issue.path.join('.')] = issue.message;
      }
      return { success: false, errors };
    }

    const file = formData.get('comprobante') as File;
    const archivoError = validarArchivo(file);
    if (archivoError) return { success: false, errors: { comprobante: archivoError } };

    ArchivoComprobante.create(file.name, file.type, file.size);
    const ext = file.name.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes-actividades/${crypto.randomUUID()}.${ext}`;
    const storageService = getStorageService();
    const buffer = Buffer.from(await file.arrayBuffer());
    const urlComprobante = await storageService.subir(archivoRuta, buffer, file.type);

    const deposito = Deposito.create({
      folioRegistro: folioUsuario,
      bancoSucursal: parsedDeposito.data.bancoSucursal || null,
      ciudad: parsedDeposito.data.ciudad || null,
      referencia: parsedDeposito.data.referencia,
      monto: Monto.create(parsedDeposito.data.monto),
      fechaDeposito: parsedDeposito.data.fechaDeposito,
      archivoUrl: urlComprobante,
      archivoNombre: file.name,
      archivoMime: file.type,
      archivoTamanio: file.size,
      proposito: 'ACTIVIDADES',
      notas: parsedDeposito.data.notas || null,
    });
    await getDepositoRepository().crear(deposito);
  }

  const requiereFacturacion = formData.get('requiereFacturacion') === 'true';
  if (requiereFacturacion) {
    const rawFact = {
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
    const parsedFact = facturacionSchema.safeParse(rawFact);
    if (!parsedFact.success) {
      for (const issue of parsedFact.error.issues) {
        errors[`facturacion.${issue.path.join('.')}`] = issue.message;
      }
      return { success: false, errors };
    }
    const facturacion = Facturacion.create({
      folioRegistro: folioUsuario,
      razonSocial: parsedFact.data.razonSocial,
      rfc: parsedFact.data.rfc,
      calle: parsedFact.data.calle || null,
      numExterior: parsedFact.data.numExterior || null,
      numInterior: parsedFact.data.numInterior || null,
      colonia: parsedFact.data.colonia || null,
      municipio: parsedFact.data.municipio || null,
      codigoPostal: parsedFact.data.codigoPostal || null,
      idEntidadFederativaRfc: parsedFact.data.idEntidadFederativaRfc ?? null,
    });
    await getFacturacionRepository().crear(facturacion);
  }

  const { ok, sinCupo } = await getInscripcionActividadRepository().crearMuchasConValidacion(folioUsuario, idsActividades);

  if (sinCupo.length > 0) {
    const actividadesRechazadas = await prisma.actividades.findMany({
      where: { id_actividad: { in: sinCupo } },
      select: { nombre: true },
    });
    const nombres = actividadesRechazadas.map((a) => a.nombre).join(', ');
    return {
      success: false,
      errors: {
        _form: `Sin cupo disponible en: ${nombres}. Por favor regresa y ajusta tu selección.`,
      },
    };
  }

  if (ok.length === 0) {
    return {
      success: false,
      errors: { _form: 'No se pudo inscribir en ninguna actividad. Es posible que el cupo ya se haya agotado.' },
    };
  }

  const actividadesRows = await prisma.actividades.findMany({
    where: { id_actividad: { in: idsActividades } },

    orderBy: { fecha_inicio: 'asc' },
  });

  const fechaStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const actividadesParaCorreo = actividadesRows.map((a) => ({
    nombre: a.nombre,
    fecha: a.fecha_inicio.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    costo: a.costo && Number(a.costo) > 0
      ? `$${Number(a.costo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      : null,
  }));

  const total = actividadesRows.reduce((s, a) => s + (a.costo ? Number(a.costo) : 0), 0);
  const totalStr = total > 0
    ? `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
    : null;

  const usuario = acceso.usuarios;
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : (acceso.nombre ?? correo);
  const folio = usuario?.folio_registro ?? '';
  const [primerNombre, ...resto] = nombreCompleto.split(' ');
  const apellido = resto.join(' ');

  try {
    await getEmailService().enviarConfirmacionActividades(correo, {
      nombre: primerNombre,
      apellido,
      folio,
      actividades: actividadesParaCorreo,
      totalCosto: totalStr,
      fecha: fechaStr,
    });
  } catch (e) {
    console.error('Error al enviar correo de actividades:', e);
  }

  return {
    success: true,
    nombre: primerNombre,
    folio,
    correo,
    actividades: actividadesParaCorreo,
    totalCosto: totalStr,
  };
}
