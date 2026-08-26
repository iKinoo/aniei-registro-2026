'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { actualizarUsuarioAction, UsuarioEditarData } from './actions';

interface Titulo {
  id_titulo: number;
  descripcion: string;
}

interface Institucion {
  id_institucion: number;
  nombre: string;
  abreviatura: string | null;
}

interface Estado {
  id_entidad_federativa: number;
  nombre: string;
}

interface Props {
  folio: string;
  initialData: {
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
    lada: string;
    extension: string;
    genero: string;
    carrera: string;
    dependencia: string;
    idTitulo: string;
    idInstitucion: string;
    idEntidadFederativa: string;
  };
  catalogos: {
    titulos: Titulo[];
    instituciones: Institucion[];
    estados: Estado[];
  };
}

const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

export function UsuarioEditarForm({ folio, initialData, catalogos }: Props) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState(initialData);

  const handleChange = (field: keyof typeof initialData, value: string) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    
    const updateData: UsuarioEditarData = {
      nombre: data.nombre,
      apellido: data.apellido,
      correo: data.correo,
      telefono: data.telefono || null,
      lada: data.lada || null,
      extension: data.extension || null,
      genero: data.genero || null,
      carrera: data.carrera || null,
      dependencia: data.dependencia || null,
      idTitulo: data.idTitulo ? parseInt(data.idTitulo) : null,
      idInstitucion: data.idInstitucion ? parseInt(data.idInstitucion) : null,
      idEntidadFederativa: data.idEntidadFederativa ? parseInt(data.idEntidadFederativa) : null,
    };

    const result = await actualizarUsuarioAction(folio, updateData);
    setIsSaving(false);

    if (result.success) {
      router.push(`/cpanel/usuarios/${folio}`);
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Nombre <span className="text-red-500">*</span></label>
          <input className={inputCls} value={data.nombre} onChange={(e) => handleChange('nombre', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Apellido <span className="text-red-500">*</span></label>
          <input className={inputCls} value={data.apellido} onChange={(e) => handleChange('apellido', e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Correo electrónico <span className="text-red-500">*</span></label>
        <input type="email" className={inputCls} value={data.correo} onChange={(e) => handleChange('correo', e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Lada</label>
          <input className={inputCls} placeholder="52" maxLength={10} value={data.lada} onChange={(e) => handleChange('lada', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Teléfono</label>
          <input className={inputCls} placeholder="5512345678" maxLength={20} value={data.telefono} onChange={(e) => handleChange('telefono', e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Extensión</label>
          <input className={inputCls} placeholder="100" maxLength={10} value={data.extension} onChange={(e) => handleChange('extension', e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Género</label>
          <select className={selectCls} value={data.genero} onChange={(e) => handleChange('genero', e.target.value)}>
            <option value="">Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Prefiero no decirlo</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Carrera / Programa</label>
          <input className={inputCls} maxLength={128} value={data.carrera} onChange={(e) => handleChange('carrera', e.target.value)} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Institución</label>
        <select className={selectCls} value={data.idInstitucion} onChange={(e) => handleChange('idInstitucion', e.target.value)}>
          <option value="">Seleccione...</option>
          {catalogos.instituciones.map((i) => (
            <option key={i.id_institucion} value={i.id_institucion}>
              {i.abreviatura ? `${i.abreviatura} - ${i.nombre}` : i.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700">Facultad / Dependencia</label>
        <input className={inputCls} maxLength={128} value={data.dependencia} onChange={(e) => handleChange('dependencia', e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Título</label>
          <select className={selectCls} value={data.idTitulo} onChange={(e) => handleChange('idTitulo', e.target.value)}>
            <option value="">Seleccione...</option>
            {catalogos.titulos.map((t) => (
              <option key={t.id_titulo} value={t.id_titulo}>{t.descripcion}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Estado</label>
          <select className={selectCls} value={data.idEntidadFederativa} onChange={(e) => handleChange('idEntidadFederativa', e.target.value)}>
            <option value="">Seleccione...</option>
            {catalogos.estados.map((e) => (
              <option key={e.id_entidad_federativa} value={e.id_entidad_federativa}>{e.nombre}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-all"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleGuardar}
          disabled={isSaving || !data.nombre || !data.apellido || !data.correo}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Guardar cambios
            </>
          )}
        </button>
      </div>
    </div>
  );
}
