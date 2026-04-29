'use client';

import { useRef, useState } from 'react';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';

interface Desglose {
  base: number;
  nMiembros: number;
  actividades: ActividadDTO[];
}

interface Props {
  total: number;
  desglose: Desglose;
  errors?: Record<string, string>;
  onBack: () => void;
  onNext: () => void;
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all';

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

function CampoArchivoCustom({ error }: { error?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setFileName(null); setPreview(null); return; }
    setFileName(file.name);
    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-300">
        Comprobante de pago <span className="text-rose-400">*</span>
      </label>
      <div
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          fileName
            ? 'border-indigo-500/50 bg-indigo-500/10'
            : 'border-white/10 hover:border-indigo-500/40 hover:bg-white/5'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          name="comprobante"
          accept="image/png,image/jpeg,application/pdf"
          className="hidden"
          onChange={handleChange}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="mx-auto max-h-36 rounded-lg" />
        ) : (
          <div className="text-slate-400">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm font-medium">{fileName ?? 'Click para seleccionar archivo'}</p>
            <p className="text-xs text-slate-500 mt-1">PNG, JPG o PDF · máx. 5 MB</p>
          </div>
        )}
        {fileName && !preview && (
          <p className="text-xs text-indigo-300 mt-2 flex items-center justify-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fileName}
          </p>
        )}
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export function StepCheckout({ total, desglose, errors, onBack, onNext }: Props) {
  const [monto, setMonto] = useState(total.toFixed(2));

  // Keep monto in sync if total changes while user is on this step
  const prevTotal = useRef(total);
  if (total !== prevTotal.current) {
    prevTotal.current = total;
    setMonto(total.toFixed(2));
  }

  return (
    <div className="space-y-4">
      {/* Desglose del total */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4">Resumen y pago</h2>
        <div className="space-y-2.5">
          {/* Base */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400">Congreso ANIEI 2026 (1 participante)</span>
            <span className="text-white font-medium">
              ${desglose.base.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          {/* Miembros */}
          {desglose.nMiembros > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">
                +{desglose.nMiembros} miembro{desglose.nMiembros > 1 ? 's' : ''} de grupo
              </span>
              <span className="text-violet-300 font-medium">
                +${(desglose.base * desglose.nMiembros).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {/* Actividades */}
          {desglose.actividades.map((a) => (
            <div key={a.idActividad} className="flex justify-between items-center text-sm">
              <span className="text-slate-400 truncate mr-4">{a.nombre}</span>
              <span className="text-emerald-400 font-medium shrink-0">
                {a.costo && a.costo > 0
                  ? `+$${a.costo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                  : 'Gratis'}
              </span>
            </div>
          ))}
          {/* Divider */}
          <div className="border-t border-white/10 pt-2.5">
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold text-white">Total a pagar</span>
              <span className="text-2xl font-extrabold text-white">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                <span className="text-sm font-normal text-slate-400 ml-1">MXN</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Datos del depósito */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
        <h3 className="text-base font-semibold text-white">Datos del depósito / transferencia</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Banco / Sucursal" error={errors?.bancoSucursal}>
            <input id="banco" name="bancoSucursal" className={inputCls} placeholder="Ej. BBVA Sucursal Centro" maxLength={100} />
          </Field>
          <Field label="Ciudad" error={errors?.ciudad}>
            <input id="ciudad" name="ciudad" className={inputCls} placeholder="Ej. Guadalajara" maxLength={100} />
          </Field>
        </div>

        <Field label="Referencia / Folio del depósito" required error={errors?.referencia}>
          <input id="referencia" name="referencia" className={inputCls} placeholder="Número de referencia o folio" maxLength={50} required />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monto ($MXN)" required error={errors?.monto}>
            <input
              id="monto"
              name="monto"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="Fecha del depósito" required error={errors?.fechaDeposito}>
            <input
              id="fechaDeposito"
              name="fechaDeposito"
              type="date"
              required
              className={inputCls}
              style={{ colorScheme: 'dark' }}
            />
          </Field>
        </div>

        <CampoArchivoCustom error={errors?.comprobante} />
      </div>

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-2.5 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 rounded-xl transition-all text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Atrás
        </button>
        <button type="button" id="btn-step4-next" onClick={onNext}
          className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-2 text-sm">
          Continuar
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
