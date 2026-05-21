'use client';

interface MiembroRowProps {
  index: number;
  onRemove: (index: number) => void;
  errors?: Record<string, string>;
}

export function MiembroRow({ index, onRemove, errors }: MiembroRowProps) {
  const prefix = `miembro_${index}`;

  return (
    <div className="relative rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-600">Miembro {index + 1}</span>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50"
        >
          Eliminar
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${prefix}_nombre`} className="text-xs font-medium text-gray-600">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            id={`${prefix}_nombre`} name={`${prefix}_nombre`} type="text" required
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors?.[`miembros.${index}.nombre`] && (
            <p className="text-xs text-red-500">{errors[`miembros.${index}.nombre`]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${prefix}_apellido`} className="text-xs font-medium text-gray-600">
            Apellido <span className="text-red-500">*</span>
          </label>
          <input
            id={`${prefix}_apellido`} name={`${prefix}_apellido`} type="text" required
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors?.[`miembros.${index}.apellido`] && (
            <p className="text-xs text-red-500">{errors[`miembros.${index}.apellido`]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${prefix}_correo`} className="text-xs font-medium text-gray-600">
            Correo <span className="text-red-500">*</span>
          </label>
          <input
            id={`${prefix}_correo`} name={`${prefix}_correo`} type="email" required
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors?.[`miembros.${index}.correo`] && (
            <p className="text-xs text-red-500">{errors[`miembros.${index}.correo`]}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${prefix}_genero`} className="text-xs font-medium text-gray-600">
            Género <span className="text-red-500">*</span>
          </label>
          <select
            id={`${prefix}_genero`} name={`${prefix}_genero`} required defaultValue=""
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="" disabled>Seleccione...</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Prefiero no decirlo</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${prefix}_carrera`} className="text-xs font-medium text-gray-600">Carrera</label>
          <input
            id={`${prefix}_carrera`} name={`${prefix}_carrera`} type="text" maxLength={128}
            className="rounded border border-gray-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
