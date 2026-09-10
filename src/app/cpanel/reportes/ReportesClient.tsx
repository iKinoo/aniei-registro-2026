'use client';

import { useState, useEffect, useCallback } from 'react';
import { obtenerReporteInstitucionesAction, generarReporteInstitucionesPdfAction, InstitucionReporteItem } from './actions';

const DownloadIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin mr-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export function ReportesClient() {
  const [instituciones, setInstituciones] = useState<InstitucionReporteItem[]>([]);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingPdf, setLoadingPdf] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await obtenerReporteInstitucionesAction();
    if (result.success) {
      setInstituciones(result.data);
      setTotalParticipantes(result.totalParticipantes);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDescargarPdf = async () => {
    setLoadingPdf(true);
    try {
      const result = await generarReporteInstitucionesPdfAction();
      if (result.success) {
        const { base64, nombreArchivo } = result.data;
        const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert(result.error);
      }
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reportes</h2>
          <p className="text-sm text-slate-500 mt-1">
            Genera reportes y estadísticas del congreso.
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{instituciones.length}</p>
              <p className="text-sm text-slate-500">Instituciones participantes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalParticipantes}</p>
              <p className="text-sm text-slate-500">Total de participantes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reporte de Instituciones */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Instituciones Participantes</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Número de participantes por institución.
            </p>
          </div>
          <button
            onClick={handleDescargarPdf}
            disabled={loadingPdf || loading}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {loadingPdf ? (
              <>
                <SpinnerIcon />
                Generando...
              </>
            ) : (
              <>
                <DownloadIcon />
                Descargar PDF
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-slate-500">Cargando reporte...</p>
            </div>
          </div>
        ) : instituciones.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-slate-500">No hay datos disponibles.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-900 w-16">#</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Institución</th>
                  <th className="px-6 py-3 font-semibold text-slate-900 text-right">Participantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instituciones.map((inst, index) => (
                  <tr key={inst.idInstitucion} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-900">
                        {inst.abreviatura ? `${inst.abreviatura} - ` : ''}{inst.nombre}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                        {inst.totalParticipantes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t border-slate-200">
                <tr>
                  <td className="px-6 py-3"></td>
                  <td className="px-6 py-3 font-semibold text-slate-900">Total</td>
                  <td className="px-6 py-3 text-right">
                    <span className="inline-flex px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">
                      {totalParticipantes}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
