'use client';

import { useState } from 'react';
import { Estado } from '@/shared/types/catalogos';
import { RegistroFormFields } from '../../actions/registrar-usuario.action';
import { estadosToOptions } from '../SelectCatalogo';

interface Props {
  estados: Estado[];
  errors?: Record<string, string>;
  fields?: RegistroFormFields;
  isPending: boolean;
  onBack: () => void;
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

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

function val(fields: RegistroFormFields | undefined, key: keyof RegistroFormFields): string {
  return (fields as Record<string, unknown> | undefined)?.[key] as string ?? '';
}

export function StepFacturacion({ estados, errors, fields, isPending, onBack }: Props) {
  const [activa, setActiva] = useState(() => fields?.requiereFacturacion ?? false);

  return (
    <div className="space-y-4">
      {/* Facturación toggle card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-0.5">
              Facturación <span className="text-indigo-400 text-base font-normal">(opcional)</span>
            </h2>
            <p className="text-slate-400 text-sm">
              {activa ? 'Ingresa tus datos fiscales para emitir la factura.' : 'Activa si necesitas factura por tu pago.'}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={activa}
            onClick={() => setActiva((v) => !v)}
            id="toggle-facturacion"
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ml-4 ${
              activa ? 'bg-indigo-600' : 'bg-white/10'
            }`}
          >
            <span className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              activa ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* Hidden field */}
      <input type="hidden" name="requiereFacturacion" value={activa ? 'true' : 'false'} />

      {activa && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Razón social" required error={errors?.['facturacion.razonSocial']}>
              <input id="razonSocial" name="razonSocial" className={inputCls} placeholder="Nombre o razón social" maxLength={150} defaultValue={val(fields, 'razonSocial')} />
            </Field>
            <Field label="RFC" required error={errors?.['facturacion.rfc']}>
              <input id="rfc" name="rfc" className={`${inputCls} uppercase`} style={{ textTransform: 'uppercase' }} placeholder="XAXX010101000" maxLength={20} defaultValue={val(fields, 'rfc')} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Field label="Calle" error={errors?.['facturacion.calle']}>
                <input id="calle" name="calle" className={inputCls} placeholder="Nombre de la calle" maxLength={100} defaultValue={val(fields, 'calle')} />
              </Field>
            </div>
            <Field label="Núm. exterior">
              <input id="numExterior" name="numExterior" className={inputCls} placeholder="123" maxLength={20} defaultValue={val(fields, 'numExterior')} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Núm. interior">
              <input id="numInterior" name="numInterior" className={inputCls} placeholder="Depto." maxLength={20} defaultValue={val(fields, 'numInterior')} />
            </Field>
            <Field label="Colonia">
              <input id="colonia" name="colonia" className={inputCls} placeholder="Colonia" maxLength={100} defaultValue={val(fields, 'colonia')} />
            </Field>
            <Field label="Código postal">
              <input id="codigoPostal" name="codigoPostal" className={inputCls} placeholder="00000" maxLength={10} defaultValue={val(fields, 'codigoPostal')} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Municipio / Alcaldía">
              <input id="municipio" name="municipio" className={inputCls} placeholder="Municipio" maxLength={100} defaultValue={val(fields, 'municipio')} />
            </Field>
            <Field label="Estado (domicilio fiscal)" error={errors?.['facturacion.idEntidadFederativaRfc']}>
              <select id="idEntidadFederativaRfc" name="idEntidadFederativaRfc" className={selectCls} defaultValue={val(fields, 'idEntidadFederativaRfc')}>
                <option value="">Seleccione...</option>
                {estadosToOptions(estados).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
      )}

      {/* Nav & Submit */}
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-2.5 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 rounded-xl transition-all text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Atrás
        </button>
        <button
          id="btn-submit-registro"
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isPending ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Registrando...
            </>
          ) : (
            <>
              Completar registro
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
