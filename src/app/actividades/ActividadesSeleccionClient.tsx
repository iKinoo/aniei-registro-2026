'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';

// ---- helpers ----
function formatFechaCorta(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}
function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

/** true si la actividad tiene cupo definido y está completamente llena */
function esCupoLleno(a: ActividadDTO) {
  return a.cupoMaximo > 0 && a.cupoOcupado >= a.cupoMaximo;
}

// ---- Indicador de cupo ----
function IndicadorCupo({ a }: { a: ActividadDTO }) {
  if (!a.cupoMaximo) return null; // sin restricción
  const lleno = esCupoLleno(a);
  const pct = Math.min(100, Math.round((a.cupoOcupado / a.cupoMaximo) * 100));
  const barColor = lleno ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className={`text-xs font-semibold ${lleno ? 'text-rose-600' : pct >= 80 ? 'text-amber-600' : 'text-slate-500'}`}>
          {lleno ? '🔴 Cupo lleno' : `${a.cupoOcupado} / ${a.cupoMaximo} lugares`}
        </span>
        {!lleno && (
          <span className="text-xs text-slate-400">{a.cupoMaximo - a.cupoOcupado} disponibles</span>
        )}
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ---- Type badge colors ----
const TIPO_COLORS: Record<string, { bg: string; text: string }> = {
  conferencia: { bg: 'bg-blue-100',   text: 'text-blue-700' },
  taller:      { bg: 'bg-amber-100',  text: 'text-amber-700' },
  seminario:   { bg: 'bg-violet-100', text: 'text-violet-700' },
  curso:       { bg: 'bg-teal-100',   text: 'text-teal-700' },
};

function TipoBadge({ tipo }: { tipo: ActividadDTO['tipoActividad'] }) {
  if (!tipo) return null;
  const key = (tipo.clave ?? tipo.descripcion).toLowerCase();
  const found = Object.entries(TIPO_COLORS).find(([k]) => key.includes(k));
  const { bg, text } = found?.[1] ?? { bg: 'bg-slate-100', text: 'text-slate-600' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {tipo.descripcion}
    </span>
  );
}

// ---- Cart summary (sticky sidebar) ----
interface CartProps {
  selected: ActividadDTO[];
  onRemove: (id: number) => void;
  onCheckout: () => void;
}

function CartSidebar({ selected, onRemove, onCheckout }: CartProps) {
  const total = selected.reduce((s, a) => s + (a.costo?.monto ?? 0), 0);

  return (
    <aside className="sticky top-24 w-full lg:w-80 shrink-0">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-5 py-4">
          <h2 className="text-white font-bold text-lg">Mi selección</h2>
          <p className="text-indigo-200 text-sm">{selected.length} actividad{selected.length !== 1 ? 'es' : ''}</p>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-72 overflow-y-auto">
          {selected.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">Ninguna actividad seleccionada aún.</p>
          ) : (
            selected.map((a) => (
              <div key={a.idActividad} className="flex items-start gap-3 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 leading-snug line-clamp-2">{a.nombre}</p>
                  {a.costo?.monto ? (
                    <p className="text-xs text-emerald-600 font-semibold mt-0.5">
                      ${a.costo.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5">Sin costo</p>
                  )}
                </div>
                <button
                  onClick={() => onRemove(a.idActividad)}
                  className="text-slate-300 hover:text-rose-500 transition-colors mt-0.5 shrink-0"
                  aria-label="Quitar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-100 px-5 py-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Total a pagar</span>
            <span className="text-xl font-bold text-slate-900">
              {total === 0 ? (
                <span className="text-emerald-600 text-base font-semibold">Gratis</span>
              ) : (
                `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
              )}
            </span>
          </div>
          <button
            id="btn-checkout"
            onClick={onCheckout}
            disabled={selected.length === 0}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-200 hover:shadow-lg active:scale-95"
          >
            Continuar →
          </button>
        </div>
      </div>
    </aside>
  );
}

// ---- Activity card ----
interface CardProps {
  actividad: ActividadDTO;
  isSelected: boolean;
  isInscrita: boolean;
  onToggle: (a: ActividadDTO) => void;
}

function ActividadCard({ actividad: a, isSelected, isInscrita, onToggle }: CardProps) {
  const tieneCosto = a.costo?.monto != null;
  const lleno = esCupoLleno(a);
  // Una actividad no es elegible si ya está inscrito o si no hay cupo
  const noElegible = isInscrita || lleno;

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden
        ${lleno ? 'border-rose-100 opacity-80' :
          isInscrita ? 'border-emerald-200 opacity-70' :
          isSelected ? 'border-indigo-400 shadow-lg shadow-indigo-100' :
          'border-slate-100 hover:border-slate-300 shadow-sm hover:shadow-md'}`}
    >
      {/* Top stripe */}
      <div className={`h-1 w-full ${lleno ? 'bg-rose-400' : isInscrita ? 'bg-emerald-400' : isSelected ? 'bg-indigo-500' : 'bg-slate-200'}`} />

      <div className="p-5">
        {/* Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <TipoBadge tipo={a.tipoActividad} />
            {lleno && !isInscrita && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">
                🔴 Cupo lleno
              </span>
            )}
            {isInscrita && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                ✓ Ya inscrito
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            {tieneCosto ? (
              <span className="text-sm font-bold text-slate-800">
                ${a.costo!.monto!.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Gratis</span>
            )}
          </div>
        </div>

        {/* Name & description */}
        <h3 className="font-bold text-slate-900 text-base leading-snug mb-1">{a.nombre}</h3>

        {/* Capacity indicator */}
        <IndicadorCupo a={a} />

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatFechaCorta(a.fechaInicio)} · {formatHora(a.fechaInicio)}–{formatHora(a.fechaFin)}
          </span>
          {a.institucionSede && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {a.institucionSede.abreviatura ?? a.institucionSede.nombre}
              {a.idSala != null && ` · Sala ${a.idSala}`}
            </span>
          )}
        </div>

        {/* Ponentes */}
        {a.ponentes && a.ponentes.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {a.ponentes.slice(0, 2).map((p) => (
              <span key={p.idUsuario} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-700">
                <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="font-medium">{p.nombre} {p.apellido}</span>
                {p.rol && <span className="text-slate-400">· {p.rol}</span>}
              </span>
            ))}
            {a.ponentes.length > 2 && (
              <span className="inline-flex items-center px-2 py-1 bg-slate-100 rounded-lg text-xs text-slate-500">
                +{a.ponentes.length - 2} más
              </span>
            )}
          </div>
        )}

        {/* Action button */}
        {!noElegible && (
          <button
            id={`btn-actividad-${a.idActividad}`}
            onClick={() => onToggle(a)}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95
              ${isSelected
                ? 'bg-indigo-50 border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-100'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'}`}
          >
            {isSelected ? '✓ Seleccionado — Quitar' : '+ Agregar al carrito'}
          </button>
        )}

        {/* Estado deshabilitado por cupo */}
        {lleno && !isInscrita && (
          <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-slate-100 text-slate-400 cursor-not-allowed select-none">
            Sin lugares disponibles
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Main component ----
interface Props {
  actividades: ActividadDTO[];
  inscritasIds: number[];
}

export default function ActividadesSeleccionClient({ actividades, inscritasIds }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<ActividadDTO[]>([]);
  const inscritasSet = new Set(inscritasIds);

  const toggleActividad = (a: ActividadDTO) => {
    if (esCupoLleno(a)) return; // guardia extra
    setSelected((prev) =>
      prev.find((s) => s.idActividad === a.idActividad)
        ? prev.filter((s) => s.idActividad !== a.idActividad)
        : [...prev, a],
    );
  };

  const removeActividad = (id: number) => {
    setSelected((prev) => prev.filter((a) => a.idActividad !== id));
  };

  const handleCheckout = () => {
    const ids = selected.map((a) => a.idActividad).join(',');
    router.push(`/actividades/checkout?ids=${ids}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero header */}
      <div className="bg-linear-to-br from-indigo-900 via-indigo-800 to-violet-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            Actividades del Congreso
          </h1>
          <p className="text-indigo-200 text-lg">
            Selecciona las actividades a las que deseas inscribirte.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Activities grid */}
          <div className="flex-1 min-w-0">
            {actividades.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-lg font-medium">No hay actividades disponibles aún.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {actividades.map((a) => (
                  <ActividadCard
                    key={a.idActividad}
                    actividad={a}
                    isSelected={!!selected.find((s) => s.idActividad === a.idActividad)}
                    isInscrita={inscritasSet.has(a.idActividad)}
                    onToggle={toggleActividad}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sticky cart */}
          <CartSidebar
            selected={selected}
            onRemove={removeActividad}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
