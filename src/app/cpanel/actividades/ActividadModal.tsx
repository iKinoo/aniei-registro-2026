'use client';

import { useState, useTransition, useCallback } from 'react';
import { ActividadDTO, CrearActividadDTO, PonenteDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad, Institucion } from '@/shared/types/catalogos';
import { crearActividadAction, actualizarActividadAction, getActividadesAction } from './actions';
import { vincularPonenteAction } from './ponentes.actions';
import { SeccionPonentes } from './SeccionPonentes';

function toDatetimeLocal(iso: string) {
  return iso ? iso.slice(0, 16) : '';
}

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const emptyForm = (): FormState => ({
  nombre: '',
  cupoMaximo: 0,
  fecha: '',
  idTipoActividad: undefined,
  idInstitucionSede: undefined,
  idSala: undefined,
  tieneCosto: false,
  montoCosto: '',
});

interface FormState {
  nombre: string;
  cupoMaximo: number;
  fecha: string;
  idTipoActividad?: number;
  idInstitucionSede?: number;
  idSala?: number;
  tieneCosto: boolean;
  montoCosto: string;
}

function formToDTO(f: FormState): CrearActividadDTO {
  return {
    nombre: f.nombre,
    cupoMaximo: f.cupoMaximo || 0,
    fechaInicio: f.fecha,
    fechaFin: f.fecha,
    idTipoActividad: f.idTipoActividad,
    idInstitucionSede: f.idInstitucionSede,
    idSala: f.idSala,
    ...(f.tieneCosto && f.montoCosto && {
      costo: parseFloat(f.montoCosto),
    }),
  };
}

function actividadToForm(a: ActividadDTO): FormState {
  return {
    nombre: a.nombre,
    cupoMaximo: a.cupoMaximo,
    fecha: toDatetimeLocal(a.fechaInicio),
    idTipoActividad: a.idTipoActividad ?? undefined,
    idInstitucionSede: a.idInstitucionSede ?? undefined,
    idSala: a.idSala ?? undefined,
    tieneCosto: (a.costo ?? 0) > 0,
    montoCosto: a.costo != null && a.costo > 0 ? String(a.costo) : '',
  };
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
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
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sede</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Institución Sede">
                <select
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

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fecha</h3>
            <FormField label="Fecha" required>
              <input
                type="datetime-local"
                className={inputCls}
                value={form.fecha}
                onChange={(e) => setField('fecha', e.target.value)}
                required
              />
            </FormField>
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
