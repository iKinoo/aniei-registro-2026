'use client';

import { useActionState, useState } from 'react';
import { registrarGrupoRapidoAction } from './actions';
import { FormularioDeposito, DepositoFormValues } from '@/app/registro/components/FormularioDeposito';

interface MiembroGrupo {
  nombre: string;
  apellidos: string;
}

const emptyDeposito: DepositoFormValues = {
  bancoSucursal: '', ciudad: '', referencia: '', monto: '', fechaDeposito: '', notas: '',
};

const inputCls = 'block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm';

export function GrupoRapidoForm() {
  const [state, formAction, isPending] = useActionState(registrarGrupoRapidoAction, { success: false });
  const [step, setStep] = useState(1);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([{ nombre: '', apellidos: '' }]);
  const [deposito, setDeposito] = useState<DepositoFormValues>(emptyDeposito);

  const addMiembro = () => setMiembros([...miembros, { nombre: '', apellidos: '' }]);
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

  const canGoNext = miembros.every((m) => m.nombre.trim() && m.apellidos.trim());

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

      {/* Stepper */}
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-indigo-500 transition-all duration-500"
          style={{ width: `${((step - 1) / 1) * 100}%` }}
        />
        <div className="relative flex flex-col items-center gap-2 z-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= 1 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
            1
          </div>
          <span className={`text-xs font-medium ${step === 1 ? 'text-indigo-600' : 'text-gray-400'}`}>Integrantes</span>
        </div>
        <div className="relative flex flex-col items-center gap-2 z-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= 2 ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
            2
          </div>
          <span className={`text-xs font-medium ${step === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>Pago</span>
        </div>
      </div>

      {/* Paso 1: Integrantes */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Integrantes del Grupo</h3>
            <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800 border border-blue-200">
              <p>
                <strong>Información importante:</strong> Los siguientes miembros quedarán registrados bajo tu misma <strong>Institución</strong>, <strong>Dependencia</strong> y <strong>Estado</strong>, y todos tendrán el perfil de <strong>Alumno</strong>. Estos datos no son editables para los miembros y se heredan automáticamente de tu cuenta.
              </p>
            </div>
          </div>

          <div className="flex justify-end mb-4">
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
                    name="nombres[]"
                    required
                    placeholder="Nombre(s)"
                    value={miembro.nombre}
                    onChange={(e) => updateMiembro(index, 'nombre', e.target.value)}
                    className={inputCls}
                  />
                </div>

                <div className="flex-1">
                  <input
                    type="text"
                    name="apellidos[]"
                    required
                    placeholder="Apellidos"
                    value={miembro.apellidos}
                    onChange={(e) => updateMiembro(index, 'apellidos', e.target.value)}
                    className={inputCls}
                  />
                </div>

                {miembros.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMiembro(index)}
                    className="text-red-500 hover:text-red-700 px-3 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canGoNext}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              Continuar al pago →
            </button>
          </div>
        </div>
      )}

      {/* Paso 2: Pago */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Datos del depósito / transferencia</h3>
            <FormularioDeposito
              variant="light"
              values={deposito}
              onChange={(field, val) => setDeposito((prev) => ({ ...prev, [field]: val }))}
              errors={state.errors}
              showFileUpload
              fileInputName="archivo"
              fileError={state.errors?.archivo}
            />
          </div>

          <div className="flex justify-between pt-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium"
            >
              ← Atrás
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 text-sm"
            >
              {isPending ? 'Procesando...' : 'Realizar Registro Grupal'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
