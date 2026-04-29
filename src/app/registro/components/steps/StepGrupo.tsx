'use client';

import { MiembroWizard } from '../RegistroForm';

interface Props {
  grupoActivo: boolean;
  miembros: MiembroWizard[];
  onToggleGrupo: () => void;
  onMiembrosChange: (m: MiembroWizard[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500/60 transition-all';

export function StepGrupo({ grupoActivo, miembros, onToggleGrupo, onMiembrosChange, onBack, onNext }: Props) {
  function addMiembro() {
    onMiembrosChange([...miembros, { nombre: '', apellido: '' }]);
  }

  function removeMiembro(i: number) {
    onMiembrosChange(miembros.filter((_, idx) => idx !== i));
  }

  function updateMiembro(i: number, field: keyof MiembroWizard, value: string) {
    const updated = miembros.map((m, idx) => idx === i ? { ...m, [field]: value } : m);
    onMiembrosChange(updated);
  }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-0.5">
              Registro Grupal <span className="text-indigo-400 text-base font-normal">(opcional)</span>
            </h2>
            <p className="text-slate-400 text-sm">
              Agrega miembros adicionales que se registrarán al congreso general.<br />
              Cada miembro suma <span className="text-white font-medium">$2,000 MXN</span> al total.
            </p>
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            role="switch"
            aria-checked={grupoActivo}
            onClick={onToggleGrupo}
            id="toggle-grupo"
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ml-4 ${
              grupoActivo ? 'bg-indigo-600' : 'bg-white/10'
            }`}
          >
            <span className={`inline-block h-5 w-5 mt-0.5 transform rounded-full bg-white shadow transition-transform duration-200 ${
              grupoActivo ? 'translate-x-6' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {grupoActivo && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm space-y-4">
          {miembros.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Aún no has agregado miembros al grupo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {miembros.map((m, i) => (
                <div key={i} className="bg-white/5 border border-white/8 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Miembro {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMiembro(i)}
                      className="text-slate-500 hover:text-rose-400 transition-colors text-xs"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">
                        Nombre <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id={`miembro-${i}-nombre`}
                        className={inputCls}
                        placeholder="Nombre"
                        value={m.nombre}
                        onChange={(e) => updateMiembro(i, 'nombre', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-1 block">
                        Apellido <span className="text-rose-400">*</span>
                      </label>
                      <input
                        id={`miembro-${i}-apellido`}
                        className={inputCls}
                        placeholder="Apellido"
                        value={m.apellido}
                        onChange={(e) => updateMiembro(i, 'apellido', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            id="btn-agregar-miembro"
            onClick={addMiembro}
            className="w-full py-2.5 border-2 border-dashed border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar miembro
          </button>

          {miembros.length > 0 && (
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-violet-300 text-sm">{miembros.length} miembro{miembros.length > 1 ? 's' : ''} en el grupo</span>
              <span className="text-white font-bold text-sm">
                +${(2000 * miembros.length).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
          )}
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
        <button type="button" id="btn-step3-next" onClick={onNext}
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
