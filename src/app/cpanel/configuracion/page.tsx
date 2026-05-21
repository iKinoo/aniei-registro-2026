import { getTiposActividadAction, obtenerPreciosAction } from './actions';
import PreciosClient from './PreciosClient';

export const metadata = {
  title: 'Configuración - CPanel',
};

export default async function ConfiguracionPage() {
  const [tiposResult, preciosResult] = await Promise.all([
    getTiposActividadAction(),
    obtenerPreciosAction(),
  ]);
  const tiposActividad = tiposResult.success ? tiposResult.data : [];
  const precios = preciosResult.success ? preciosResult.data : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra los parámetros del sistema.
        </p>
      </div>

      <PreciosClient initialPrecios={precios} />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h2 className="text-base font-semibold text-slate-900">Tipos de Actividad</h2>
          <p className="mt-1 text-sm text-slate-500">
            Para toda actividad, los ponentes siempre se les genera su constancia.
          </p>
        </div>
        <div className="p-0">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-900">ID</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Clave</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Descripción</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Maneja Equipos</th>
                <th className="px-6 py-3 font-semibold text-slate-900">Genera Constancia Participante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {tiposActividad.map((tipo) => (
                <tr key={tipo.idTipoActividad} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-700">{tipo.idTipoActividad}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{tipo.clave || <span className="text-slate-400 italic">S/C</span>}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-md">
                    {tipo.descripcion || <span className="text-slate-400 italic">Sin descripción</span>}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tipo.manejaEquipos ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {tipo.manejaEquipos ? 'Sí' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      tipo.generaConstanciaParticipante ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {tipo.generaConstanciaParticipante ? 'Sí' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
              {tiposActividad.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron tipos de actividad.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
