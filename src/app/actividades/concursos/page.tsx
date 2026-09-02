import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getConcursosAction, getInscripcionesUsuarioAction } from '../actions';
import ActividadesSeleccionClient from '../ActividadesSeleccionClient';

export const metadata = { title: 'Concursos | ANIEI 2026' };

export default async function ConcursosPage() {
  const session = await auth();
  if (!(session?.user as any)?.folioRegistro) redirect('/login');

  const [actRes, inscRes] = await Promise.all([
    getConcursosAction(),
    getInscripcionesUsuarioAction(),
  ]);

  return (
    <ActividadesSeleccionClient
      actividades={actRes.success ? actRes.data : []}
      inscritasIds={inscRes.success ? inscRes.data : []}
      titulo="Concursos"
    />
  );
}
