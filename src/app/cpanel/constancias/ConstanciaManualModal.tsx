'use client';

import { useState, useTransition } from 'react';
import { TipoConstanciaManual, TIPOS_CONSTANCIA } from '@/application/dtos/ConstanciaManualDTO';
import { generarConstanciaManualAction } from './actions';

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

interface Props {
  onClose: () => void;
  onSuccess: (url: string) => void;
}

export function ConstanciaManualModal({ onClose, onSuccess }: Props) {
  const [tipoConstancia, setTipoConstancia] = useState<TipoConstanciaManual>('PARTICIPANTE');
  const [destinatarios, setDestinatarios] = useState('');
  const [nombreActividad, setNombreActividad] = useState('');
  const [nombrePonencia, setNombrePonencia] = useState('');
  const [nombreEquipo, setNombreEquipo] = useState('');
  const [nombreTesis, setNombreTesis] = useState('');
  const [lugar, setLugar] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const necesitaActividad = tipoConstancia === 'TALLER' || tipoConstancia === 'CONFERENCIA_MAGISTRAL';
  const necesitaPonencia = tipoConstancia === 'PONENTE';
  const necesitaEquipo = tipoConstancia === 'CONCURSO_PROGRAMACION' || tipoConstancia === 'HACKATHON';
  const necesitaTesis = tipoConstancia === 'TESIS';
  const necesitaLugar = tipoConstancia === 'CONCURSO_PROGRAMACION' || tipoConstancia === 'HACKATHON' || tipoConstancia === 'TESIS';
  const esMultiple = tipoConstancia === 'PONENTE' || tipoConstancia === 'CONCURSO_PROGRAMACION' || tipoConstancia === 'HACKATHON';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const formData = new FormData();
    formData.set('tipoConstancia', tipoConstancia);
    formData.set('destinatarios', destinatarios);

    if (necesitaActividad) formData.set('nombreActividad', nombreActividad);
    if (necesitaPonencia) formData.set('nombrePonencia', nombrePonencia);
    if (necesitaEquipo) formData.set('nombreEquipo', nombreEquipo);
    if (necesitaTesis) formData.set('nombreTesis', nombreTesis);
    if (necesitaLugar) formData.set('lugar', lugar);

    startTransition(async () => {
      const result = await generarConstanciaManualAction(formData);
      if (result.success) {
        onSuccess(result.url);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Generar Constancia Manual</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Complete los datos para generar la constancia.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Tipo de Constancia <span className="text-rose-500">*</span>
            </label>
            <select
              className={inputCls}
              value={tipoConstancia}
              onChange={(e) => setTipoConstancia(e.target.value as TipoConstanciaManual)}
            >
              {TIPOS_CONSTANCIA.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              {esMultiple ? 'Destinatarios (uno por línea)' : 'Nombre del destinatario'}{' '}
              <span className="text-rose-500">*</span>
            </label>
            {esMultiple ? (
              <textarea
                className={`${inputCls} min-h-[100px] resize-y`}
                placeholder={
                  tipoConstancia === 'PONENTE'
                    ? 'Juan Pérez García\nMaría López Hernández'
                    : 'Equipo Alpha\nEquipo Beta'
                }
                value={destinatarios}
                onChange={(e) => setDestinatarios(e.target.value)}
                required
              />
            ) : (
              <input
                type="text"
                className={inputCls}
                placeholder="Ej. Juan Pérez García"
                value={destinatarios}
                onChange={(e) => setDestinatarios(e.target.value)}
                required
              />
            )}
          </div>

          {necesitaActividad && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                {tipoConstancia === 'TALLER' ? 'Nombre del Taller' : 'Nombre de la Conferencia Magistral'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder={
                  tipoConstancia === 'TALLER'
                    ? 'Ej. Desarrollo Web con React'
                    : 'Ej. Inteligencia Artificial en la Educación'
                }
                value={nombreActividad}
                onChange={(e) => setNombreActividad(e.target.value)}
                required
              />
            </div>
          )}

          {necesitaPonencia && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Nombre de la Ponencia <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="Ej. Machine Learning aplicado a la Salud"
                value={nombrePonencia}
                onChange={(e) => setNombrePonencia(e.target.value)}
                required
              />
            </div>
          )}

          {necesitaEquipo && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Nombre del Equipo <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="Ej. Code Warriors"
                value={nombreEquipo}
                onChange={(e) => setNombreEquipo(e.target.value)}
                required
              />
            </div>
          )}

          {necesitaTesis && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Nombre de la Tesis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="Ej. Análisis de Redes Neuronales en..."
                value={nombreTesis}
                onChange={(e) => setNombreTesis(e.target.value)}
                required
              />
            </div>
          )}

          {necesitaLugar && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">
                Lugar / Posición <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder={
                  tipoConstancia === 'TESIS'
                    ? 'Ej. 1er lugar'
                    : 'Ej. 1er lugar, 2do lugar'
                }
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                required
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-constancia"
            disabled={isPending}
            onClick={(e) => {
              const form = (e.target as HTMLElement).closest('form');
              form?.requestSubmit();
            }}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generando...
              </>
            ) : (
              <>
                <CheckIcon />
                Generar Constancia
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
