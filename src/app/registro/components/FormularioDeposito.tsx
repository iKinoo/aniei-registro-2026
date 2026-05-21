'use client';

import { useRef, useState } from 'react';

export interface DepositoFormValues {
  bancoSucursal: string;
  ciudad: string;
  referencia: string;
  monto: string;
  fechaDeposito: string;
  notas: string;
}

interface Props {
  variant?: 'light' | 'dark';
  values: DepositoFormValues;
  onChange?: (field: keyof DepositoFormValues, value: string) => void;
  errors?: Record<string, string>;
  readOnly?: boolean;
  showFileUpload?: boolean;
  fileInputName?: string;
  fileError?: string;
}

function Field({ label, required, error, children, variant }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode; variant: 'light' | 'dark';
}) {
  const labelColor = variant === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const reqColor = variant === 'dark' ? 'text-rose-400' : 'text-red-500';
  const errColor = variant === 'dark' ? 'text-rose-400' : 'text-red-500';
  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-sm font-medium ${labelColor}`}>
        {label} {required && <span className={reqColor}>*</span>}
      </label>
      {children}
      {error && <p className={`text-xs ${errColor} mt-0.5`}>{error}</p>}
    </div>
  );
}

function Dropzone({
  variant,
  error,
  readOnly,
  fileInputName = 'comprobante',
}: {
  variant: 'light' | 'dark';
  error?: string;
  readOnly?: boolean;
  fileInputName?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) { setFileName(null); setPreview(null); return; }
    setFileName(f.name);
    setPreview(f.type.startsWith('image/') ? URL.createObjectURL(f) : null);
  }

  const boxBase = variant === 'dark'
    ? 'border-white/10 hover:border-indigo-500/40 hover:bg-white/5'
    : 'border-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50';
  const boxActive = variant === 'dark'
    ? 'border-indigo-500/50 bg-indigo-500/10'
    : 'border-indigo-300 bg-indigo-50';
  const textColor = variant === 'dark' ? 'text-slate-400' : 'text-slate-400';
  const subColor = variant === 'dark' ? 'text-slate-500' : 'text-slate-400';
  const fileColor = variant === 'dark' ? 'text-indigo-300' : 'text-indigo-600';
  const errColor = variant === 'dark' ? 'text-rose-400' : 'text-red-500';

  if (readOnly) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <label className={`text-sm font-medium ${variant === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
        Comprobante de pago <span className={errColor}>*</span>
      </label>
      <div
        onClick={() => ref.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${fileName ? boxActive : boxBase}`}
      >
        <input ref={ref} type="file" name={fileInputName} accept="image/png,image/jpeg,application/pdf" className="hidden" onChange={handleChange} />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Preview" className="mx-auto max-h-36 rounded-lg" />
        ) : (
          <div className={textColor}>
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className={`text-sm font-medium ${variant === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{fileName ?? 'Click para seleccionar archivo'}</p>
            <p className={`text-xs ${subColor} mt-0.5`}>PNG, JPG o PDF · máx. 5 MB</p>
          </div>
        )}
        {fileName && !preview && (
          <p className={`text-xs ${fileColor} mt-2 flex items-center justify-center gap-1 font-medium`}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fileName}
          </p>
        )}
      </div>
      {error && <p className={`text-xs ${errColor}`}>{error}</p>}
    </div>
  );
}

export function FormularioDeposito({
  variant = 'light',
  values,
  onChange,
  errors = {},
  readOnly = false,
  showFileUpload = true,
  fileInputName = 'comprobante',
  fileError,
}: Props) {
  const isDark = variant === 'dark';
  const inputCls = isDark
    ? 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all'
    : 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';

  const handleChange = (field: keyof DepositoFormValues, val: string) => {
    if (!readOnly && onChange) onChange(field, val);
  };

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 sm:grid-cols-2`}>
        <Field label="Banco / Sucursal" error={errors?.bancoSucursal} variant={variant}>
          <input
            id="bancoSucursal"
            name="bancoSucursal"
            className={inputCls}
            placeholder="Ej. BBVA Sucursal Centro"
            maxLength={100}
            value={values.bancoSucursal}
            onChange={(e) => handleChange('bancoSucursal', e.target.value)}
            readOnly={readOnly}
          />
        </Field>
        <Field label="Ciudad" error={errors?.ciudad} variant={variant}>
          <input
            id="ciudad"
            name="ciudad"
            className={inputCls}
            placeholder="Ej. Guadalajara"
            maxLength={100}
            value={values.ciudad}
            onChange={(e) => handleChange('ciudad', e.target.value)}
            readOnly={readOnly}
          />
        </Field>
      </div>

      <Field label="Referencia / Folio del depósito" required error={errors?.referencia} variant={variant}>
        <input
          id="referencia"
          name="referencia"
          className={inputCls}
          placeholder="Número de referencia o folio"
          maxLength={50}
          required={!readOnly}
          value={values.referencia}
          onChange={(e) => handleChange('referencia', e.target.value)}
          readOnly={readOnly}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Monto ($MXN)" required error={errors?.monto} variant={variant}>
          <input
            id="monto"
            name="monto"
            type="number"
            step="0.01"
            min="0.01"
            required={!readOnly}
            className={inputCls}
            value={values.monto}
            onChange={(e) => handleChange('monto', e.target.value)}
            readOnly={readOnly}
          />
        </Field>
        <Field label="Fecha del depósito" required error={errors?.fechaDeposito} variant={variant}>
          <input
            id="fechaDeposito"
            name="fechaDeposito"
            type="date"
            required={!readOnly}
            className={inputCls}
            style={isDark ? { colorScheme: 'dark' } : undefined}
            value={values.fechaDeposito}
            onChange={(e) => handleChange('fechaDeposito', e.target.value)}
            readOnly={readOnly}
          />
        </Field>
      </div>

      <Field label="Notas / Observaciones" error={errors?.notas} variant={variant}>
        <textarea
          id="notas"
          name="notas"
          rows={3}
          maxLength={500}
          className={`${inputCls} resize-none`}
          placeholder="Detalles adicionales sobre tu depósito (opcional)"
          value={values.notas}
          onChange={(e) => handleChange('notas', e.target.value)}
          readOnly={readOnly}
        />
        {!readOnly && (
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'} text-right`}>
            {values.notas.length}/500
          </p>
        )}
      </Field>

      {showFileUpload && <Dropzone variant={variant} error={fileError} readOnly={readOnly} fileInputName={fileInputName} />}
    </div>
  );
}
