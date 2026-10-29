'use client';

import { useEffect, useState, useTransition } from 'react';
import type { InscritoDTO } from '@/application/dtos/ActividadDTO';
import { enviarConstanciasParticipantesAction } from './actions';

interface Props {
  idActividad: number;
  nombreActividad: string;
  participantes: InscritoDTO[];
  onClose: () => void;
}

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function EnviarConstanciasModal({
  idActividad,
  nombreActividad,
  participantes,
  onClose,
}: Props) {
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const total = participantes.length;
  const garantizadas = participantes.filter((participante) => participante.urlConstancia).length;
  const porGenerar = total - garantizadas;

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  const enviar = () => {
    if (total === 0) return;
    setError('');
    startTransition(async () => {
      const res = await enviarConstanciasParticipantesAction(idActividad);
      if (!res.success) {
        setError(res.error);
        return;
      }
      alert(`Se programó el envío de ${res.data.total} constancias. Los correos se enviarán en segundo plano.`);
      onClose();
    });
  };

  const cerrar = () => {
    if (!isPending) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={cerrar} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="enviar-constancias-titulo"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 id="enviar-constancias-titulo" className="text-lg font-bold text-slate-900">
              Enviar constancias por correo
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{nombreActividad}</p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            disabled={isPending}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">Se enviarán</p>
              <p className="mt-1 text-2xl font-bold text-indigo-900">{total}</p>
              <p className="text-xs text-indigo-700">correos a participantes</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Constancia garantizada</p>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{garantizadas}</p>
              <p className="text-xs text-emerald-700">constancias ya generadas</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <p>
              Se enviará un correo a cada participante con el checkbox de constancia activo.
            </p>
            {porGenerar > 0 ? (
              <p className="mt-1.5 text-amber-700">
                {porGenerar === 1
                  ? '1 constancia se generará automáticamente antes del envío.'
                  : `${porGenerar} constancias se generarán automáticamente antes del envío.`}
              </p>
            ) : (
              <p className="mt-1.5 text-emerald-700">
                Todas las constancias ya están generadas.
              </p>
            )}
          </div>

          <p className="text-xs text-slate-500">
            El envío se procesa en segundo plano. No se esperará la respuesta de Gmail, por lo que los correos
            pueden tardar en llegar.
          </p>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={cerrar}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={enviar}
            disabled={isPending || total === 0}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending && <Spinner />}
            {isPending ? 'Programando envío...' : `Sí, enviar ${total} correo${total === 1 ? '' : 's'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
