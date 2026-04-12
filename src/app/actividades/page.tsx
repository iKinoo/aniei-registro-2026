import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getActividadesDisponiblesAction, getInscripcionesUsuarioAction } from './actions';
import ActividadesSeleccionClient from './ActividadesSeleccionClient';

export const metadata = { title: 'Selección de Actividades | ANIEI 2026' };

export default async function ActividadesPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const [actRes, inscRes] = await Promise.all([
    getActividadesDisponiblesAction(),
    getInscripcionesUsuarioAction(),
  ]);

  const actividades = actRes.success ? actRes.data : [];
  const inscritasIds = inscRes.success ? inscRes.data : [];

  return (
    <ActividadesSeleccionClient
      actividades={actividades}
      inscritasIds={inscritasIds}
    />
  );
}
