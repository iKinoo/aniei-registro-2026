'use client';

import { ActividadDTO } from '@/application/dtos/ActividadDTO';

function esCupoLleno(a: ActividadDTO) { return a.cupoMaximo > 0 && a.cupoOcupado >= a.cupoMaximo; }
function fmtFecha(iso: string) { return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }); }
function fmtHora(iso: string) { return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }); }

const TIPO_COLORS: Record<string, string> = {
  conferencia: 'bg-blue-50 text-blue-600 border-blue-200',
  taller:      'bg-amber-50 text-amber-700 border-amber-200',
  seminario:   'bg-violet-50 text-violet-600 border-violet-200',
  curso:       'bg-teal-50 text-teal-600 border-teal-200',
};

interface Props {
  actividades: ActividadDTO[];
  seleccionadas: ActividadDTO[];
  onToggle: (a: ActividadDTO) => void;
  onBack: () => void;
  onNext: () => void;
}

export function StepActividades({ actividades, seleccionadas, onToggle, onBack, onNext }: Props) {
  const totalActividades = seleccionadas.reduce((s, a) => s + (a.costo ?? 0), 0);
  const selectedSet = new Set(seleccionadas.map((a) => a.idActividad));

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <h2 className="text-xl font-bold text-slate-900">Actividades <span className="text-indigo-500 text-base font-normal">(opcional)</span></h2>
        <p className="text-slate-500 text-sm mt-0.5">Selecciona las actividades a las que deseas asistir.</p>
      </div>

      {actividades.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          No hay actividades disponibles aún.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {actividades.map((a) => {
            const lleno = esCupoLleno(a);
            const selected = selectedSet.has(a.idActividad);
            const key = (a.tipoActividad?.clave ?? a.tipoActividad?.descripcion ?? '').toLowerCase();
            const found = Object.entries(TIPO_COLORS).find(([k]) => key.includes(k));
            const tipoCls = found?.[1] ?? 'bg-slate-50 text-slate-500 border-slate-200';

            return (
              <div
                key={a.idActividad}
                onClick={() => !lleno && onToggle(a)}
                className={`relative bg-white border-2 rounded-2xl p-4 transition-all duration-150 ${
                  lleno ? 'border-slate-100 opacity-60 cursor-not-allowed' :
                  selected ? 'border-indigo-400 shadow-md shadow-indigo-100 cursor-pointer' :
                  'border-slate-200 hover:border-slate-300 hover:shadow-sm cursor-pointer'}`}
              >
                {selected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="flex items-start gap-2 mb-2 pr-6">
                  {a.tipoActividad && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tipoCls}`}>
                      {a.tipoActividad.descripcion}
                    </span>
                  )}
                  {lleno && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">Cupo lleno</span>}
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">{a.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{fmtFecha(a.fechaInicio)} · {fmtHora(a.fechaInicio)}–{fmtHora(a.fechaFin)}</span>
                  {a.costo && a.costo > 0
                    ? <span className="text-sm font-bold text-emerald-600">+${a.costo.toLocaleString('es-MX')}</span>
                    : <span className="text-xs text-emerald-500 font-medium">Gratis</span>}
                </div>
                {a.cupoMaximo > 0 && (
                  <div className="mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${lleno ? 'bg-red-400' : 'bg-emerald-400'}`}
                      style={{ width: `${Math.min(100, (a.cupoOcupado / a.cupoMaximo) * 100)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {seleccionadas.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-3 flex items-center justify-between">
          <span className="text-indigo-700 text-sm font-medium">
            {seleccionadas.length} actividad{seleccionadas.length > 1 ? 'es' : ''} seleccionada{seleccionadas.length > 1 ? 's' : ''}
          </span>
          <span className="text-indigo-900 font-bold">+${totalActividades.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
        </div>
      )}

      <div className="flex justify-between pt-1">
        <button type="button" onClick={onBack}
          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Atrás
        </button>
        <div className="flex gap-3">
          <button type="button" id="btn-skip-act" onClick={onNext}
            className="px-5 py-2.5 border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all">
            Omitir
          </button>
          <button type="button" id="btn-s2-next" onClick={onNext}
            className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm">
            Continuar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
