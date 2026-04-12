'use client';

import { useState, useTransition } from 'react';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';
import { Estado } from '@/shared/types/catalogos';
import { SeccionFacturacion } from '@/app/registro/components/SeccionFacturacion';
import { CampoArchivo } from '@/app/registro/components/CampoArchivo';
import { SelectCatalogo, estadosToOptions } from '@/app/registro/components/SelectCatalogo';
import { confirmarInscripcionesAction } from './actions';

// ---- helpers ----
function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition';

// ---- Resumen de actividad ----
function ResumenActividad({ a }: { a: ActividadDTO }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm">{a.nombre}</p>
        <p className="text-xs text-slate-500 mt-0.5">{formatFecha(a.fechaInicio)}</p>
      </div>
      <div className="text-right shrink-0">
        {a.costo?.monto != null ? (
          <span className="font-bold text-slate-800 text-sm">
            ${a.costo.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        ) : (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Sin costo</span>
        )}
      </div>
    </div>
  );
}

// ---- Main component ----
interface Props {
  actividades: ActividadDTO[];
  estados: Estado[];
}

export default function CheckoutClient({ actividades, estados }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const total = actividades.reduce((s, a) => s + (a.costo?.monto ?? 0), 0);
  const tieneCosto = total > 0;
  const idsActividades = actividades.map((a) => a.idActividad);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrors({});

    startTransition(async () => {
      const result = await confirmarInscripcionesAction(formData, idsActividades, tieneCosto);
      if (result && !result.success && result.errors) {
        setErrors(result.errors);
      }
      // Si success → redirect() en server action
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-linear-to-br from-indigo-900 to-violet-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <a
            href="/actividades"
            className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white text-sm mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a actividades
          </a>
          <h1 className="text-3xl font-extrabold tracking-tight">Confirmar Inscripción</h1>
          <p className="text-indigo-200 mt-1">Revisa tu selección y completa los datos requeridos.</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 1. Resumen */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-700">1. Resumen de actividades</h2>
            </div>
            <div className="px-6 py-2">
              {actividades.map((a) => (
                <ResumenActividad key={a.idActividad} a={a} />
              ))}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-600">Total</span>
              <span className="text-xl font-extrabold text-slate-900">
                {tieneCosto
                  ? `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
                  : <span className="text-emerald-600 text-base">Sin costo</span>}
              </span>
            </div>
          </section>

          {/* 2. Depósito (solo si hay costo) */}
          {tieneCosto && (
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h2 className="font-bold text-slate-700">2. Datos del depósito</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  El pago se realiza externamente. Ingresa los datos de tu comprobante.
                </p>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="bancoSucursal" className="text-sm font-medium text-slate-700">Banco / Sucursal</label>
                    <input id="bancoSucursal" name="bancoSucursal" type="text" maxLength={100}
                      placeholder="Ej. BBVA Sucursal Centro" className={inputCls} />
                    {errors.bancoSucursal && <p className="text-xs text-red-500">{errors.bancoSucursal}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="ciudad" className="text-sm font-medium text-slate-700">Ciudad</label>
                    <input id="ciudad" name="ciudad" type="text" maxLength={100}
                      placeholder="Ej. Guadalajara" className={inputCls} />
                    {errors.ciudad && <p className="text-xs text-red-500">{errors.ciudad}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="referencia" className="text-sm font-medium text-slate-700">
                    Referencia / Folio <span className="text-red-500">*</span>
                  </label>
                  <input id="referencia" name="referencia" type="text" maxLength={50} required
                    placeholder="Número de referencia del comprobante" className={inputCls} />
                  {errors.referencia && <p className="text-xs text-red-500">{errors.referencia}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="monto" className="text-sm font-medium text-slate-700">
                      Monto depositado ($) <span className="text-red-500">*</span>
                    </label>
                    <input id="monto" name="monto" type="number" step="0.01" min="0.01" required
                      placeholder="0.00" defaultValue={total} className={inputCls} />
                    {errors.monto && <p className="text-xs text-red-500">{errors.monto}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fechaDeposito" className="text-sm font-medium text-slate-700">
                      Fecha del depósito <span className="text-red-500">*</span>
                    </label>
                    <input id="fechaDeposito" name="fechaDeposito" type="date" required className={inputCls} />
                    {errors.fechaDeposito && <p className="text-xs text-red-500">{errors.fechaDeposito}</p>}
                  </div>
                </div>

                <CampoArchivo name="comprobante" error={errors.comprobante} />
              </div>
            </section>
          )}

          {/* 3. Facturación */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h2 className="font-bold text-slate-700">{tieneCosto ? '3.' : '2.'} Facturación (opcional)</h2>
            </div>
            <div className="px-6 py-5">
              <SeccionFacturacion
                estados={estados}
                errors={errors}
              />
            </div>
          </section>

          {/* Error general */}
          {errors._form && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl flex gap-2">
              <span>⚠</span> {errors._form}
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-confirmar"
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:shadow-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Confirmando inscripción...
              </span>
            ) : 'Confirmar inscripción'}
          </button>
        </form>
      </div>
    </div>
  );
}
