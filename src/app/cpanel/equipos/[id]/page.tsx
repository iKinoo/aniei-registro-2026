import { redirect } from 'next/navigation';
import { getActividadDetalleAction, getEquiposAction } from '../actions';
import EquiposManagerClient from './EquiposManagerClient';

export const metadata = {
  title: 'Gestión de Equipos | CPanel ANIEI',
};

export default async function EquiposDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const idActividad = parseInt(id, 10);

  if (isNaN(idActividad)) {
    redirect('/cpanel/equipos');
  }

  const [actividadRes, equiposRes] = await Promise.all([
    getActividadDetalleAction(idActividad),
    getEquiposAction(idActividad),
  ]);

  if (!actividadRes.success) {
    redirect('/cpanel/equipos');
  }

  const actividad = actividadRes.data;
  const equipos = equiposRes.success ? equiposRes.data : [];

  return <EquiposManagerClient actividad={actividad} initialEquipos={equipos} />;
}
