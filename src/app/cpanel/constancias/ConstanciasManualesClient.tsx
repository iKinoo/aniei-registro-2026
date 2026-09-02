'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConstanciaManualModal } from './ConstanciaManualModal';
import { obtenerConstanciasManualesAction, ConstanciaManualResponse } from './actions';

const PlusIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const SpinnerIcon = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
);

export function ConstanciasManualesClient() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [constancias, setConstancias] = useState<ConstanciaManualResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchConstancias = useCallback(async () => {
    setLoading(true);
    const result = await obtenerConstanciasManualesAction();
    if (result.success) {
      setConstancias(result.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConstancias();
  }, [fetchConstancias]);

  const handleSuccess = (data: ConstanciaManualResponse) => {
    setConstancias((prev) => [data, ...prev]);
    setIsModalOpen(false);
    setSuccessMessage('Constancia generada exitosamente');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Constancias Manuales</h2>
          <p className="text-sm text-slate-500 mt-1">
            Genere constancias para personas que no están registradas en el sistema.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <PlusIcon />
          Nueva Constancia
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-900">Constancias Generadas</h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Historial de constancias manuales generadas.
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <SpinnerIcon />
              <p className="text-slate-500">Cargando constancias...</p>
            </div>
          </div>
        ) : constancias.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-slate-600 font-medium">No hay constancias generadas</p>
                <p className="text-slate-400 text-sm mt-1">
                  Haga clic en &quot;Nueva Constancia&quot; para comenzar.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold text-slate-900">Fecha</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Tipo</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Destinatarios</th>
                  <th className="px-6 py-3 font-semibold text-slate-900">Descripción</th>
                  <th className="px-6 py-3 font-semibold text-slate-900 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {constancias.map((c) => (
                  <tr key={c.idConstancia} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">
                      {formatDate(c.fechaGeneracion)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md">
                        {c.tipoConstanciaLabel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {c.destinatarios.slice(0, 2).join(', ')}
                      {c.destinatarios.length > 2 && (
                        <span className="text-slate-400 text-xs ml-1">
                          +{c.destinatarios.length - 2} más
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate">
                      {c.descripcion}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex gap-2">
                        <a
                          href={c.urlPdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                        >
                          <ExternalLinkIcon />
                          Abrir
                        </a>
                        <a
                          href={c.urlPdf}
                          download
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-200 shadow-sm text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          <DownloadIcon />
                          Descargar
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ConstanciaManualModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
