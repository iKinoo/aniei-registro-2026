import { getActividadesAction, getTiposActividadAction, getInstitucionesAction } from './actions';
import ActividadesClient from './ActividadesClient';

export const metadata = {
  title: 'Gestión de Actividades | CPanel ANIEI',
};

export default async function ActividadesPage() {
  const [actividadesRes, tiposRes, institucionesRes] = await Promise.all([
    getActividadesAction(),
    getTiposActividadAction(),
    getInstitucionesAction(),
  ]);

  const actividades = actividadesRes.success ? actividadesRes.data : [];
  const tiposActividad = tiposRes.success ? tiposRes.data : [];
  const instituciones = institucionesRes.success ? institucionesRes.data : [];

  return (
    <ActividadesClient
      initialActividades={actividades}
      tiposActividad={tiposActividad}
      instituciones={instituciones}
    />
  );
}
