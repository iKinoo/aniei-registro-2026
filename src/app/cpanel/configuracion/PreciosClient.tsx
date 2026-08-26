'use client';

import { useState, useTransition } from 'react';
import { PrecioInscripcion } from '@/shared/types/catalogos';
import { guardarPrecioAction } from './actions';

function toDateInputValue(date: Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

interface Props {
  initialPrecios: PrecioInscripcion[];
}

export default function PreciosClient({ initialPrecios }: Props) {
  const [precios, setPrecios] = useState<PrecioInscripcion[]>(initialPrecios);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sorted = [...precios].sort((a, b) => a.orden - b.orden);

  function updateField(id: number, field: string, value: string | number | boolean) {
    setPrecios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  async function handleGuardarTodos() {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    for (const precio of sorted) {
      const fechaLimite = new Date(precio.fechaLimite);
      if (isNaN(fechaLimite.getTime())) {
        setErrorMsg(`Nivel ${precio.orden}: seleccione una fecha válida.`);
        setSaving(false);
        return;
      }
    }

    startTransition(async () => {
      let primerError: string | null = null;

      for (const precio of sorted) {
        const result = await guardarPrecioAction(precio.id, {
          fechaLimite: new Date(precio.fechaLimite),
          costo: precio.costo,
          costoMiembro: precio.costoMiembro,
          orden: precio.orden,
          activo: precio.activo,
        });

        if (!result.success && !primerError) {
          primerError = result.error || `Error al guardar nivel ${precio.orden}`;
        }
      }

      if (primerError) {
        setErrorMsg(primerError);
      } else {
        setSuccessMsg('Todos los precios se guardaron correctamente.');
        setTimeout(() => setSuccessMsg(null), 3000);
      }
      setSaving(false);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-base font-semibold text-slate-900">Precios de Inscripción</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define los 3 niveles de precio con sus fechas de vigencia. El precio vigente es el del nivel con la fecha más reciente (≤ hoy).
        </p>
      </div>

      {successMsg && (
        <div className="mx-6 mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {errorMsg}
        </div>
      )}

      <div className="p-6 space-y-5">
        {sorted.map((precio) => (
          <div
            key={precio.id}
            className={`rounded-xl border p-5 transition-all ${
              precio.activo
                ? 'border-slate-200 bg-white'
                : 'border-slate-100 bg-slate-50/50 opacity-70'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                  {precio.orden}
                </span>
                <span className="text-sm font-semibold text-slate-900">
                  Nivel {precio.orden}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-slate-500">{precio.activo ? 'Activo' : 'Inactivo'}</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={precio.activo}
                  onClick={() => updateField(precio.id, 'activo', !precio.activo)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
                    precio.activo ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      precio.activo ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Aplica a partir de <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={toDateInputValue(precio.fechaLimite)}
                  onChange={(e) => updateField(precio.id, 'fechaLimite', e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-600">
                  Costo base <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={precio.costo}
                    onChange={(e) => updateField(precio.id, 'costo', parseFloat(e.target.value) || 0)}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        {sorted.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-sm">No hay niveles de precio configurados.</p>
          </div>
        )}

        {sorted.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleGuardarTodos}
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar todos los precios
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
