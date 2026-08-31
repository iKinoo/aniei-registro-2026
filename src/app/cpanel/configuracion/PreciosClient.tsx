'use client';

import { useState, useTransition } from 'react';
import { PrecioInscripcion, TipoParticipante } from '@/shared/types/catalogos';
import { guardarPrecioAction, crearPrecioAction, eliminarPrecioAction, guardarTipoParticipanteAction, crearTipoParticipanteAction, eliminarTipoParticipanteAction } from './actions';

function toDateInputValue(date: Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

interface Props {
  initialPrecios: PrecioInscripcion[];
  initialTiposParticipante: TipoParticipante[];
}

export default function PreciosClient({ initialPrecios, initialTiposParticipante }: Props) {
  const [precios, setPrecios] = useState<PrecioInscripcion[]>(initialPrecios);
  const [tiposParticipante, setTiposParticipante] = useState<TipoParticipante[]>(initialTiposParticipante);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sortedTipos = [...tiposParticipante].sort((a, b) => a.orden - b.orden);

  function updatePrecioField(id: number, field: string, value: string | number | boolean) {
    setPrecios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  function updateTipoField(id: number, field: string, value: string | number) {
    setTiposParticipante((prev) =>
      prev.map((t) => (t.idTipoParticipante === id ? { ...t, [field]: value } : t))
    );
    setErrorMsg(null);
    setSuccessMsg(null);
  }

  async function handleGuardarTodos() {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      let primerError: string | null = null;

      for (const tipo of sortedTipos) {
        const result = await guardarTipoParticipanteAction(tipo.idTipoParticipante, {
          descripcion: tipo.descripcion,
          clave: tipo.clave ?? undefined,
          orden: tipo.orden,
        });
        if (!result.success && !primerError) {
          primerError = result.error || `Error al guardar tipo ${tipo.descripcion}`;
        }
      }

      for (const precio of precios) {
        const fechaLimite = new Date(precio.fechaLimite);
        if (isNaN(fechaLimite.getTime())) {
          setErrorMsg(`Fecha inválida en precio ID ${precio.id}.`);
          setSaving(false);
          return;
        }
        const result = await guardarPrecioAction(precio.id, {
          idTipoParticipante: precio.idTipoParticipante,
          esAfiliada: precio.esAfiliada,
          fechaLimite: new Date(precio.fechaLimite),
          costo: precio.costo,
          orden: precio.orden,
          activo: precio.activo,
        });
        if (!result.success && !primerError) {
          primerError = result.error || `Error al guardar precio ID ${precio.id}`;
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

  async function handleAgregarTipo() {
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      const result = await crearTipoParticipanteAction({
        descripcion: 'Nuevo tipo',
        clave: 'NUEVO',
        orden: sortedTipos.length + 1,
      });
      if (result.success) {
        setTiposParticipante((prev) => [...prev, result.data]);
      } else {
        setErrorMsg(result.error || 'Error al crear tipo de participante');
      }
      setSaving(false);
    });
  }

  async function handleEliminarTipo(id: number) {
    if (!confirm('¿Eliminar este tipo de participante? También se eliminarán sus precios.')) return;
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      const result = await eliminarTipoParticipanteAction(id);
      if (result.success) {
        setTiposParticipante((prev) => prev.filter((t) => t.idTipoParticipante !== id));
        setPrecios((prev) => prev.filter((p) => p.idTipoParticipante !== id));
      } else {
        setErrorMsg(result.error || 'Error al eliminar tipo de participante');
      }
      setSaving(false);
    });
  }

  async function handleAgregarPrecio(idTipoParticipante: number, esAfiliada: boolean) {
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      const preciosExistentes = precios.filter(
        (p) => p.idTipoParticipante === idTipoParticipante && p.esAfiliada === esAfiliada
      );
      const result = await crearPrecioAction({
        idTipoParticipante,
        esAfiliada,
        fechaLimite: new Date(),
        costo: 0,
        orden: preciosExistentes.length + 1,
        activo: true,
      });
      if (result.success) {
        setPrecios((prev) => [...prev, result.data]);
      } else {
        setErrorMsg(result.error || 'Error al crear precio');
      }
      setSaving(false);
    });
  }

  async function handleEliminarPrecio(id: number) {
    if (!confirm('¿Eliminar este precio?')) return;
    setSaving(true);
    setErrorMsg(null);
    startTransition(async () => {
      const result = await eliminarPrecioAction(id);
      if (result.success) {
        setPrecios((prev) => prev.filter((p) => p.id !== id));
      } else {
        setErrorMsg(result.error || 'Error al eliminar precio');
      }
      setSaving(false);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-base font-semibold text-slate-900">Tipos de Participante y Precios</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define los tipos de participante y sus precios según afiliación y fecha.
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

      <div className="p-6 space-y-6">
        {sortedTipos.map((tipo) => {
          const preciosTipo = precios.filter((p) => p.idTipoParticipante === tipo.idTipoParticipante);
          const preciosAfiliada = preciosTipo.filter((p) => p.esAfiliada).sort((a, b) => a.orden - b.orden);
          const preciosNoAfiliada = preciosTipo.filter((p) => !p.esAfiliada).sort((a, b) => a.orden - b.orden);

          return (
            <div key={tipo.idTipoParticipante} className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold">
                    {tipo.orden}
                  </span>
                  <div className="flex-1 grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={tipo.descripcion}
                      onChange={(e) => updateTipoField(tipo.idTipoParticipante, 'descripcion', e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Descripción"
                    />
                    <input
                      type="text"
                      value={tipo.clave || ''}
                      onChange={(e) => updateTipoField(tipo.idTipoParticipante, 'clave', e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Clave"
                    />
                    <input
                      type="number"
                      value={tipo.orden}
                      onChange={(e) => updateTipoField(tipo.idTipoParticipante, 'orden', parseInt(e.target.value) || 0)}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Orden"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEliminarTipo(tipo.idTipoParticipante)}
                  className="ml-3 text-red-500 hover:text-red-700 p-2"
                  title="Eliminar tipo"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-emerald-700">Institución Afiliada</span>
                    <button
                      type="button"
                      onClick={() => handleAgregarPrecio(tipo.idTipoParticipante, true)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Agregar precio
                    </button>
                  </div>
                  {preciosAfiliada.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Sin precios configurados</p>
                  ) : (
                    <div className="space-y-2">
                      {preciosAfiliada.map((precio) => (
                        <div key={precio.id} className="flex items-center gap-2 bg-slate-50 rounded p-2">
                          <input
                            type="date"
                            value={toDateInputValue(precio.fechaLimite)}
                            onChange={(e) => updatePrecioField(precio.id, 'fechaLimite', e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={precio.costo}
                              onChange={(e) => updatePrecioField(precio.id, 'costo', parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-300 rounded pl-5 pr-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEliminarPrecio(precio.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-amber-700">Institución No Afiliada</span>
                    <button
                      type="button"
                      onClick={() => handleAgregarPrecio(tipo.idTipoParticipante, false)}
                      className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      + Agregar precio
                    </button>
                  </div>
                  {preciosNoAfiliada.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-2">Sin precios configurados</p>
                  ) : (
                    <div className="space-y-2">
                      {preciosNoAfiliada.map((precio) => (
                        <div key={precio.id} className="flex items-center gap-2 bg-slate-50 rounded p-2">
                          <input
                            type="date"
                            value={toDateInputValue(precio.fechaLimite)}
                            onChange={(e) => updatePrecioField(precio.id, 'fechaLimite', e.target.value)}
                            className="flex-1 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <div className="relative w-24">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={precio.costo}
                              onChange={(e) => updatePrecioField(precio.id, 'costo', parseFloat(e.target.value) || 0)}
                              className="w-full bg-white border border-slate-300 rounded pl-5 pr-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEliminarPrecio(precio.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-between pt-2">
          <button
            type="button"
            onClick={handleAgregarTipo}
            disabled={saving}
            className="px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
          >
            + Agregar tipo de participante
          </button>
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
                Guardar todo
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
