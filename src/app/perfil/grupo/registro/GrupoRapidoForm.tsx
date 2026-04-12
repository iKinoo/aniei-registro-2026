'use client';

import { useActionState, useState } from 'react';
import { registrarGrupoRapidoAction } from './actions';

interface MiembroGrupo {
  nombre: string;
  apellidos: string;
  idTipoUsuario: number | string;
}

interface TipoUsuario {
  idTipoUsuario: number;
  descripcion: string;
}

export function GrupoRapidoForm({ tiposUsuario }: { tiposUsuario: TipoUsuario[] }) {
  const [state, formAction, isPending] = useActionState(registrarGrupoRapidoAction, { success: false });
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([{ nombre: '', apellidos: '', idTipoUsuario: '' }]);

  const addMiembro = () => setMiembros([...miembros, { nombre: '', apellidos: '', idTipoUsuario: '' }]);
  const removeMiembro = (index: number) => {
    if (miembros.length > 1) {
      setMiembros(miembros.filter((_, i) => i !== index));
    }
  };

  const updateMiembro = (index: number, field: keyof MiembroGrupo, value: string) => {
    const newMiembros = [...miembros];
    newMiembros[index] = { ...newMiembros[index], [field]: value };
    setMiembros(newMiembros);
  };

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-medium text-green-900 mb-2">¡Grupo Registrado con Éxito!</h3>
        <p className="text-green-800 mb-4">
          Hemos recibido tu registro y adjunto bancario. Se te ha enviado a tu correo ({state.data?.emailPadre})
          un PDF con el código QR y folio de confirmación.
        </p>
        <p className="text-sm text-green-700">
          Por favor, comparte este PDF o código QR con los miembros de tu grupo para que completen su registro antes del evento.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      {state.success === false && state.error && (
        <div className="rounded-md bg-red-50 p-4 mb-6 relative border border-red-200">
          <p className="text-sm text-red-700 font-medium">{state.error}</p>
        </div>
      )}

      {/* Comprobante Pago */}
      <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Comprobante de Pago Global</h3>
        <p className="text-sm text-gray-600 mb-4">Sube un único PDF o Imagen que ampare la inscripción.</p>
        
        <div className="mt-2">
           <label htmlFor="archivo" className="block text-sm font-medium leading-6 text-gray-900 mb-2">Doc. Depósito o Transferencia <span className="text-red-500">*</span></label>
           <input
             id="archivo"
             name="archivo"
             type="file"
             required
             accept="image/jpeg,image/png,application/pdf"
             className="block w-full text-sm text-gray-500"
           />
           {state.errors?.archivo && <p className="mt-2 text-sm text-red-600 font-medium">{state.errors.archivo}</p>}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Integrantes del Grupo</h3>
          </div>
          <button
            type="button"
            onClick={addMiembro}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
          >
            + Agregar Integrante
          </button>
        </div>

        <div className="space-y-4">
          {miembros.map((miembro, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
              
              <div className="flex-1">
                <input
                  type="text"
                  name={`nombres[]`}
                  required
                  placeholder="Nombre(s)"
                  value={miembro.nombre}
                  onChange={(e) => updateMiembro(index, 'nombre', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                />
              </div>

              <div className="flex-1">
                <input
                  type="text"
                  name={`apellidos[]`}
                  required
                  placeholder="Apellidos"
                  value={miembro.apellidos}
                  onChange={(e) => updateMiembro(index, 'apellidos', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300"
                />
              </div>

              <div className="flex-1">
                <select
                  name={`tiposUsuario[]`}
                  required
                  value={miembro.idTipoUsuario}
                  onChange={(e) => updateMiembro(index, 'idTipoUsuario', e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-white"
                >
                  <option value="" disabled>Selec. Tipo de Perfil</option>
                  {tiposUsuario.map(t => (
                    <option key={t.idTipoUsuario} value={t.idTipoUsuario}>{t.descripcion}</option>
                  ))}
                </select>
              </div>

              {miembros.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMiembro(index)}
                  className="text-red-500 hover:text-red-700 px-3"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <button
          type="submit"
          disabled={isPending}
          className="w-full justify-center rounded-md bg-green-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:bg-gray-400"
        >
          {isPending ? 'Procesando...' : 'Realizar Registro Grupal'}
        </button>
      </div>
    </form>
  );
}
