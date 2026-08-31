'use client';

import { MiembroWizard } from '../RegistroForm';
import { TipoParticipante, PrecioInscripcion } from '@/shared/types/catalogos';

interface Props {
  grupoActivo: boolean;
  miembros: MiembroWizard[];
  tiposParticipante: TipoParticipante[];
  esAfiliada: boolean;
  precios: PrecioInscripcion[];
  onToggleGrupo: () => void;
  onMiembrosChange: (m: MiembroWizard[]) => void;
  onBack: () => void;
  onNext: () => void;
}

const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

function obtenerPrecioVigente(
  idTipoParticipante: number,
  esAfiliada: boolean,
  precios: PrecioInscripcion[]
): PrecioInscripcion | null {
  const ahora = new Date();
  const preciosFiltrados = precios
    .filter((p) =>
      p.idTipoParticipante === idTipoParticipante &&
      p.esAfiliada === esAfiliada &&
      p.activo &&
      new Date(p.fechaLimite) <= ahora
    )
    .sort((a, b) => new Date(b.fechaLimite).getTime() - new Date(a.fechaLimite).getTime());
  return preciosFiltrados.length > 0 ? preciosFiltrados[0] : null;
}

export function StepGrupo({ grupoActivo, miembros, tiposParticipante, esAfiliada, precios, onToggleGrupo, onMiembrosChange, onBack, onNext }: Props) {
  function addMiembro() { onMiembrosChange([...miembros, { nombre: '', apellido: '', correo: '', idTipoParticipante: 0 }]); }
  function removeMiembro(i: number) { onMiembrosChange(miembros.filter((_, idx) => idx !== i)); }
  function updateMiembro(i: number, field: keyof MiembroWizard, value: string | number) {
    onMiembrosChange(miembros.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  }

  function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function getCorreoError(correo: string): string | null {
    if (!correo.trim()) return null;
    if (!isValidEmail(correo)) return 'Formato de correo inválido';
    return null;
  }

  const costoTotalMiembros = miembros.reduce((sum, m) => {
    if (!m.idTipoParticipante) return sum;
    const precio = obtenerPrecioVigente(m.idTipoParticipante, esAfiliada, precios);
    return sum + (precio?.costo ?? 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Registro Grupal <span className="text-indigo-500 text-base font-normal">(opcional)</span>
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Agrega miembros adicionales al congreso general.
              Cada miembro paga según su tipo de participante.
            </p>
            {miembros.filter((m) => tiposParticipante.find((t) => t.idTipoParticipante === m.idTipoParticipante)?.clave === 'ALUMNO').length >= 15 && (
              <p className="text-emerald-600 text-sm mt-1 font-medium">
                ¡15+ alumnos! El profesor responsable no paga inscripción.
              </p>
            )}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.556.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm">Agrega miembros con el botón de abajo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {miembros.map((m, i) => {
                const precioMiembro = m.idTipoParticipante ? obtenerPrecioVigente(m.idTipoParticipante, esAfiliada, precios) : null;
                return (
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
                    <div className="grid gap-3 sm:grid-cols-2 mt-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Correo electrónico <span className="text-red-500">*</span></label>
                        <input id={`m-${i}-correo`} type="email" className={inputCls} placeholder="correo@ejemplo.com" value={m.correo} onChange={(e) => updateMiembro(i, 'correo', e.target.value)} />
                        {getCorreoError(m.correo) && (
                          <p className="text-xs text-red-500 mt-1">{getCorreoError(m.correo)}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600 mb-1 block">Tipo <span className="text-red-500">*</span></label>
                        <select className={selectCls} value={m.idTipoParticipante} onChange={(e) => updateMiembro(i, 'idTipoParticipante', parseInt(e.target.value) || 0)}>
                          <option value={0}>Seleccione...</option>
                          {tiposParticipante.map((t) => (
                            <option key={t.idTipoParticipante} value={t.idTipoParticipante}>{t.descripcion}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {precioMiembro && (
                      <div className="mt-2 text-right">
                        <span className="text-xs text-slate-500">Costo: </span>
                        <span className="text-xs font-semibold text-slate-700">${precioMiembro.costo.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <button type="button" id="btn-add-miembro" onClick={addMiembro}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 rounded-xl transition-all text-sm font-medium flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar miembro
          </button>

          {miembros.length > 0 && costoTotalMiembros > 0 && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-violet-700 text-sm">{miembros.length} miembro{miembros.length > 1 ? 's' : ''} en el grupo</span>
              <span className="text-violet-900 font-bold text-sm">
                +${costoTotalMiembros.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
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
