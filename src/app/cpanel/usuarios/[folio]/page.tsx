import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getRegistroQueryService } from '@/infrastructure/config/container';
import { ConsultarRegistros } from '@/application/use-cases/ConsultarRegistros';
import { requireAdmin } from '@/shared/auth/requireAdmin';
import { UsuarioDetalleClient } from './UsuarioDetalleClient';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Detalle de Usuario | CPanel ANIEI 2026' };

export default async function UsuarioDetallePage({ params }: { params: Promise<{ folio: string }> }) {
  const session = await auth();
  const folioRegistro = session?.user?.folioRegistro;
  if (!folioRegistro) redirect('/login');

  await requireAdmin();
  const { folio } = await params;
  const detalle = await new ConsultarRegistros(getRegistroQueryService()).obtenerDetalle(folio);
  const usuario = detalle?.usuario;

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

  const { depositos, facturacion, inscripciones } = detalle!;

  return (
    <UsuarioDetalleClient
      usuario={{
        folioRegistro: usuario.folioRegistro,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        correo: usuario.correo,
        telefono: usuario.telefono,
        lada: usuario.lada,
        extension: usuario.extension,
        genero: usuario.genero,
        carrera: usuario.carrera,
        dependencia: usuario.dependencia,
        institucion: usuario.institucion?.nombre ?? null,
        institucionExterna: usuario.institucionExterna,
        titulo: usuario.titulo?.descripcion ?? null,
        estado: usuario.estado?.nombre ?? null,
        fechaRegistro: usuario.fechaRegistro,
      }}
      depositos={depositos}
      facturacion={facturacion}
      inscripciones={inscripciones.map((i) => ({
        idInscripcion: i.idInscripcion,
        idActividad: i.idActividad,
        nombreActividad: i.actividad?.nombre ?? 'Actividad',
        tipoActividad: i.actividad?.tipoActividad?.descripcion ?? 'Actividad',
        fechaInscripcion: i.fechaInscripcion,
        urlConstancia: i.urlConstancia,
      }))}
    />
  );
}
