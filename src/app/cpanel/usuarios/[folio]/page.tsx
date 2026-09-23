import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { DepositoHistorialItem } from '@/app/components/HistorialDepositos';
import { UsuarioDetalleClient } from './UsuarioDetalleClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Detalle de Usuario | CPanel ANIEI 2026' };

export default async function UsuarioDetallePage({ params }: { params: Promise<{ folio: string }> }) {
  const session = await auth();
  const folioRegistro = (session?.user as any)?.folioRegistro;
  if (!folioRegistro) redirect('/login');

  const accesoAdmin = await prisma.accesos.findFirst({
    where: { folio_registro: folioRegistro },
    select: { rol: true },
  });
  if (accesoAdmin?.rol !== 'ADMIN') redirect('/cpanel');

  const { folio } = await params;

  const usuario = await prisma.usuarios.findUnique({
    where: { folio_registro: folio },
    include: {
      instituciones: true,
      titulos: true,
      estados: true,
    },
  });

  if (!usuario) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Usuario no encontrado</h1>
          <p className="text-slate-500 mb-4">No existe un usuario con el folio {folio}.</p>
          <Link href="/cpanel" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const depositosRaw = await prisma.depositos.findMany({
    where: { folio_registro: folio },
    orderBy: { fecha_registro: 'desc' },
  });

  const depositos: DepositoHistorialItem[] = depositosRaw.map((d) => ({
    idDeposito: d.id_deposito,
    proposito: d.proposito ?? 'EVENTO_PRINCIPAL',
    monto: Number(d.monto),
    referencia: d.referencia,
    bancoSucursal: d.banco_sucursal,
    ciudad: d.ciudad,
    fechaDeposito: d.fecha_deposito,
    fechaRegistro: d.fecha_registro ?? new Date(),
    notas: d.notas,
    archivoUrl: d.archivo_url,
    archivoNombre: d.archivo_nombre,
  }));

  const facturacion = await prisma.facturaciones.findFirst({
    where: { folio_registro: folio },
  });

  const inscripciones = await prisma.inscripcion_actividades.findMany({
    where: { folio_registro: folio },
    include: {
      actividades: {
        include: {
          tipo_actividad: true,
        },
      },
    },
    orderBy: { fecha_inscripcion: 'desc' },
  });

  return (
    <UsuarioDetalleClient
      usuario={{
        folioRegistro: usuario.folio_registro,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        lada: usuario.lada,
        extension: usuario.extension,
        genero: usuario.genero,
        carrera: usuario.carrera,
        dependencia: usuario.dependencia,
        institucion: usuario.instituciones?.nombre ?? null,
        institucionExterna: usuario.institucion_externa,
        titulo: usuario.titulos?.descripcion ?? null,
        estado: usuario.estados?.nombre ?? null,
        fechaRegistro: usuario.fecha_registro,
      }}
      depositos={depositos}
      facturacion={facturacion ? {
        razonSocial: facturacion.razon_social,
        rfc: facturacion.rfc,
        calle: facturacion.calle,
        numExterior: facturacion.num_exterior,
        numInterior: facturacion.num_interior,
        colonia: facturacion.colonia,
        municipio: facturacion.municipio,
        codigoPostal: facturacion.codigo_postal,
        constanciaUrl: facturacion.constancia_url,
        constanciaNombre: facturacion.constancia_nombre,
      } : null}
      inscripciones={inscripciones.map((i) => ({
        idInscripcion: i.id_inscripcion,
        idActividad: i.id_actividad,
        nombreActividad: i.actividades?.nombre ?? 'Actividad',
        tipoActividad: i.actividades?.tipo_actividad?.descripcion ?? 'Actividad',
        fechaInscripcion: i.fecha_inscripcion,
        urlConstancia: i.url_constancia,
      }))}
    />
  );
}
