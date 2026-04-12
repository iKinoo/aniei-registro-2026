'use client';

import { useState, useTransition } from 'react';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';
import { Estado } from '@/shared/types/catalogos';
import { SeccionFacturacion, FacturacionDefaults } from '@/app/registro/components/SeccionFacturacion';
import { CampoArchivo } from '@/app/registro/components/CampoArchivo';
import { confirmarInscripcionesAction, ConfirmacionInscripcionResult } from './actions';

// ---- helpers ----
function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition';

// ---- Pantalla de confirmación exitosa ----
function PantallaConfirmacion({ datos }: { datos: ConfirmacionInscripcionResult }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-950 via-indigo-900 to-violet-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-indigo-600 to-violet-600 px-8 py-8 text-center text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">¡Registro Confirmado!</h1>
          <p className="text-indigo-200 mt-1 text-sm">Congreso ANIEI 2026</p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <div>
            <p className="text-slate-700 text-base">
              Hola <strong>{datos.nombre}</strong>, tu inscripción a las actividades ha sido procesada. Recibirás un correo de confirmación en <strong>{datos.correo}</strong>.
            </p>
          </div>

          {/* Folio */}
          <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-700">Folio de registro</span>
            <span className="font-mono font-bold text-indigo-900">{datos.folio || '—'}</span>
          </div>

          {/* Lista de actividades */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Actividades inscritas</h2>
            <div className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
              {datos.actividades.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 leading-snug">{a.nombre}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{a.fecha}</p>
                  </div>
                  <span className={`text-sm font-semibold shrink-0 ml-4 ${a.costo ? 'text-slate-800' : 'text-emerald-600'}`}>
                    {a.costo ?? 'Gratis'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          {datos.totalCosto && (
            <div className="flex justify-between items-center border-t border-slate-100 pt-3">
              <span className="text-sm font-semibold text-slate-600">Total pagado</span>
              <span className="text-xl font-extrabold text-slate-900">{datos.totalCosto} MXN</span>
            </div>
          )}

          {/* CTA */}
          <a
            id="btn-ver-perfil"
            href="/perfil"
            className="block w-full text-center py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 active:scale-[0.99]"
          >
            Ver mi perfil
          </a>
        </div>
      </div>
    </div>
  );
}

// ---- Resumen de actividad en el checkout ----
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
  facturacionDefaults?: FacturacionDefaults;
}

export default function CheckoutClient({ actividades, estados, facturacionDefaults }: Props) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmacion, setConfirmacion] = useState<ConfirmacionInscripcionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = actividades.reduce((s, a) => s + (a.costo?.monto ?? 0), 0);
  const tieneCosto = total > 0;
  const idsActividades = actividades.map((a) => a.idActividad);

  // Mostrar pantalla de éxito si ya se confirmó
  if (confirmacion) {
    return <PantallaConfirmacion datos={confirmacion} />;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrors({});

    startTransition(async () => {
      const result = await confirmarInscripcionesAction(formData, idsActividades, tieneCosto);
      if (!result.success) {
        setErrors(result.errors);
        return;
      }
      setConfirmacion(result);
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
                  : <span className="text-emerald-600 text-base font-semibold">Sin costo</span>}
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
                defaults={facturacionDefaults}
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
