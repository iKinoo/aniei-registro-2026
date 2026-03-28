'use client';

import { useActionState } from 'react';
import { registrarUsuarioAction, RegistroActionState } from '../actions/registrar-usuario.action';
import { SelectCatalogo, cargosToOptions, estadosToOptions, institucionesToOptions, tiposUsuarioToOptions } from './SelectCatalogo';
import { CampoArchivo } from './CampoArchivo';
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
      <div className="rounded-lg bg-green-50 p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold text-green-800">¡Registro exitoso!</h2>
        <p className="text-green-700">
          Su folio de registro es: <strong className="text-lg">{state.folio}</strong>
        </p>
        <p className="mt-2 text-sm text-green-600">
          Se ha enviado un correo de confirmación a <strong>{state.correo}</strong>
        </p>
        <a
          href={`/confirmacion?folio=${state.folio}`}
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
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {state.errors?.correo && <p className="text-xs text-red-500">{state.errors.correo}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="lada" className="text-sm font-medium text-gray-700">Lada</label>
            <input
              id="lada" name="lada" type="text" maxLength={10}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="telefono" className="text-sm font-medium text-gray-700">Teléfono</label>
            <input
              id="telefono" name="telefono" type="text" maxLength={20}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="extension" className="text-sm font-medium text-gray-700">Extensión</label>
            <input
              id="extension" name="extension" type="text" maxLength={10}
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
              id="genero" name="genero" required defaultValue=""
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
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="dependencia" className="text-sm font-medium text-gray-700">Dependencia</label>
          <input
            id="dependencia" name="dependencia" type="text" maxLength={128}
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
          />
          <SelectCatalogo
            name="idTipoUsuario" label="Tipo de participante" required
            options={tiposUsuarioToOptions(catalogos.tiposUsuario)}
            error={state.errors?.idTipoUsuario}
          />
        </div>

        <SelectCatalogo
          name="idInstitucion" label="Institución" required
          options={institucionesToOptions(catalogos.instituciones)}
          error={state.errors?.idInstitucion}
        />

        <SelectCatalogo
          name="idEntidadFederativa" label="Estado" required
          options={estadosToOptions(catalogos.estados)}
          error={state.errors?.idEntidadFederativa}
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
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {state.errors?.fechaDeposito && <p className="text-xs text-red-500">{state.errors.fechaDeposito}</p>}
          </div>
        </div>

        {/* Comprobante de pago (archivo) */}
        <CampoArchivo name="comprobante" error={state.errors?.comprobante} />
      </fieldset>

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
