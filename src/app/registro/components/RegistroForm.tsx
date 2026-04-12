'use client';

import { useActionState } from 'react';
import { registrarUsuarioAction, RegistroActionState } from '../actions/registrar-usuario.action';
import { SelectCatalogo, cargosToOptions, estadosToOptions, institucionesToOptions, tiposUsuarioToOptions } from './SelectCatalogo';
import { CampoArchivo } from './CampoArchivo';
import { SeccionFacturacion } from './SeccionFacturacion';
import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';

interface RegistroFormProps {
  catalogos: {
    cargos: Cargo[];
    estados: Estado[];
    instituciones: Institucion[];
    tiposUsuario: TipoUsuario[];
  };
}

const initialState: RegistroActionState = { success: false };

export function RegistroForm({ catalogos }: RegistroFormProps) {
  const [state, formAction, isPending] = useActionState(registrarUsuarioAction, initialState);

  if (state.success) {
    return (
      <div className="rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-200 p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-green-800">¡Registro exitoso!</h2>
          <p className="text-green-700 mt-1">
            Tu folio de registro es:{' '}
            <strong className="text-lg font-mono bg-green-100 px-2 py-0.5 rounded">{state.folio}</strong>
          </p>
        </div>
        <p className="text-sm text-green-600 bg-green-100 rounded-lg px-4 py-3">
          📬 Revisa tu correo <strong>{state.correo}</strong> — ahí encontrarás tu contraseña de acceso y la confirmación de registro.
        </p>
        <a
          id="btn-continuar-actividades"
          href="/actividades"
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-200 transition-all hover:shadow-lg active:scale-95"
        >
          Seleccionar actividades
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
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

      {/* Datos personales */}
      <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">Datos Personales</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="nombre" className="text-sm font-medium text-gray-700">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre" name="nombre" type="text" required
              defaultValue={state.fields?.nombre ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.nombre && <p className="text-xs text-red-500">{state.errors.nombre}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="apellido" className="text-sm font-medium text-gray-700">
              Apellido <span className="text-red-500">*</span>
            </label>
            <input
              id="apellido" name="apellido" type="text" required
              defaultValue={state.fields?.apellido ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.apellido && <p className="text-xs text-red-500">{state.errors.apellido}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="correo" className="text-sm font-medium text-gray-700">
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            id="correo" name="correo" type="email" required
            defaultValue={state.fields?.correo ?? ''}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state.errors?.correo && <p className="text-xs text-red-500">{state.errors.correo}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="lada" className="text-sm font-medium text-gray-700">Lada</label>
            <input
              id="lada" name="lada" type="text" maxLength={10}
              defaultValue={state.fields?.lada ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="telefono" className="text-sm font-medium text-gray-700">Teléfono</label>
            <input
              id="telefono" name="telefono" type="text" maxLength={20}
              defaultValue={state.fields?.telefono ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="extension" className="text-sm font-medium text-gray-700">Extensión</label>
            <input
              id="extension" name="extension" type="text" maxLength={10}
              defaultValue={state.fields?.extension ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="genero" className="text-sm font-medium text-gray-700">
              Género <span className="text-red-500">*</span>
            </label>
            <select
              key={state.fields?.genero ?? ''}
              id="genero" name="genero" required defaultValue={state.fields?.genero ?? ''}
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
            <label htmlFor="carrera" className="text-sm font-medium text-gray-700">Carrera</label>
            <input
              id="carrera" name="carrera" type="text" maxLength={128}
              defaultValue={state.fields?.carrera ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dependencia" className="text-sm font-medium text-gray-700">Dependencia</label>
          <input
            id="dependencia" name="dependencia" type="text" maxLength={128}
            defaultValue={state.fields?.dependencia ?? ''}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </fieldset>

      {/* Datos institucionales */}
      <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">Datos Institucionales</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectCatalogo
            name="idCargo" label="Cargo" required
            options={cargosToOptions(catalogos.cargos)}
            error={state.errors?.idCargo}
            defaultValue={state.fields?.idCargo}
          />
          <SelectCatalogo
            name="idTipoUsuario" label="Tipo de participante" required
            options={tiposUsuarioToOptions(catalogos.tiposUsuario)}
            error={state.errors?.idTipoUsuario}
            defaultValue={state.fields?.idTipoUsuario}
          />
        </div>

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
      </fieldset>

      {/* Datos del depósito */}
      <fieldset className="space-y-4 rounded-lg border border-gray-200 p-4">
        <legend className="px-2 text-sm font-semibold text-gray-600">Datos del Depósito</legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="bancoSucursal" className="text-sm font-medium text-gray-700">
              Banco / Sucursal
            </label>
            <input
              id="bancoSucursal" name="bancoSucursal" type="text" maxLength={100}
              placeholder="Ej. BBVA Sucursal Centro"
              defaultValue={state.fields?.bancoSucursal ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.bancoSucursal && <p className="text-xs text-red-500">{state.errors.bancoSucursal}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
              Ciudad
            </label>
            <input
              id="ciudad" name="ciudad" type="text" maxLength={100}
              placeholder="Ej. Guadalajara"
              defaultValue={state.fields?.ciudad ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.ciudad && <p className="text-xs text-red-500">{state.errors.ciudad}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="referencia" className="text-sm font-medium text-gray-700">
            Referencia / Folio del depósito <span className="text-red-500">*</span>
          </label>
          <input
            id="referencia" name="referencia" type="text" maxLength={50} required
            placeholder="Número de referencia o folio del comprobante"
            defaultValue={state.fields?.referencia ?? ''}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state.errors?.referencia && <p className="text-xs text-red-500">{state.errors.referencia}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="monto" className="text-sm font-medium text-gray-700">
              Monto ($) <span className="text-red-500">*</span>
            </label>
            <input
              id="monto" name="monto" type="number" step="0.01" min="0.01" required
              placeholder="0.00"
              defaultValue={state.fields?.monto ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.monto && <p className="text-xs text-red-500">{state.errors.monto}</p>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="fechaDeposito" className="text-sm font-medium text-gray-700">
              Fecha del depósito <span className="text-red-500">*</span>
            </label>
            <input
              id="fechaDeposito" name="fechaDeposito" type="date" required
              defaultValue={state.fields?.fechaDeposito ?? ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.fechaDeposito && <p className="text-xs text-red-500">{state.errors.fechaDeposito}</p>}
          </div>
        </div>

        {/* Comprobante de pago (archivo) */}
        <CampoArchivo name="comprobante" error={state.errors?.comprobante} />
      </fieldset>

      {/* Facturación */}
      <SeccionFacturacion
        estados={catalogos.estados}
        errors={state.errors}
        fields={state.fields}
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isPending ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}
