'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad, Institucion } from '@/shared/types/catalogos';
import { getActividadesAction } from './actions';
import { ActividadModal } from './ActividadModal';

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const TIPO_COLORS: Record<string, string> = {
  'conferencia': 'bg-blue-100 text-blue-700',
  'taller': 'bg-amber-100 text-amber-700',
  'hackaton': 'bg-purple-100 text-purple-700',
  'torneo': 'bg-emerald-100 text-emerald-700',
};
function TipoBadge({ tipo }: { tipo: ActividadDTO['tipoActividad'] }) {
  if (!tipo) return <span className="text-slate-400 text-xs italic">Sin tipo</span>;
  const key = tipo.clave?.toLowerCase() ?? tipo.descripcion.toLowerCase();
  const color = TIPO_COLORS[key] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {tipo.descripcion}
    </span>
  );
}

interface Props {
  initialActividades: ActividadDTO[];
  tiposActividad: TipoActividad[];
  instituciones: Institucion[];
}

export default function ActividadesClient({ initialActividades, tiposActividad, instituciones }: Props) {
  const [actividades, setActividades] = useState<ActividadDTO[]>(initialActividades);
  const [editingActividad, setEditingActividad] = useState<ActividadDTO | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<number | undefined>(undefined);

  const actividadesFiltradas = filtroTipo != null
    ? actividades.filter((a) => a.idTipoActividad === filtroTipo)
    : actividades;

  const refresh = useCallback(async () => {
    const res = await getActividadesAction();
    if (res.success) setActividades(res.data);
  }, []);

  function openNew() {
    setEditingActividad(null);
    setIsOpen(true);
  }

  function openEdit(a: ActividadDTO) {
    setEditingActividad(a);
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setEditingActividad(null);
  }

  return (
    <div className="p-8 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Actividades</h1>
            <p className="text-slate-500 mt-1">Crea y administra las actividades del congreso ANIEI.</p>
          </div>
          <button
            id="btn-nueva-actividad"
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-lg active:scale-95"
          >
            <PlusIcon /> Nueva Actividad
          </button>
        </div>

        <div className="flex gap-3 flex-wrap items-end">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-slate-900">{actividades.length}</p>
          </div>
          {tiposActividad.map((t) => {
            const count = actividades.filter((a) => a.idTipoActividad === t.idTipoActividad).length;
            return (
              <div key={t.idTipoActividad} className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wide">{t.descripcion}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </div>
            );
          })}
          <div className="ml-auto">
            <select
              value={filtroTipo ?? ''}
              onChange={(e) => setFiltroTipo(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              <option value="">Todos los tipos</option>
              {tiposActividad.map((t) => (
                <option key={t.idTipoActividad} value={t.idTipoActividad}>{t.descripcion}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Actividad</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Sede</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold text-center">Cupo</th>
                  <th className="px-6 py-4 font-semibold text-center">Costo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {actividadesFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <CalendarIcon />
                        <span className="text-sm">
                          {actividades.length === 0
                            ? 'No hay actividades registradas aún.'
                            : 'No hay actividades con el filtro seleccionado.'}
                        </span>
                        {actividades.length === 0 && (
                          <button onClick={openNew} className="text-indigo-600 text-sm font-medium hover:underline">
                            Crear la primera actividad →
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  actividadesFiltradas.map((a) => (
                    <tr key={a.idActividad} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-900">{a.nombre}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><TipoBadge tipo={a.tipoActividad} /></td>
                      <td className="px-6 py-4">
                        {a.institucionSede ? (
                          <span className="text-slate-700 text-xs font-medium">
                            {a.institucionSede.abreviatura ?? a.institucionSede.nombre}
                            {a.idSala != null && <span className="text-slate-400"> / Sala {a.idSala}</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600">{formatFecha(a.fechaInicio)}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {a.cupoMaximo === 0 ? (
                          <span className="text-xs text-slate-400 font-medium">Sin límite</span>
                        ) : (() => {
                          const pct = Math.min(100, Math.round((a.cupoOcupado / a.cupoMaximo) * 100));
                          const lleno = a.cupoOcupado >= a.cupoMaximo;
                          const barColor = lleno ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';
                          return (
                            <div className="flex flex-col items-center gap-1 min-w-[72px]">
                              <span className={`text-xs font-bold ${lleno ? 'text-rose-600' : pct >= 80 ? 'text-amber-600' : 'text-slate-700'}`}>
                                {a.cupoOcupado} / {a.cupoMaximo}
                              </span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                              </div>
                              {lleno && (
                                <span className="text-[10px] text-rose-500 font-semibold">Lleno</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {a.costo != null && a.costo > 0 ? (
                          <span className="text-emerald-600 font-semibold text-xs">
                            ${a.costo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium">Gratis</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/cpanel/actividades/${a.idActividad}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <EyeIcon /> Detalles
                          </Link>
                          {a.tipoActividad?.manejaEquipos && (
                            <Link
                              href={`/cpanel/equipos/${a.idActividad}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 text-xs font-medium text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Equipos
                            </Link>
                          )}
                          <button
                            id={`btn-editar-${a.idActividad}`}
                            onClick={() => openEdit(a)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <EditIcon /> Editar
                          </button>
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

      {isOpen && (
        <ActividadModal
          editingActividad={editingActividad}
          tiposActividad={tiposActividad}
          instituciones={instituciones}
          onSuccess={refresh}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
