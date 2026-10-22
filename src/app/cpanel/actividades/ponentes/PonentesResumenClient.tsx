'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { PonenteResumenDTO } from '@/application/dtos/ActividadDTO';

interface Props {
  ponentes: PonenteResumenDTO[];
}

export default function PonentesResumenClient({ ponentes }: Props) {
  const [busqueda, setBusqueda] = useState('');

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
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, correo o folio…"
            className="w-full md:w-80 px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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
