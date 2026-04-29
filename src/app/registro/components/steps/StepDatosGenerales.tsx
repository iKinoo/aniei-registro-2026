'use client';

import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';
import { DatosGeneralesWizard } from '../RegistroForm';
import { cargosToOptions, estadosToOptions, institucionesToOptions, tiposUsuarioToOptions } from '../SelectCatalogo';

interface Props {
  catalogos: { cargos: Cargo[]; estados: Estado[]; instituciones: Institucion[]; tiposUsuario: TipoUsuario[] };
  datos: DatosGeneralesWizard;
  errors?: Record<string, string>;
  onChange: (d: DatosGeneralesWizard) => void;
  onNext: () => void;
}

const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

export function StepDatosGenerales({ catalogos, datos, errors, onChange, onNext }: Props) {
  function set(key: keyof DatosGeneralesWizard, value: string) {
    onChange({ ...datos, [key]: value });
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Datos Generales</h2>
        <p className="text-slate-500 text-sm mt-0.5">Información personal e institucional del participante</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre" required error={errors?.nombre}>
          <input id="s1-nombre" className={inputCls} placeholder="Ej. María" value={datos.nombre} onChange={(e) => set('nombre', e.target.value)} />
        </Field>
        <Field label="Apellido" required error={errors?.apellido}>
          <input id="s1-apellido" className={inputCls} placeholder="Ej. García López" value={datos.apellido} onChange={(e) => set('apellido', e.target.value)} />
        </Field>
      </div>

      <Field label="Correo electrónico" required error={errors?.correo}>
        <input id="s1-correo" type="email" className={inputCls} placeholder="correo@ejemplo.com" value={datos.correo} onChange={(e) => set('correo', e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Lada">
          <input id="s1-lada" className={inputCls} placeholder="52" maxLength={10} value={datos.lada} onChange={(e) => set('lada', e.target.value)} />
        </Field>
        <Field label="Teléfono">
          <input id="s1-tel" className={inputCls} placeholder="5512345678" maxLength={20} value={datos.telefono} onChange={(e) => set('telefono', e.target.value)} />
        </Field>
        <Field label="Extensión">
          <input id="s1-ext" className={inputCls} placeholder="100" maxLength={10} value={datos.extension} onChange={(e) => set('extension', e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Género" required error={errors?.genero}>
          <select id="s1-genero" className={selectCls} value={datos.genero} onChange={(e) => set('genero', e.target.value)}>
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Prefiero no decirlo</option>
          </select>
        </Field>
        <Field label="Carrera / Programa">
          <input id="s1-carrera" className={inputCls} placeholder="Ej. Ingeniería en Sistemas" maxLength={128} value={datos.carrera} onChange={(e) => set('carrera', e.target.value)} />
        </Field>
      </div>

      <Field label="Facultad / Dependencia">
        <input id="s1-dep" className={inputCls} placeholder="Ej. Facultad de Ingeniería" maxLength={128} value={datos.dependencia} onChange={(e) => set('dependencia', e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cargo" required error={errors?.idCargo}>
          <select id="s1-cargo" className={selectCls} value={datos.idCargo} onChange={(e) => set('idCargo', e.target.value)}>
            <option value="">Seleccione...</option>
            {cargosToOptions(catalogos.cargos).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
        <Field label="Tipo de participante" required error={errors?.idTipoUsuario}>
          <select id="s1-tipo" className={selectCls} value={datos.idTipoUsuario} onChange={(e) => set('idTipoUsuario', e.target.value)}>
            <option value="">Seleccione...</option>
            {tiposUsuarioToOptions(catalogos.tiposUsuario).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Institución" required error={errors?.idInstitucion}>
        <select id="s1-inst" className={selectCls} value={datos.idInstitucion} onChange={(e) => set('idInstitucion', e.target.value)}>
          <option value="">Seleccione...</option>
          {institucionesToOptions(catalogos.instituciones).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Estado" required error={errors?.idEntidadFederativa}>
        <select id="s1-estado" className={selectCls} value={datos.idEntidadFederativa} onChange={(e) => set('idEntidadFederativa', e.target.value)}>
          <option value="">Seleccione...</option>
          {estadosToOptions(catalogos.estados).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <div className="flex justify-end pt-1">
        <button type="button" id="btn-s1-next" onClick={onNext}
          className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm">
          Continuar
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
