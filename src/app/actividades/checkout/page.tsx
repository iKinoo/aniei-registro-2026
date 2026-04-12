import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getActividadesPorIdsAction, getEstadosCheckoutAction } from '../checkout/actions';
import CheckoutClient from './CheckoutClient';

export const metadata = { title: 'Checkout de Actividades | ANIEI 2026' };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ ids?: string }> }) {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const params = await searchParams;
  const ids = (params.ids ?? '')
    .split(',')
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0);

  if (ids.length === 0) redirect('/actividades');

  const [actRes, estadosRes] = await Promise.all([
    getActividadesPorIdsAction(ids),
    getEstadosCheckoutAction(),
  ]);

  const actividades = actRes.success ? actRes.data : [];
  const estados = estadosRes.success ? estadosRes.data : [];

  if (actividades.length === 0) redirect('/actividades');

  return (
    <CheckoutClient
      actividades={actividades}
      estados={estados}
    />
  );
}
