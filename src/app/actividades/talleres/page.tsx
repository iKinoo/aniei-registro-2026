import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTalleresAction, getInscripcionesUsuarioAction } from '../actions';
import ActividadesSeleccionClient from '../ActividadesSeleccionClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Talleres | ANIEI 2026' };

export default async function TalleresPage() {
  const session = await auth();
  if (!(session?.user as any)?.folioRegistro) redirect('/login');

  const [actRes, inscRes] = await Promise.all([
    getTalleresAction(),
    getInscripcionesUsuarioAction(),
  ]);

  return (
    <ActividadesSeleccionClient
      actividades={actRes.success ? actRes.data : []}
      inscritasIds={inscRes.success ? inscRes.data : []}
      titulo="Talleres"
    />
  );
}
