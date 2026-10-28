'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { FormularioDeposito, type DepositoFormValues } from '@/app/registro/components/FormularioDeposito';
import { registrarPagoRegistroAction, type PagoRegistroActionState } from './actions';

interface Props {
  monto: number;
}

const initialState: PagoRegistroActionState = { success: false };

export function PagoRegistroForm({ monto }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(registrarPagoRegistroAction, initialState);
  const [deposito, setDeposito] = useState<DepositoFormValues>({
    bancoSucursal: '',
    ciudad: '',
    referencia: '',
    monto: monto.toFixed(2),
    fechaDeposito: '',
    notas: '',
  });

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
        <p className="font-semibold">Pago de inscripción registrado</p>
        <p className="text-sm mt-1">Tu comprobante quedó guardado en el historial de depósitos.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Pago de inscripción</h2>
        <p className="text-slate-600 text-sm mt-1">
          Captura los datos del depósito y sube tu comprobante. El monto se calcula automáticamente con el precio vigente.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-5 py-4">
        <span className="text-sm font-medium text-slate-600">Monto a pagar</span>
        <span className="text-2xl font-extrabold text-indigo-700">
          ${monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          <span className="text-sm font-normal text-slate-400 ml-1">MXN</span>
        </span>
      </div>

      <form action={formAction} className="space-y-4">
        <FormularioDeposito
          variant="light"
          values={deposito}
          onChange={(field, valor) => setDeposito((actual) => ({ ...actual, [field]: valor }))}
          errors={state.errors}
          showFileUpload
          fileInputName="comprobante"
          fileError={state.errors?.comprobante}
        />

        {state.error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={isPending}
            className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
            {isPending ? 'Registrando...' : 'Registrar pago'}
          </button>
        </div>
      </form>
    </div>
  );
}
