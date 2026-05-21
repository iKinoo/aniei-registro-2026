'use client';

import { useState } from 'react';

export interface DepositoHistorialItem {
  idDeposito: number | null;
  proposito: string;
  monto: number;
  referencia: string;
  bancoSucursal: string | null;
  ciudad: string | null;
  fechaDeposito: Date;
  fechaRegistro: Date;
  notas: string | null;
  archivoUrl: string;
  archivoNombre: string;
}

interface Props {
  depositos: DepositoHistorialItem[];
  isAdmin?: boolean;
  onVerArchivo?: (ruta: string) => void;
  loadingArchivo?: boolean;
}

const propositoLabels: Record<string, string> = {
  EVENTO_PRINCIPAL: 'Congreso Principal',
  ACTIVIDADES: 'Actividades',
  GRUPO_RAPIDO: 'Registro Grupal',
};

export function HistorialDepositos({ depositos, isAdmin, onVerArchivo, loadingArchivo }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  if (depositos.length === 0) {
    return (
      <div className={`rounded-xl border p-8 text-center ${isAdmin ? 'bg-slate-50 border-slate-200' : 'bg-slate-50 border-slate-200'}`}>
        <svg className="w-10 h-10 mx-auto text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-500 text-sm">No hay depósitos registrados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {depositos.map((dep) => {
        const isExpanded = expandedId === (dep.idDeposito ?? 0);
        return (
          <div
            key={dep.idDeposito ?? dep.referencia}
            className={`rounded-xl border transition-all ${isAdmin ? 'bg-white border-slate-200 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            {/* Header resumido */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : (dep.idDeposito ?? 0))}
              className="w-full px-5 py-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  dep.proposito === 'EVENTO_PRINCIPAL'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                    : dep.proposito === 'ACTIVIDADES'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-violet-50 text-violet-700 border border-violet-100'
                }`}>
                  {propositoLabels[dep.proposito] || dep.proposito}
                </span>
                <span className="font-semibold text-slate-900">
                  ${dep.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
                <span className="text-slate-400 text-xs">
                  Ref: {dep.referencia}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {new Date(dep.fechaDeposito).toLocaleDateString('es-MX')}
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* Detalles expandibles */}
            {isExpanded && (
              <div className="px-5 pb-5 border-t border-slate-100 pt-4">
                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Banco / Sucursal</span>
                    <p className="text-slate-700 font-medium">{dep.bancoSucursal || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Ciudad</span>
                    <p className="text-slate-700 font-medium">{dep.ciudad || '—'}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Fecha del depósito</span>
                    <p className="text-slate-700 font-medium">
                      {new Date(dep.fechaDeposito).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-xs uppercase tracking-wider">Registrado el</span>
                    <p className="text-slate-700 font-medium">
                      {new Date(dep.fechaRegistro).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {dep.notas && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-400 text-xs uppercase tracking-wider">Notas</span>
                      <p className="text-slate-700 mt-1 bg-slate-50 rounded-lg p-3 border border-slate-100">{dep.notas}</p>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    {onVerArchivo ? (
                      <button
                        type="button"
                        onClick={() => onVerArchivo(dep.archivoUrl)}
                        disabled={loadingArchivo}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {loadingArchivo ? 'Cargando...' : 'Ver comprobante'}
                      </button>
                    ) : (
                      <a
                        href={dep.archivoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Ver comprobante
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
