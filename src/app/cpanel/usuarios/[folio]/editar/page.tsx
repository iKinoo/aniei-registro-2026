import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import Link from 'next/link';
import { UsuarioEditarForm } from './UsuarioEditarForm';

export const metadata = { title: 'Editar Usuario | CPanel ANIEI 2026' };

export default async function UsuarioEditarPage({ params }: { params: Promise<{ folio: string }> }) {
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
    select: {
      folio_registro: true,
      nombre: true,
      apellido: true,
      correo: true,
      telefono: true,
      lada: true,
      extension: true,
      genero: true,
      carrera: true,
      dependencia: true,
      id_titulo: true,
      id_institucion: true,
      id_entidad_federativa: true,
    },
  });

  if (!usuario) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Usuario no encontrado</h1>
          <p className="text-slate-500 mb-4">No existe un usuario con el folio {folio}.</p>
          <Link href="/cpanel" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ← Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  const [titulos, instituciones, estados] = await Promise.all([
    prisma.titulos.findMany({ orderBy: { descripcion: 'asc' } }),
    prisma.instituciones.findMany({ orderBy: { nombre: 'asc' } }),
    prisma.estados.findMany({ orderBy: { nombre: 'asc' } }),
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href={`/cpanel/usuarios/${folio}`} className="text-sm text-slate-500 hover:text-slate-800 mb-2 inline-block">
          ← Volver al detalle
        </Link>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Editar usuario
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Folio: <span className="font-mono font-medium text-slate-700">{usuario.folio_registro}</span>
        </p>
      </div>

      <UsuarioEditarForm
        folio={usuario.folio_registro}
        initialData={{
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          correo: usuario.correo,
          telefono: usuario.telefono ?? '',
          lada: usuario.lada ?? '',
          extension: usuario.extension ?? '',
          genero: usuario.genero ?? '',
          carrera: usuario.carrera ?? '',
          dependencia: usuario.dependencia ?? '',
          idTitulo: usuario.id_titulo?.toString() ?? '',
          idInstitucion: usuario.id_institucion?.toString() ?? '',
          idEntidadFederativa: usuario.id_entidad_federativa?.toString() ?? '',
        }}
        catalogos={{ titulos, instituciones, estados }}
      />
    </div>
  );
}
