'use client';

import { useActionState } from 'react';
import { completarRegistroAction, CompletarActionState } from './actions';
import { SelectCatalogo, cargosToOptions, estadosToOptions, institucionesToOptions } from '@/app/registro/components/SelectCatalogo';
import { Cargo, Estado, Institucion } from '@/shared/types/catalogos';

interface Props {
  token: string;
  idUsuario: number;
  catalogos: {
    cargos: Cargo[];
    estados: Estado[];
    instituciones: Institucion[];
  };
}

const initialState: CompletarActionState = { success: false };

export function CompletarRegistroForm({ token, idUsuario, catalogos }: Props) {
  const bindedAction = completarRegistroAction.bind(null, token, idUsuario);
  const [state, formAction, isPending] = useActionState(bindedAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-green-800">¡Registro completado!</h2>
        <p className="text-green-700 mt-1">
          Las instrucciones de acceso han sido enviadas a <strong>{state.correo}</strong>.
        </p>
        <p className="text-sm text-green-600 bg-green-100 rounded-lg px-4 py-3">
          Verás tus actividades a continuación, serás redirigido brevemente o haz clic para continuar:
        </p>
        <a href="/actividades" className="inline-block mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg">
          Ir a actividades
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.errors?._form && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.errors._form}
        </div>
      )}

      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">Completa tus datos personales</legend>

        <div className="flex flex-col gap-1">
          <label htmlFor="correo" className="text-sm font-medium text-gray-700">
            Correo electrónico real <span className="text-red-500">*</span>
          </label>
          <input
            id="correo" name="correo" type="email" required
            defaultValue={state.fields?.correo ?? ''}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state.errors?.correo && <p className="text-xs text-red-500">{state.errors.correo}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
           <div className="flex flex-col gap-1">
            <label htmlFor="genero" className="text-sm font-medium text-gray-700">
              Género <span className="text-red-500">*</span>
            </label>
            <select
              id="genero" name="genero" required
              defaultValue={state.fields?.genero ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="" disabled>Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
            {state.errors?.genero && <p className="text-xs text-red-500">{state.errors.genero}</p>}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="telefono" className="text-sm font-medium text-gray-700">Teléfono (opcional)</label>
            <input
              id="telefono" name="telefono" type="tel" maxLength={20}
              defaultValue={state.fields?.telefono ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="carrera" className="text-sm font-medium text-gray-700">Carrera (opcional)</label>
            <input
              id="carrera" name="carrera" type="text" maxLength={128}
              defaultValue={state.fields?.carrera ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="dependencia" className="text-sm font-medium text-gray-700">Dependencia (opcional)</label>
            <input
              id="dependencia" name="dependencia" type="text" maxLength={128}
              defaultValue={state.fields?.dependencia ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">Datos institucionales</legend>
        
        <SelectCatalogo
          name="idCargo" label="Cargo" required
          options={cargosToOptions(catalogos.cargos)}
          error={state.errors?.idCargo}
          defaultValue={state.fields?.idCargo}
        />
        
        <SelectCatalogo
          name="idInstitucion" label="Institución" required
          options={institucionesToOptions(catalogos.instituciones)}
          error={state.errors?.idInstitucion}
          defaultValue={state.fields?.idInstitucion}
        />
        
        <SelectCatalogo
          name="idEntidadFederativa" label="Estado" required
          options={estadosToOptions(catalogos.estados)}
          error={state.errors?.idEntidadFederativa}
          defaultValue={state.fields?.idEntidadFederativa}
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {isPending ? 'Finalizando...' : 'Completar Registro'}
        </button>
      </div>
    </form>
  );
}
