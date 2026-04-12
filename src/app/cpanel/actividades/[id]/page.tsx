import { getDetalleActividadAction } from './actions';
import DetalleActividadClient from './DetalleActividadClient';

export default async function DetalleActividadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getDetalleActividadAction(id);

  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-slate-500">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{result.error || 'No se pudo cargar la actividad'}</p>
      </div>
    );
  }

  return <DetalleActividadClient {...result.data} />;
}