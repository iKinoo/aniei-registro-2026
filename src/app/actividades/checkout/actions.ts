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
      include: { tipo_actividad: true, instituciones: true, actividad_costo: true, actividad_taller_detalle: true },
    });
    const data: ActividadDTO[] = rows.map((r) => ({
      idActividad: r.id_actividad,
      nombre: r.nombre,
      descripcion: r.descripcion ?? null,
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
      } : null,
      institucionSede: r.instituciones ? {
        idInstitucion: r.instituciones.id_institucion,
        nombre: r.instituciones.nombre,
        abreviatura: r.instituciones.abreviatura ?? null,
      } : null,
      tallerDetalle: r.actividad_taller_detalle ? {
        horarioTexto: r.actividad_taller_detalle.horario_texto ?? null,
        diasSemana: r.actividad_taller_detalle.dias_semana ?? null,
      } : null,
      costo: r.actividad_costo ? {
        folioRecibo: r.actividad_costo.folio_recibo ?? null,
        monto: r.actividad_costo.monto ? Number(r.actividad_costo.monto) : null,
      } : null,
      cupoOcupado: 0, // No necesario en el checkout (ya se validó en selección)
      ponentes: [],   // No necesario en el checkout
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
  if (!session?.user?.email) redirect('/login');

  const correo = session.user.email;

  const acceso = await prisma.accesos.findUnique({
    where: { email: correo },
    select: { id_usuario: true, nombre: true, usuarios: { select: { folio_recibo: true, nombre: true, apellido: true } } },
  });
  if (!acceso?.id_usuario) redirect('/login');

  const idUsuario = acceso.id_usuario;
  const errors: Record<string, string> = {};

  // 1. Validar y guardar depósito si hay costo
  if (tieneCosto) {
    const rawDeposito = {
      bancoSucursal: formData.get('bancoSucursal') as string,
      ciudad: formData.get('ciudad') as string,
      referencia: formData.get('referencia') as string,
      monto: formData.get('monto') as string,
      fechaDeposito: formData.get('fechaDeposito') as string,
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
      idUsuario,
      bancoSucursal: parsedDeposito.data.bancoSucursal || null,
      ciudad: parsedDeposito.data.ciudad || null,
      referencia: parsedDeposito.data.referencia,
      monto: Monto.create(parsedDeposito.data.monto),
      fechaDeposito: parsedDeposito.data.fechaDeposito,
      archivoUrl: urlComprobante,
      archivoNombre: file.name,
      archivoMime: file.type,
      archivoTamanio: file.size,
    });
    await getDepositoRepository().crear(deposito);
  }

  // 2. Guardar facturación si aplica
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
      idUsuario,
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

  // 3. Crear inscripciones con validación atómica de cupo
  const { ok, sinCupo } = await getInscripcionActividadRepository().crearMuchasConValidacion(idUsuario, idsActividades);

  // Si alguna actividad no pudo inscribirse por cupo lleno, informar al usuario
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

  // Si ninguna actividad fue aceptada (todas rechazadas), retornar error
  if (ok.length === 0) {
    return {
      success: false,
      errors: { _form: 'No se pudo inscribir en ninguna actividad. Es posible que el cupo ya se haya agotado.' },
    };
  }

  // 4. Preparar datos para correo y pantalla de confirmación
  const actividadesRows = await prisma.actividades.findMany({
    where: { id_actividad: { in: idsActividades } },
    include: { actividad_costo: true },
    orderBy: { fecha_inicio: 'asc' },
  });

  const fechaStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const actividadesParaCorreo = actividadesRows.map((a) => ({
    nombre: a.nombre,
    fecha: a.fecha_inicio.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    costo: a.actividad_costo?.monto
      ? `$${Number(a.actividad_costo.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      : null,
  }));

  const total = actividadesRows.reduce((s, a) => s + (a.actividad_costo?.monto ? Number(a.actividad_costo.monto) : 0), 0);
  const totalStr = total > 0
    ? `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
    : null;

  const usuario = acceso.usuarios;
  const nombreCompleto = usuario ? `${usuario.nombre} ${usuario.apellido}` : (acceso.nombre ?? correo);
  const folio = usuario?.folio_recibo ?? '';
  const [primerNombre, ...resto] = nombreCompleto.split(' ');
  const apellido = resto.join(' ');

  // 5. Enviar correo de confirmación (best-effort, no bloquea la respuesta)
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
