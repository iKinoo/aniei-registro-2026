import { getActividadesConEquiposAction } from './actions';
import EquiposListClient from './EquiposListClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Administrar Equipos | CPanel ANIEI',
};

export default async function EquiposPage() {
  const actividadesRes = await getActividadesConEquiposAction();
  const actividades = actividadesRes.success ? actividadesRes.data : [];

  return <EquiposListClient actividades={actividades} />;
}
