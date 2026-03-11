'use client';

import { useState, useActionState } from 'react';
import { registrarGrupoAction, GrupoActionState } from '../actions/registrar-grupo.action';
import { SelectCatalogo, cargosToOptions, estadosToOptions, institucionesToOptions, tiposUsuarioToOptions } from './SelectCatalogo';
import { CampoArchivo } from './CampoArchivo';
import { MiembroRow } from './MiembroRow';
import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';

interface GrupoFormProps {
  catalogos: {
    cargos: Cargo[];
    estados: Estado[];
    instituciones: Institucion[];
    tiposUsuario: TipoUsuario[];
  };
}

const initialState: GrupoActionState = { success: false };

export function GrupoForm({ catalogos }: GrupoFormProps) {
  const [state, formAction, isPending] = useActionState(registrarGrupoAction, initialState);
  const [miembrosCount, setMiembrosCount] = useState(1);

  const miembrosIndices = Array.from({ length: miembrosCount }, (_, i) => i);

  function addMiembro() {
    setMiembrosCount((c) => c + 1);
  }

  function removeMiembro(index: number) {
    if (miembrosCount <= 1) return;
    setMiembrosCount((c) => c - 1);
  }

  if (state.success) {
    return (
      <div className="rounded-lg bg-green-50 p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-green-800">¡Registro grupal exitoso!</h2>
        <p className="text-green-700">
          Se registraron <strong>{state.totalRegistrados}</strong> personas.
        </p>
        <div className="mt-3 space-y-1">
          {state.folios?.map((folio) => (
            <p key={folio} className="text-sm text-green-600">Folio: <strong>{folio}</strong></p>
          ))}
        </div>
        <a
          href="/confirmacion"
          className="mt-4 inline-block rounded-lg bg-green-600 px-6 py-2 text-white transition-colors hover:bg-green-700"
        >
          Ver confirmación
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
      {state.errors?.miembros && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {state.errors.miembros}
        </div>
      )}

      {/* Datos del responsable */}
      <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">Datos del Responsable</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="resp_nombre" className="text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input id="resp_nombre" name="resp_nombre" type="text" required
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            {state.errors?.['responsable.nombre'] && <p className="text-xs text-red-500">{state.errors['responsable.nombre']}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="resp_apellido" className="text-sm font-medium text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input id="resp_apellido" name="resp_apellido" type="text" required
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="resp_correo" className="text-sm font-medium text-gray-700">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input id="resp_correo" name="resp_correo" type="email" required
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          {state.errors?.['responsable.correo'] && <p className="text-xs text-red-500">{state.errors['responsable.correo']}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="resp_lada" className="text-sm font-medium text-gray-700">Lada</label>
            <input id="resp_lada" name="resp_lada" type="text" maxLength={10}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="resp_telefono" className="text-sm font-medium text-gray-700">Teléfono</label>
            <input id="resp_telefono" name="resp_telefono" type="text" maxLength={20}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="resp_extension" className="text-sm font-medium text-gray-700">Ext.</label>
            <input id="resp_extension" name="resp_extension" type="text" maxLength={10}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="resp_genero" className="text-sm font-medium text-gray-700">
              Género <span className="text-red-500">*</span>
            </label>
            <select id="resp_genero" name="resp_genero" required defaultValue=""
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="" disabled>Seleccione...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="resp_carrera" className="text-sm font-medium text-gray-700">Carrera</label>
            <input id="resp_carrera" name="resp_carrera" type="text" maxLength={128}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="resp_dependencia" className="text-sm font-medium text-gray-700">Dependencia</label>
          <input id="resp_dependencia" name="resp_dependencia" type="text" maxLength={128}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectCatalogo name="resp_idCargo" label="Cargo" required
            options={cargosToOptions(catalogos.cargos)} />
          <SelectCatalogo name="resp_idTipoUsuario" label="Tipo de participante" required
            options={tiposUsuarioToOptions(catalogos.tiposUsuario)} />
        </div>
        <SelectCatalogo name="resp_idInstitucion" label="Institución" required
          options={institucionesToOptions(catalogos.instituciones)} />
        <SelectCatalogo name="resp_idEntidadFederativa" label="Estado" required
          options={estadosToOptions(catalogos.estados)} />
      </fieldset>

      {/* Miembros del grupo */}
      <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">
          Miembros del Grupo ({miembrosCount})
        </legend>

        <input type="hidden" name="miembros_count" value={miembrosCount} />

        <div className="space-y-4">
          {miembrosIndices.map((i) => (
            <MiembroRow
              key={i}
              index={i}
              tiposUsuario={catalogos.tiposUsuario}
              onRemove={removeMiembro}
              errors={state.errors}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={addMiembro}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600"
        >
          + Agregar miembro
        </button>
      </fieldset>

      {/* Comprobante grupal */}
      <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">Comprobante de Pago Grupal</legend>
        <CampoArchivo name="comprobante" error={state.errors?.comprobante} />
      </fieldset>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? 'Registrando grupo...' : `Registrar grupo (${miembrosCount} miembros)`}
      </button>
    </form>
  );
}
