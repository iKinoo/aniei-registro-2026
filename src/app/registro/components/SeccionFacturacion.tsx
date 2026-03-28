'use client';

import { useState } from 'react';
import { SelectCatalogo, estadosToOptions } from './SelectCatalogo';
import { Estado } from '@/shared/types/catalogos';

interface SeccionFacturacionProps {
  estados: Estado[];
  errors?: Record<string, string>;
}

export function SeccionFacturacion({ estados, errors }: SeccionFacturacionProps) {
  const [activa, setActiva] = useState(false);

  return (
    <fieldset className="rounded-lg border border-gray-200 overflow-hidden">
      {/* Encabezado con toggle */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div>
          <legend className="text-sm font-semibold text-gray-700">Facturación</legend>
          <p className="text-xs text-gray-500 mt-0.5">
            {activa ? 'Ingrese sus datos fiscales para emitir factura' : 'Activar para agregar datos de facturación'}
          </p>
        </div>

        {/* Switch toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={activa}
          aria-label="Activar facturación"
          onClick={() => setActiva((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            activa ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              activa ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Campo oculto para indicar si hay facturación */}
      <input type="hidden" name="requiereFacturacion" value={activa ? 'true' : 'false'} />

      {/* Formulario de facturación (visible solo si está activo) */}
      {activa && (
        <div className="space-y-4 p-4">
          {/* Razón social y RFC */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="razonSocial" className="text-sm font-medium text-gray-700">
                Razón social <span className="text-red-500">*</span>
              </label>
              <input
                id="razonSocial"
                name="razonSocial"
                type="text"
                maxLength={150}
                placeholder="Nombre o razón social"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors?.['facturacion.razonSocial'] && (
                <p className="text-xs text-red-500">{errors['facturacion.razonSocial']}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="rfc" className="text-sm font-medium text-gray-700">
                RFC <span className="text-red-500">*</span>
              </label>
              <input
                id="rfc"
                name="rfc"
                type="text"
                maxLength={20}
                placeholder="XAXX010101000"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm uppercase focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{ textTransform: 'uppercase' }}
              />
              {errors?.['facturacion.rfc'] && (
                <p className="text-xs text-red-500">{errors['facturacion.rfc']}</p>
              )}
            </div>
          </div>

          {/* Dirección fiscal */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label htmlFor="calle" className="text-sm font-medium text-gray-700">Calle</label>
              <input
                id="calle"
                name="calle"
                type="text"
                maxLength={100}
                placeholder="Nombre de la calle"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="numExterior" className="text-sm font-medium text-gray-700">Núm. exterior</label>
              <input
                id="numExterior"
                name="numExterior"
                type="text"
                maxLength={20}
                placeholder="123"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="numInterior" className="text-sm font-medium text-gray-700">Núm. interior</label>
              <input
                id="numInterior"
                name="numInterior"
                type="text"
                maxLength={20}
                placeholder="Depto. / Piso"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="colonia" className="text-sm font-medium text-gray-700">Colonia</label>
              <input
                id="colonia"
                name="colonia"
                type="text"
                maxLength={100}
                placeholder="Colonia"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="codigoPostal" className="text-sm font-medium text-gray-700">Código postal</label>
              <input
                id="codigoPostal"
                name="codigoPostal"
                type="text"
                maxLength={10}
                placeholder="00000"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="municipio" className="text-sm font-medium text-gray-700">Municipio / Alcaldía</label>
              <input
                id="municipio"
                name="municipio"
                type="text"
                maxLength={100}
                placeholder="Municipio o alcaldía"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <SelectCatalogo
              name="idEntidadFederativaRfc"
              label="Estado (domicilio fiscal)"
              options={estadosToOptions(estados)}
              error={errors?.['facturacion.idEntidadFederativaRfc']}
            />
          </div>
        </div>
      )}
    </fieldset>
  );
}
