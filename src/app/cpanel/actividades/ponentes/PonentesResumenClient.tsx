'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PonenteResumenDTO } from '@/application/dtos/ActividadDTO';
import { enviarListasAsistenciaPonenteAction, enviarTodasLasListasAction } from './actions';

interface Props {
  ponentes: PonenteResumenDTO[];
}

export default function PonentesResumenClient({ ponentes }: Props) {
  const [busqueda, setBusqueda] = useState('');
  const [enviandoFolio, setEnviandoFolio] = useState<string | null>(null);
  const [enviandoTodas, setEnviandoTodas] = useState(false);

  const ocupado = enviandoTodas || enviandoFolio !== null;

  const actividadesUnicas = useMemo(
    () => new Set(ponentes.flatMap((p) => p.actividades.map((a) => a.idActividad))).size,
    [ponentes],
  );

  const handleEnviarPonente = async (p: PonenteResumenDTO) => {
    if (!confirm(`¿Enviar las ${p.actividades.length} lista(s) de asistencia de ${p.nombre} ${p.apellido} a ${p.correo}?`)) return;
    setEnviandoFolio(p.folioRegistro);
    try {
      const res = await enviarListasAsistenciaPonenteAction(p.folioRegistro);
      if (res.success) {
        alert(`Envío iniciado: ${res.actividades} lista(s) se enviarán a ${res.correo} en segundo plano.`);
      } else {
        alert('Error: ' + res.error);
      }
    } finally {
      setEnviandoFolio(null);
    }
  };

  const handleEnviarTodas = async () => {
    if (!confirm(`¿Enviar las listas de asistencia a los ${ponentes.length} ponentes (${actividadesUnicas} actividad(es))? Se generarán los PDFs y se enviará un correo por ponente.`)) return;
    setEnviandoTodas(true);
    try {
      const res = await enviarTodasLasListasAction();
      if (!res.success) {
        alert('Error: ' + res.error);
        return;
      }
      alert(`Envío iniciado a ${res.ponentes} ponentes (${res.actividades} actividad(es)) en segundo plano. Los fallos se reportan por correo de alerta.`);
    } finally {
      setEnviandoTodas(false);
    }
  };

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return ponentes;
    return ponentes.filter((p) =>
      `${p.nombre} ${p.apellido} ${p.correo} ${p.folioRegistro}`.toLowerCase().includes(q),
    );
  }, [ponentes, busqueda]);

  return (
    <div className="p-8 font-sans min-h-full">
      <div className="max-w-6xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <Link href="/cpanel/actividades" className="text-slate-300 hover:text-white transition-colors text-sm">
              ← Volver a actividades
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">Ponentes</h1>
            <p className="text-slate-300 mt-1">
              {ponentes.length} ponente{ponentes.length === 1 ? '' : 's'} con actividades asignadas en el congreso.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, correo o folio…"
              className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleEnviarTodas}
              disabled={ocupado || ponentes.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-lg active:scale-95 disabled:opacity-50 whitespace-nowrap"
            >
              {enviandoTodas ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {enviandoTodas ? 'Enviando a todos…' : 'Enviar todas las listas'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Ponente</th>
                  <th className="px-6 py-3 font-semibold">Correo</th>
                  <th className="px-6 py-3 font-semibold">Folio</th>
                  <th className="px-6 py-3 font-semibold">Actividades que imparte</th>
                  <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      {ponentes.length === 0
                        ? 'Aún no hay ponentes vinculados a actividades.'
                        : 'Ningún ponente coincide con la búsqueda.'}
                    </td>
                  </tr>
                ) : (
                  filtrados.map((p) => (
                    <tr key={p.folioRegistro} className="hover:bg-slate-50/50 transition-colors align-top">
                      <td className="px-6 py-4">
                        <Link
                          href={`/cpanel/usuarios/${p.folioRegistro}`}
                          className="font-semibold text-indigo-700 hover:text-indigo-800 hover:underline"
                        >
                          {p.nombre} {p.apellido}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{p.correo}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.folioRegistro}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xl whitespace-normal">
                          {p.actividades.map((a) => (
                            <Link
                              key={a.idActividad}
                              href={`/cpanel/actividades/${a.idActividad}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                              title={a.rol ?? 'Ponente'}
                            >
                              <span className="max-w-[220px] truncate">{a.nombre}</span>
                              {a.rol && <span className="text-indigo-400 shrink-0">· {a.rol}</span>}
                            </Link>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleEnviarPonente(p)}
                          disabled={ocupado}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-indigo-700 bg-indigo-50 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 min-w-max"
                        >
                          {enviandoFolio === p.folioRegistro ? (
                            <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          )}
                          {enviandoFolio === p.folioRegistro ? 'Enviando…' : 'Enviar listas de asistencia al correo'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
