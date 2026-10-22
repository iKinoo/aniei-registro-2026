'use client';

import { useState, useTransition, useCallback } from 'react';
import { ActividadDTO, CrearActividadDTO, ModalidadActividad, PonenteDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad, Institucion } from '@/application/dtos/CatalogosDTO';
import { crearActividadAction, actualizarActividadAction, getActividadesAction } from './actions';
import { vincularPonenteAction } from './ponentes.actions';
import { SeccionPonentes } from './SeccionPonentes';

interface HorarioRow {
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

const vacioHorario = (): HorarioRow => ({ fecha: '', horaInicio: '', horaFin: '' });

function horarioToFila(fechaInicio: string, fechaFin: string): HorarioRow {
  return {
    fecha: fechaInicio.slice(0, 10),
    horaInicio: fechaInicio.slice(11, 16),
    horaFin: fechaFin.slice(11, 16),
  };
}

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const PlusSmallIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

interface FormState {
  nombre: string;
  cupoMaximo: number;
  horarios: HorarioRow[];
  idTipoActividad?: number;
  idInstitucionSede?: number;
  modalidad: ModalidadActividad;
  enlaceSesion: string;
  sala: string;
  tieneCosto: boolean;
  montoCosto: string;
}

const emptyForm = (): FormState => ({
  nombre: '',
  cupoMaximo: 0,
  horarios: [vacioHorario()],
  idTipoActividad: undefined,
  idInstitucionSede: undefined,
  modalidad: 'PRESENCIAL',
  enlaceSesion: '',
  sala: '',
  tieneCosto: false,
  montoCosto: '',
});

function formToDTO(f: FormState): CrearActividadDTO {
  const horarios = f.horarios.map((h) => ({
    fechaInicio: `${h.fecha}T${h.horaInicio}`,
    fechaFin: `${h.fecha}T${h.horaFin}`,
  }));
  return {
    nombre: f.nombre,
    cupoMaximo: f.cupoMaximo || 0,
    fechaInicio: horarios[0]?.fechaInicio ?? '',
    fechaFin: horarios[0]?.fechaFin ?? '',
    idTipoActividad: f.idTipoActividad,
    idInstitucionSede: f.idInstitucionSede,
    modalidad: f.modalidad,
    enlaceSesion: f.modalidad === 'VIRTUAL' ? f.enlaceSesion.trim() : null,
    sala: f.modalidad === 'PRESENCIAL' ? f.sala.trim() : '',
    ...(f.tieneCosto && f.montoCosto && {
      costo: parseFloat(f.montoCosto),
    }),
    horarios,
  };
}

function actividadToForm(a: ActividadDTO): FormState {
  const filas = a.horarios.length > 0
    ? a.horarios.map((h) => horarioToFila(h.fechaInicio, h.fechaFin))
    : [horarioToFila(a.fechaInicio, a.fechaFin)];
  return {
    nombre: a.nombre,
    cupoMaximo: a.cupoMaximo,
    horarios: filas,
    idTipoActividad: a.idTipoActividad ?? undefined,
    idInstitucionSede: a.idInstitucionSede ?? undefined,
    modalidad: a.modalidad ?? 'PRESENCIAL',
    enlaceSesion: a.enlaceSesion ?? '',
    sala: a.sala ?? '',
    tieneCosto: (a.costo ?? 0) > 0,
    montoCosto: a.costo != null && a.costo > 0 ? String(a.costo) : '',
  };
}

function validarHorarios(filas: HorarioRow[]): string | null {
  if (filas.length === 0) return 'Agrega al menos un horario.';
  for (const h of filas) {
    if (!h.fecha || !h.horaInicio || !h.horaFin) {
      return 'Cada horario debe tener fecha, hora de inicio y hora de fin.';
    }
    if (h.horaFin < h.horaInicio) {
      return 'La hora de fin no puede ser anterior a la hora de inicio.';
    }
  }
  return null;
}

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

interface Props {
  editingActividad?: ActividadDTO | null;
  tiposActividad: TipoActividad[];
  instituciones: Institucion[];
  onSuccess: () => void;
  onClose: () => void;
}

export function ActividadModal({ editingActividad, tiposActividad, instituciones, onSuccess, onClose }: Props) {
  const editingId = editingActividad?.idActividad ?? null;
  const [form, setForm] = useState<FormState>(editingActividad ? actividadToForm(editingActividad) : emptyForm());
  const [ponentesEdicion, setPonenteEdicion] = useState<PonenteDTO[]>(editingActividad?.ponentes ?? []);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(async () => {
    await getActividadesAction();
  }, []);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setHorario(indice: number, campo: keyof HorarioRow, valor: string) {
    setForm((prev) => ({
      ...prev,
      horarios: prev.horarios.map((h, i) => (i === indice ? { ...h, [campo]: valor } : h)),
    }));
  }

  function agregarHorario() {
    setForm((prev) => ({ ...prev, horarios: [...prev.horarios, vacioHorario()] }));
  }

  function eliminarHorario(indice: number) {
    setForm((prev) => ({ ...prev, horarios: prev.horarios.filter((_, i) => i !== indice) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const errorHorarios = validarHorarios(form.horarios);
    if (errorHorarios) {
      setError(errorHorarios);
      return;
    }
    startTransition(async () => {
      const dto = formToDTO(form);
      const res = editingId !== null
        ? await actualizarActividadAction(editingId, dto)
        : await crearActividadAction(dto);
      if (!res.success) {
        setError(res.error);
        return;
      }
      const newId = res.data.idActividad;
      for (const p of ponentesEdicion) {
        await vincularPonenteAction(newId, p.folioRegistro, p.rol ?? 'Ponente');
      }
      await refresh();
      onSuccess();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

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
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        <form id="form-actividad" onSubmit={handleSubmit} className="overflow-y-auto px-6 py-6 space-y-6">

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Información General</h3>
            <FormField label="Nombre" required>
              <input
                type="text"
                className={inputCls}
                placeholder="Ej. Conferencia Magistral de IA"
                value={form.nombre}
                onChange={(e) => setField('nombre', e.target.value)}
                required
              />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Tipo de Actividad">
                <select
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

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Modalidad</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Modalidad" required>
                <select
                  className={inputCls}
                  value={form.modalidad}
                  onChange={(e) => setField('modalidad', e.target.value as ModalidadActividad)}
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                </select>
              </FormField>
              {form.modalidad === 'VIRTUAL' ? (
                <FormField label="Enlace de la sesión">
                  <input
                    type="url"
                    className={inputCls}
                    placeholder="https://… (opcional)"
                    value={form.enlaceSesion}
                    onChange={(e) => setField('enlaceSesion', e.target.value)}
                  />
                </FormField>
              ) : (
                <FormField label="Sala / Auditorio">
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="Ej. Auditorio B, Sala 3"
                    value={form.sala}
                    onChange={(e) => setField('sala', e.target.value)}
                  />
                </FormField>
              )}
            </div>
            {form.modalidad === 'VIRTUAL' && (
              <p className="text-xs text-slate-500">
                Puedes dejar el enlace vacío y capturarlo después, cuando se genere la sesión.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Institución responsable</h3>
            <FormField label="Institución responsable">
              <select
                className={inputCls}
                value={form.idInstitucionSede ?? ''}
                onChange={(e) => setField('idInstitucionSede', e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">— Sin institución —</option>
                {instituciones.map((i) => (
                  <option key={i.idInstitucion} value={i.idInstitucion}>
                    {i.abreviatura ? `${i.abreviatura} - ${i.nombre}` : i.nombre}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Horarios</h3>
              <button
                type="button"
                onClick={agregarHorario}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <PlusSmallIcon /> Agregar horario
              </button>
            </div>
            <div className="space-y-3">
              {form.horarios.map((h, i) => (
                <div key={i} className="flex items-end gap-3">
                  <FormField label={i === 0 ? 'Fecha' : '\u00A0'} required>
                    <input
                      type="date"
                      className={inputCls}
                      value={h.fecha}
                      onChange={(e) => setHorario(i, 'fecha', e.target.value)}
                      required={i === 0}
                    />
                  </FormField>
                  <FormField label={i === 0 ? 'Hora inicio' : '\u00A0'} required>
                    <input
                      type="time"
                      className={inputCls}
                      value={h.horaInicio}
                      onChange={(e) => setHorario(i, 'horaInicio', e.target.value)}
                      required={i === 0}
                    />
                  </FormField>
                  <FormField label={i === 0 ? 'Hora fin' : '\u00A0'} required>
                    <input
                      type="time"
                      className={inputCls}
                      value={h.horaFin}
                      onChange={(e) => setHorario(i, 'horaFin', e.target.value)}
                      required={i === 0}
                    />
                  </FormField>
                  <button
                    type="button"
                    onClick={() => eliminarHorario(i)}
                    disabled={form.horarios.length === 1}
                    title={form.horarios.length === 1 ? 'La actividad debe conservar al menos un horario' : 'Eliminar horario'}
                    className="mb-1.5 p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                checked={form.tieneCosto}
                onChange={(e) => setField('tieneCosto', e.target.checked)}
              />
              <span className="text-sm font-semibold text-slate-700">Esta actividad tiene costo de inscripción</span>
            </label>
            {form.tieneCosto && (
              <div className="grid grid-cols-1 gap-4 mt-2">
                <FormField label="Monto (MXN)" required>
                  <input
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
            form="form-actividad"
            disabled={isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isPending ? 'Guardando...' : editingId !== null ? 'Actualizar' : 'Crear Actividad'}
          </button>
        </div>
      </div>
    </div>
  );
}
