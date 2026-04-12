'use client';

import { useState, useTransition, useCallback } from 'react';
import { ActividadDTO, CrearActividadDTO, PonenteDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad, Institucion } from '@/shared/types/catalogos';
import { crearActividadAction, actualizarActividadAction, getActividadesAction } from './actions';
import { SeccionPonentes } from './SeccionPonentes';

// ---------- helpers ----------
function toDatetimeLocal(iso: string) {
  return iso ? iso.slice(0, 16) : '';
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ---------- SVG icons ----------
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CalendarIcon = () => (
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

// ---------- empty form ----------
const emptyForm = (): FormState => ({
  nombre: '',
  descripcion: '',
  cupoMaximo: 0,
  fechaInicio: '',
  fechaFin: '',
  idTipoActividad: undefined,
  idInstitucionSede: undefined,
  idSala: undefined,
  tieneCosto: false,
  folioCosto: '',
  montoCosto: '',
  horarioTexto: '',
  diasSemana: '',
});

interface FormState {
  nombre: string;
  descripcion: string;
  cupoMaximo: number;
  fechaInicio: string;
  fechaFin: string;
  idTipoActividad?: number;
  idInstitucionSede?: number;
  idSala?: number;
  tieneCosto: boolean;
  folioCosto: string;
  montoCosto: string;
  horarioTexto: string;
  diasSemana: string;
}

function formToDTO(f: FormState, esTaller: boolean): CrearActividadDTO {
  return {
    nombre: f.nombre,
    descripcion: f.descripcion || undefined,
    cupoMaximo: f.cupoMaximo || 0,
    fechaInicio: f.fechaInicio,
    fechaFin: f.fechaFin,
    idTipoActividad: f.idTipoActividad,
    idInstitucionSede: f.idInstitucionSede,
    idSala: f.idSala,
    ...(esTaller && {
      tallerDetalle: {
        horarioTexto: f.horarioTexto || undefined,
        diasSemana: f.diasSemana || undefined,
      },
    }),
    ...(f.tieneCosto && f.montoCosto && {
      costo: {
        folioRecibo: f.folioCosto || undefined,
        monto: parseFloat(f.montoCosto),
      },
    }),
  };
}

function actividadToForm(a: ActividadDTO): FormState {
  return {
    nombre: a.nombre,
    descripcion: a.descripcion ?? '',
    cupoMaximo: a.cupoMaximo,
    fechaInicio: toDatetimeLocal(a.fechaInicio),
    fechaFin: toDatetimeLocal(a.fechaFin),
    idTipoActividad: a.idTipoActividad ?? undefined,
    idInstitucionSede: a.idInstitucionSede ?? undefined,
    idSala: a.idSala ?? undefined,
    tieneCosto: !!a.costo,
    folioCosto: a.costo?.folioRecibo ?? '',
    montoCosto: a.costo?.monto != null ? String(a.costo.monto) : '',
    horarioTexto: a.tallerDetalle?.horarioTexto ?? '',
    diasSemana: a.tallerDetalle?.diasSemana ?? '',
  };
}

// ---------- badge de tipo ----------
const TIPO_COLORS: Record<string, string> = {
  'conferencia': 'bg-blue-100 text-blue-700',
  'taller': 'bg-amber-100 text-amber-700',
  'hackaton': 'bg-purple-100 text-purple-700',
  'torneo': 'bg-emerald-100 text-emerald-700',
};
function TipoBadge({ tipo }: { tipo: ActividadDTO['tipoActividad'] }) {
  if (!tipo) return <span className="text-slate-400 text-xs italic">Sin tipo</span>;
  const key = tipo.clave?.toLowerCase() ?? tipo.descripcion.toLowerCase();
  const color = TIPO_COLORS[key] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {tipo.descripcion}
    </span>
  );
}

// ---------- Field components ----------
function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
const textareaCls = inputCls + " resize-none";

// Helper: detecta si un tipo es taller por clave o descripción
function esTipoTaller(tipo: TipoActividad | undefined): boolean {
  if (!tipo) return false;
  const clave = (tipo.clave ?? '').toLowerCase();
  const desc = tipo.descripcion.toLowerCase();
  return clave.includes('taller') || desc.includes('taller');
}

// ============================================================
// Main component
// ============================================================
interface Props {
  initialActividades: ActividadDTO[];
  tiposActividad: TipoActividad[];
  instituciones: Institucion[];
}

export default function ActividadesClient({ initialActividades, tiposActividad, instituciones }: Props) {
  const [actividades, setActividades] = useState<ActividadDTO[]>(initialActividades);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [ponentesEdicion, setPonenteEdicion] = useState<PonenteDTO[]>([]);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  // Derive esTaller from the currently selected tipo
  const selectedTipo = tiposActividad.find((t) => t.idTipoActividad === form.idTipoActividad);
  const esTaller = esTipoTaller(selectedTipo);

  const refresh = useCallback(async () => {
    const res = await getActividadesAction();
    if (res.success) setActividades(res.data);
  }, []);

  function openNew() {
    setEditingId(null);
    setForm(emptyForm());
    setPonenteEdicion([]);
    setError('');
    setIsOpen(true);
  }

  function openEdit(a: ActividadDTO) {
    setEditingId(a.idActividad);
    setForm(actividadToForm(a));
    setPonenteEdicion(a.ponentes ?? []);
    setError('');
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setError('');
  }

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const selectedTipo = tiposActividad.find((t) => t.idTipoActividad === form.idTipoActividad);
    const esTaller = esTipoTaller(selectedTipo);
    startTransition(async () => {
      const dto = formToDTO(form, esTaller);
      const res = editingId !== null
        ? await actualizarActividadAction(editingId, dto)
        : await crearActividadAction(dto);
      if (!res.success) {
        setError(res.error);
        return;
      }
      await refresh();
      closeModal();
    });
  }

  return (
    <div className="p-8 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Actividades</h1>
            <p className="text-slate-500 mt-1">Crea y administra las actividades del congreso ANIEI.</p>
          </div>
          <button
            id="btn-nueva-actividad"
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-lg active:scale-95"
          >
            <PlusIcon /> Nueva Actividad
          </button>
        </div>

        {/* Stats chips */}
        <div className="flex gap-3 flex-wrap">
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-slate-900">{actividades.length}</p>
          </div>
          {tiposActividad.map((t) => {
            const count = actividades.filter((a) => a.idTipoActividad === t.idTipoActividad).length;
            return (
              <div key={t.idTipoActividad} className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-500 uppercase tracking-wide">{t.descripcion}</p>
                <p className="text-2xl font-bold text-slate-900">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Actividad</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Sede</th>
                  <th className="px-6 py-4 font-semibold">Fechas</th>
                  <th className="px-6 py-4 font-semibold text-center">Cupo</th>
                  <th className="px-6 py-4 font-semibold text-center">Costo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {actividades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-3">
                        <CalendarIcon />
                        <span className="text-sm">No hay actividades registradas aún.</span>
                        <button onClick={openNew} className="text-indigo-600 text-sm font-medium hover:underline">
                          Crear la primera actividad →
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  actividades.map((a) => (
                    <tr key={a.idActividad} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-900">{a.nombre}</span>
                          {a.descripcion && (
                            <span className="text-slate-400 text-xs line-clamp-1">{a.descripcion}</span>
                          )}
                          {a.tallerDetalle && (
                            <span className="text-xs text-amber-600 font-medium">
                              🕐 {a.tallerDetalle.horarioTexto ?? ''} {a.tallerDetalle.diasSemana ?? ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4"><TipoBadge tipo={a.tipoActividad} /></td>
                      <td className="px-6 py-4">
                        {a.institucionSede ? (
                          <span className="text-slate-700 text-xs font-medium">
                            {a.institucionSede.abreviatura ?? a.institucionSede.nombre}
                            {a.idSala != null && <span className="text-slate-400"> / Sala {a.idSala}</span>}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5 text-xs text-slate-600">
                          <span>⬆ {formatFecha(a.fechaInicio)}</span>
                          <span>⬇ {formatFecha(a.fechaFin)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {a.cupoMaximo === 0 ? (
                          <span className="text-xs text-slate-400 font-medium">Sin límite</span>
                        ) : (() => {
                          const pct = Math.min(100, Math.round((a.cupoOcupado / a.cupoMaximo) * 100));
                          const lleno = a.cupoOcupado >= a.cupoMaximo;
                          const barColor = lleno ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';
                          return (
                            <div className="flex flex-col items-center gap-1 min-w-[72px]">
                              <span className={`text-xs font-bold ${lleno ? 'text-rose-600' : pct >= 80 ? 'text-amber-600' : 'text-slate-700'}`}>
                                {a.cupoOcupado} / {a.cupoMaximo}
                              </span>
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                              </div>
                              {lleno && (
                                <span className="text-[10px] text-rose-500 font-semibold">Lleno</span>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {a.costo?.monto != null ? (
                          <span className="text-emerald-600 font-semibold text-xs">
                            ${a.costo.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-600 text-xs rounded-full font-medium">Gratis</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          id={`btn-editar-${a.idActividad}`}
                          onClick={() => openEdit(a)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <EditIcon /> Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingId !== null ? 'Editar Actividad' : 'Nueva Actividad'}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {editingId !== null ? 'Modifica los campos que necesites.' : 'Completa los datos para crear una actividad.'}
                </p>
              </div>
              <button
                id="btn-cerrar-modal"
                onClick={closeModal}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <XIcon />
              </button>
            </div>

            {/* Modal body */}
            <form id="form-actividad" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-6">

              {/* Basic info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Información General</h3>
                <FormField label="Nombre" required>
                  <input
                    id="input-nombre"
                    type="text"
                    className={inputCls}
                    placeholder="Ej. Conferencia Magistral de IA"
                    value={form.nombre}
                    onChange={(e) => setField('nombre', e.target.value)}
                    required
                  />
                </FormField>
                <FormField label="Descripción">
                  <textarea
                    id="input-descripcion"
                    className={textareaCls}
                    rows={3}
                    placeholder="Breve descripción de la actividad..."
                    value={form.descripcion}
                    onChange={(e) => setField('descripcion', e.target.value)}
                  />
                </FormField>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Tipo de Actividad">
                    <select
                      id="select-tipo"
                      className={inputCls}
                      value={form.idTipoActividad ?? ''}
                      onChange={(e) => setField('idTipoActividad', e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">— Sin tipo —</option>
                      {tiposActividad.map((t) => (
                        <option key={t.idTipoActividad} value={t.idTipoActividad}>{t.descripcion}</option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Cupo Máximo">
                    <input
                      id="input-cupo"
                      type="number"
                      min={0}
                      className={inputCls}
                      placeholder="0 = ilimitado"
                      value={form.cupoMaximo}
                      onChange={(e) => setField('cupoMaximo', Number(e.target.value))}
                    />
                  </FormField>
                </div>
              </div>

              {/* Venue */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sede</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Institución Sede">
                    <select
                      id="select-institucion"
                      className={inputCls}
                      value={form.idInstitucionSede ?? ''}
                      onChange={(e) => setField('idInstitucionSede', e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">— Sin sede —</option>
                      {instituciones.map((i) => (
                        <option key={i.idInstitucion} value={i.idInstitucion}>
                          {i.abreviatura ? `${i.abreviatura} - ${i.nombre}` : i.nombre}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Sala / Auditorio">
                    <input
                      id="input-sala"
                      type="number"
                      min={0}
                      className={inputCls}
                      placeholder="Número de sala"
                      value={form.idSala ?? ''}
                      onChange={(e) => setField('idSala', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormField>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fechas y Horario</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Fecha de Inicio" required>
                    <input
                      id="input-fecha-inicio"
                      type="datetime-local"
                      className={inputCls}
                      value={form.fechaInicio}
                      onChange={(e) => setField('fechaInicio', e.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="Fecha de Fin" required>
                    <input
                      id="input-fecha-fin"
                      type="datetime-local"
                      className={inputCls}
                      value={form.fechaFin}
                      onChange={(e) => setField('fechaFin', e.target.value)}
                      required
                    />
                  </FormField>
                </div>
              </div>

              {/* Taller details — shown automatically when tipo is taller */}
              {esTaller && (
                <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Detalle de Taller</p>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Horario">
                      <input
                        id="input-horario"
                        type="text"
                        className={inputCls}
                        placeholder="Ej. 10:00 - 13:00"
                        value={form.horarioTexto}
                        onChange={(e) => setField('horarioTexto', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Días de la semana">
                      <input
                        id="input-dias"
                        type="text"
                        className={inputCls}
                        placeholder="Ej. Lunes, Miércoles"
                        value={form.diasSemana}
                        onChange={(e) => setField('diasSemana', e.target.value)}
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {/* Costo (optional) */}
              <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    id="check-costo"
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    checked={form.tieneCosto}
                    onChange={(e) => setField('tieneCosto', e.target.checked)}
                  />
                  <span className="text-sm font-semibold text-slate-700">Esta actividad tiene costo de inscripción</span>
                </label>
                {form.tieneCosto && (
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <FormField label="Folio de Recibo">
                      <input
                        id="input-folio"
                        type="text"
                        className={inputCls}
                        placeholder="Ej. REC-001"
                        value={form.folioCosto}
                        onChange={(e) => setField('folioCosto', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Monto (MXN)" required>
                      <input
                        id="input-monto"
                        type="number"
                        min={0}
                        step={0.01}
                        className={inputCls}
                        placeholder="0.00"
                        value={form.montoCosto}
                        onChange={(e) => setField('montoCosto', e.target.value)}
                        required={form.tieneCosto}
                      />
                    </FormField>
                  </div>
                )}
              </div>

              {/* Ponentes */}
              <div className="space-y-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ponentes</h3>
                <SeccionPonentes
                  idActividad={editingId}
                  ponentesIniciales={ponentesEdicion}
                  onChange={setPonenteEdicion}
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
                  <span className="mt-0.5">⚠</span>
                  <span>{error}</span>
                </div>
              )}
            </form>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                id="btn-guardar"
                type="submit"
                form="form-actividad"
                disabled={isPending}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isPending ? 'Guardando...' : editingId !== null ? 'Actualizar' : 'Crear Actividad'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
