import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { DepositoHistorialItem } from '@/app/components/HistorialDepositos';
import { HistorialDepositosAdmin } from '@/app/components/HistorialDepositosAdmin';
import { UsuarioActions } from './UsuarioActions';
import Link from 'next/link';

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
            ← Volver al panel
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

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/cpanel" className="text-sm text-slate-500 hover:text-slate-800 mb-2 inline-block">
            ← Volver al panel
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {usuario.nombre} {usuario.apellido}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Folio: <span className="font-mono font-medium text-slate-700">{usuario.folio_registro}</span> · {usuario.correo}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">
            {usuario.titulos?.descripcion || 'Sin título'}
          </span>
          <UsuarioActions folio={usuario.folio_registro} nombreCompleto={`${usuario.nombre} ${usuario.apellido}`} />
        </div>
      </div>

      {/* Info general */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Información general</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Institución</span>
            <p className="text-slate-700 font-medium">{usuario.instituciones?.nombre || '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Estado</span>
            <p className="text-slate-700 font-medium">{usuario.estados?.nombre || '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Registrado el</span>
            <p className="text-slate-700 font-medium">
              {usuario.fecha_registro
                ? new Date(usuario.fecha_registro).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de depósitos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Historial de depósitos
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {depositos.length}
          </span>
        </h2>
        <HistorialDepositosAdmin depositos={depositos} />
      </div>
    </div>
  );
}
