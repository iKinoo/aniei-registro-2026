'use client';

import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';

interface SelectCatalogoProps {
  name: string;
  label: string;
  options: { value: number; label: string }[];
  error?: string;
  required?: boolean;
}

export function SelectCatalogo({ name, label, options, error, required }: SelectCatalogoProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        defaultValue=""
      >
        <option value="" disabled>Seleccione...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Helpers to convert catalog types to option format
export function cargosToOptions(cargos: Cargo[]) {
  return cargos.map((c) => ({ value: c.idCargo, label: c.descripcion }));
}

export function estadosToOptions(estados: Estado[]) {
  return estados.map((e) => ({ value: e.idEntidadFederativa, label: e.nombre }));
}

export function institucionesToOptions(instituciones: Institucion[]) {
  return instituciones.map((i) => ({ value: i.idInstitucion, label: i.abreviatura ? `${i.abreviatura} — ${i.nombre}` : i.nombre }));
}

export function tiposUsuarioToOptions(tipos: TipoUsuario[]) {
  return tipos.map((t) => ({ value: t.idTipoUsuario, label: t.descripcion }));
}
