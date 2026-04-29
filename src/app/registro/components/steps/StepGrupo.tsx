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

const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';

export function StepGrupo({ grupoActivo, miembros, onToggleGrupo, onMiembrosChange, onBack, onNext }: Props) {
  function addMiembro() { onMiembrosChange([...miembros, { nombre: '', apellido: '' }]); }
  function removeMiembro(i: number) { onMiembrosChange(miembros.filter((_, idx) => idx !== i)); }
  function updateMiembro(i: number, field: keyof MiembroWizard, value: string) {
    onMiembrosChange(miembros.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  return (
    <div className="space-y-4">
      {/* Header + toggle */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Registro Grupal <span className="text-indigo-500 text-base font-normal">(opcional)</span>
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Agrega miembros adicionales al congreso general.
              Cada miembro suma <strong className="text-slate-700">$2,000 MXN</strong> al total.
            </p>
          </div>
          <button
            type="button" role="switch" aria-checked={grupoActivo} id="toggle-grupo"
            onClick={onToggleGrupo}
            className={`relative mt-1 inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${grupoActivo ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${grupoActivo ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {grupoActivo && (
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
          {miembros.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Agrega miembros con el botón de abajo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {miembros.map((m, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Miembro {i + 1}</span>
                    <button type="button" onClick={() => removeMiembro(i)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
                      Eliminar
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Nombre <span className="text-red-500">*</span></label>
                      <input id={`m-${i}-nombre`} className={inputCls} placeholder="Nombre" value={m.nombre} onChange={(e) => updateMiembro(i, 'nombre', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600 mb-1 block">Apellido <span className="text-red-500">*</span></label>
                      <input id={`m-${i}-apellido`} className={inputCls} placeholder="Apellido" value={m.apellido} onChange={(e) => updateMiembro(i, 'apellido', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button type="button" id="btn-add-miembro" onClick={addMiembro}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar miembro
          </button>

          {miembros.length > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-violet-700 text-sm">{miembros.length} miembro{miembros.length > 1 ? 's' : ''} en el grupo</span>
              <span className="text-violet-900 font-bold text-sm">
                +${(2000 * miembros.length).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between pt-1">
        <button type="button" onClick={onBack}
          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium flex items-center gap-2 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Atrás
        </button>
        <button type="button" id="btn-s3-next" onClick={onNext}
          className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm">
          Continuar
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
