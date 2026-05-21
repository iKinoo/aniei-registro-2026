'use client';

import { useState } from 'react';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';
import { FormularioDeposito, DepositoFormValues } from '../FormularioDeposito';

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



const emptyDepositoValues: DepositoFormValues = {
  bancoSucursal: '', ciudad: '', referencia: '', monto: '', fechaDeposito: '', notas: '',
};

export function StepCheckout({ total, desglose, errors, onBack, onNext }: Props) {
  const [deposito, setDeposito] = useState<DepositoFormValues>({
    ...emptyDepositoValues,
    monto: total.toFixed(2),
  });

  // Keep monto in sync if total changes while user is on this step
  if (total.toFixed(2) !== deposito.monto && deposito.monto === '') {
    setDeposito((prev) => ({ ...prev, monto: total.toFixed(2) }));
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
        <FormularioDeposito
          variant="dark"
          values={deposito}
          onChange={(field, val) => setDeposito((prev) => ({ ...prev, [field]: val }))}
          errors={errors}
          showFileUpload
          fileInputName="comprobante"
          fileError={errors?.comprobante}
        />
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
