import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getActividadesAction, getInscripcionesUsuarioAction } from '../actions';
import ActividadesSeleccionClient from '../ActividadesSeleccionClient';

export const metadata = { title: 'Actividades | ANIEI 2026' };

export default async function ActividadesListPage() {
  const session = await auth();
  if (!(session?.user as any)?.folioRegistro) redirect('/login');

  const [actRes, inscRes] = await Promise.all([
    getActividadesAction(),
    getInscripcionesUsuarioAction(),
  ]);

  return (
    <ActividadesSeleccionClient
      actividades={actRes.success ? actRes.data : []}
      inscritasIds={inscRes.success ? inscRes.data : []}
      titulo="Actividades"
    />
  );
}
