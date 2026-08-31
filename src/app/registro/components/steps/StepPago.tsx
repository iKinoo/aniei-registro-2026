'use client';

import { Estado } from '@/shared/types/catalogos';
import { DepositoWizard, FacturacionWizard } from '../RegistroForm';
import { estadosToOptions } from '../SelectCatalogo';
import { FormularioDeposito } from '../FormularioDeposito';

interface Props {
  total: number;
  desglose: { costoLider: number; costoMiembros: number; nMiembros: number; liderGratis: boolean };
  deposito: DepositoWizard;
  facturacion: FacturacionWizard;
  estados: Estado[];
  errors?: Record<string, string>;
  isPending: boolean;
  onDepositoChange: (d: DepositoWizard) => void;
  onMontoTouch: () => void;
  onFacturacionChange: (f: FacturacionWizard) => void;
  onBack: () => void;
}

const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export function StepPago({
  total, desglose, deposito, facturacion, estados, errors,
  isPending, onDepositoChange, onMontoTouch, onFacturacionChange, onBack,
}: Props) {
  function setD(key: keyof DepositoWizard, val: string) {
    onDepositoChange({ ...deposito, [key]: val });
  }
  function setF(key: keyof FacturacionWizard, val: string | boolean) {
    onFacturacionChange({ ...facturacion, [key]: val });
  }

  return (
    <div className="space-y-4">
      {/* Cost summary */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen del pago</h2>
        <div className="space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Tu inscripción</span>
            <span className="text-slate-800 font-medium">
              {desglose.liderGratis ? (
                <span className="text-emerald-600">GRATIS (grupo 15+ alumnos)</span>
              ) : (
                `$${desglose.costoLider.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
              )}
            </span>
          </div>
          {desglose.nMiembros > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">{desglose.nMiembros} miembro{desglose.nMiembros > 1 ? 's' : ''} de grupo</span>
              <span className="text-violet-600 font-medium">+${desglose.costoMiembros.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center">
            <span className="font-semibold text-slate-900">Total</span>
            <span className="text-2xl font-extrabold text-indigo-700">
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              <span className="text-sm font-normal text-slate-400 ml-1">MXN</span>
            </span>
          </div>
        </div>
      </div>

      {/* Deposit data */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-slate-900">Datos del depósito / transferencia</h3>
        <FormularioDeposito
          variant="light"
          values={deposito}
          onChange={(field, val) => {
            if (field === 'monto') onMontoTouch();
            setD(field, val);
          }}
          errors={errors}
          showFileUpload
          fileInputName="comprobante"
          fileError={errors?.comprobante}
        />
      </div>

      {/* Facturación toggle */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Facturación <span className="text-indigo-500 font-normal text-sm">(opcional)</span></h3>
            <p className="text-slate-500 text-sm mt-0.5">
              {facturacion.activa ? 'Ingresa tus datos fiscales para emitir la factura.' : 'Activa si necesitas factura por tu pago.'}
            </p>
          </div>
          <button type="button" role="switch" aria-checked={facturacion.activa} id="toggle-facturacion"
            onClick={() => setF('activa', !facturacion.activa)}
            className={`mt-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${facturacion.activa ? 'bg-indigo-600' : 'bg-slate-200'}`}>
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${facturacion.activa ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        {facturacion.activa && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Razón social" required error={errors?.['facturacion.razonSocial']}>
                <input id="razonSocial" name="razonSocial" className={inputCls} placeholder="Nombre o razón social" maxLength={150}
                  value={facturacion.razonSocial} onChange={(e) => setF('razonSocial', e.target.value)} />
              </Field>
              <Field label="RFC" required error={errors?.['facturacion.rfc']}>
                <input id="rfc" name="rfc" className={`${inputCls} uppercase`} style={{ textTransform: 'uppercase' }} placeholder="XAXX010101000" maxLength={20}
                  value={facturacion.rfc} onChange={(e) => setF('rfc', e.target.value.toUpperCase())} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <Field label="Calle">
                  <input id="calle" name="calle" className={inputCls} placeholder="Nombre de la calle" maxLength={100}
                    value={facturacion.calle} onChange={(e) => setF('calle', e.target.value)} />
                </Field>
              </div>
              <Field label="Núm. exterior">
                <input id="numExterior" name="numExterior" className={inputCls} placeholder="123" maxLength={20}
                  value={facturacion.numExterior} onChange={(e) => setF('numExterior', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Núm. interior">
                <input id="numInterior" name="numInterior" className={inputCls} placeholder="Depto." maxLength={20}
                  value={facturacion.numInterior} onChange={(e) => setF('numInterior', e.target.value)} />
              </Field>
              <Field label="Colonia">
                <input id="colonia" name="colonia" className={inputCls} placeholder="Colonia" maxLength={100}
                  value={facturacion.colonia} onChange={(e) => setF('colonia', e.target.value)} />
              </Field>
              <Field label="Código postal">
                <input id="codigoPostal" name="codigoPostal" className={inputCls} placeholder="00000" maxLength={10}
                  value={facturacion.codigoPostal} onChange={(e) => setF('codigoPostal', e.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Municipio / Alcaldía">
                <input id="municipio" name="municipio" className={inputCls} placeholder="Municipio" maxLength={100}
                  value={facturacion.municipio} onChange={(e) => setF('municipio', e.target.value)} />
              </Field>
              <Field label="Estado (domicilio fiscal)" error={errors?.['facturacion.idEntidadFederativaRfc']}>
                <select id="idEntidadFederativaRfc" name="idEntidadFederativaRfc" className={selectCls}
                  value={facturacion.idEntidadFederativaRfc} onChange={(e) => setF('idEntidadFederativaRfc', e.target.value)}>
                  <option value="">Seleccione...</option>
                  {estadosToOptions(estados).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
            </div>
          </div>
        )}
      </div>

      {/* Nav + Submit */}
      <div className="flex justify-between pt-1">
        <button type="button" onClick={onBack}
          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Atrás
        </button>
        <button id="btn-submit" type="submit" disabled={isPending}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
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
