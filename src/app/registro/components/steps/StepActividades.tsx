'use client';

import { ActividadDTO } from '@/application/dtos/ActividadDTO';

function esCupoLleno(a: ActividadDTO) {
  return a.cupoMaximo > 0 && a.cupoOcupado >= a.cupoMaximo;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}
function formatHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const TIPO_COLORS: Record<string, string> = {
  conferencia: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  taller: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  seminario: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
  curso: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
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
      {/* Header card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-0.5">Actividades <span className="text-indigo-400 text-base font-normal">(opcional)</span></h2>
        <p className="text-slate-400 text-sm">Selecciona las actividades a las que deseas asistir. Las actividades con costo extra se suman al total.</p>
      </div>

      {actividades.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
          <p className="text-slate-400">No hay actividades disponibles aún.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {actividades.map((a) => {
            const lleno = esCupoLleno(a);
            const selected = selectedSet.has(a.idActividad);
            const key = (a.tipoActividad?.clave ?? a.tipoActividad?.descripcion ?? '').toLowerCase();
            const found = Object.entries(TIPO_COLORS).find(([k]) => key.includes(k));
            const tipoCls = found?.[1] ?? 'bg-slate-500/20 text-slate-300 border-slate-500/30';

            return (
              <div
                key={a.idActividad}
                className={`relative bg-white/5 border-2 rounded-2xl p-4 transition-all duration-200 ${
                  lleno
                    ? 'border-white/5 opacity-50 cursor-not-allowed'
                    : selected
                    ? 'border-indigo-500/70 bg-indigo-500/10 shadow-lg shadow-indigo-900/30'
                    : 'border-white/10 hover:border-white/20 cursor-pointer'
                }`}
                onClick={() => !lleno && onToggle(a)}
              >
                {/* selected check */}
                {selected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {/* Top row */}
                <div className="flex items-start gap-2 mb-2 pr-8">
                  {a.tipoActividad && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${tipoCls}`}>
                      {a.tipoActividad.descripcion}
                    </span>
                  )}
                  {lleno && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Cupo lleno
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-white leading-snug mb-2">{a.nombre}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {formatFecha(a.fechaInicio)} · {formatHora(a.fechaInicio)}–{formatHora(a.fechaFin)}
                  </span>
                  {a.costo && a.costo > 0 ? (
                    <span className="text-sm font-bold text-emerald-400">
                      +${a.costo.toLocaleString('es-MX')}
                    </span>
                  ) : (
                    <span className="text-xs text-emerald-500 font-medium">Gratis</span>
                  )}
                </div>
                {/* Capacity bar */}
                {a.cupoMaximo > 0 && (
                  <div className="mt-2">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${lleno ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, (a.cupoOcupado / a.cupoMaximo) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected summary */}
      {seleccionadas.length > 0 && (
        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl px-5 py-3 flex items-center justify-between">
          <span className="text-indigo-300 text-sm font-medium">
            {seleccionadas.length} actividad{seleccionadas.length > 1 ? 'es' : ''} seleccionada{seleccionadas.length > 1 ? 's' : ''}
          </span>
          <span className="text-white font-bold">
            +${totalActividades.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-2">
        <button type="button" onClick={onBack}
          className="px-6 py-2.5 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 rounded-xl transition-all text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Atrás
        </button>
        <div className="flex gap-3">
          <button type="button" id="btn-skip-actividades" onClick={onNext}
            className="px-6 py-2.5 border border-white/10 text-slate-400 hover:text-slate-200 rounded-xl transition-all text-sm font-medium">
            Omitir
          </button>
          <button type="button" id="btn-step2-next" onClick={onNext}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all active:scale-95 flex items-center gap-2 text-sm">
            Continuar
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
