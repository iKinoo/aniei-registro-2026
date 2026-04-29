'use client';

import { useState, useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';
import { registrarUsuarioAction, RegistroActionState } from '../actions/registrar-usuario.action';
import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';
import { StepDatosGenerales } from './steps/StepDatosGenerales';
import { StepActividades } from './steps/StepActividades';
import { StepGrupo } from './steps/StepGrupo';
import { StepPago } from './steps/StepPago';

const COSTO_BASE = 2000;

export interface MiembroWizard { nombre: string; apellido: string; }

export interface DatosGeneralesWizard {
  nombre: string; apellido: string; correo: string;
  lada: string; telefono: string; extension: string;
  genero: string; carrera: string; dependencia: string;
  idCargo: string; idTipoUsuario: string; idInstitucion: string; idEntidadFederativa: string;
}

export interface DepositoWizard {
  bancoSucursal: string; ciudad: string;
  referencia: string; monto: string; fechaDeposito: string;
}

export interface FacturacionWizard {
  activa: boolean; razonSocial: string; rfc: string;
  calle: string; numExterior: string; numInterior: string;
  colonia: string; municipio: string; codigoPostal: string; idEntidadFederativaRfc: string;
}

interface RegistroFormProps {
  catalogos: { cargos: Cargo[]; estados: Estado[]; instituciones: Institucion[]; tiposUsuario: TipoUsuario[] };
  actividades: ActividadDTO[];
}

const STEPS = [
  { id: 1, label: 'Datos Generales', icon: '👤' },
  { id: 2, label: 'Actividades',     icon: '🎯' },
  { id: 3, label: 'Grupo',           icon: '👥' },
  { id: 4, label: 'Pago',            icon: '💳' },
];

const emptyDatos: DatosGeneralesWizard = {
  nombre: '', apellido: '', correo: '', lada: '', telefono: '',
  extension: '', genero: '', carrera: '', dependencia: '',
  idCargo: '', idTipoUsuario: '', idInstitucion: '', idEntidadFederativa: '',
};

const emptyDeposito: DepositoWizard = {
  bancoSucursal: '', ciudad: '', referencia: '', monto: '', fechaDeposito: '',
};

const emptyFacturacion: FacturacionWizard = {
  activa: false, razonSocial: '', rfc: '', calle: '', numExterior: '',
  numInterior: '', colonia: '', municipio: '', codigoPostal: '', idEntidadFederativaRfc: '',
};

const initialState: RegistroActionState = { success: false };

export function RegistroForm({ catalogos, actividades }: RegistroFormProps) {
  const [state, formAction, isPending] = useActionState(registrarUsuarioAction, initialState);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1); // highest step reached
  const [datos, setDatos] = useState<DatosGeneralesWizard>(emptyDatos);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<ActividadDTO[]>([]);
  const [grupoActivo, setGrupoActivo] = useState(false);
  const [miembros, setMiembros] = useState<MiembroWizard[]>([]);
  const [deposito, setDeposito] = useState<DepositoWizard>(emptyDeposito);
  const [facturacion, setFacturacion] = useState<FacturacionWizard>(emptyFacturacion);
  const [montoTouched, setMontoTouched] = useState(false);

  const totalActividades = actividadesSeleccionadas.reduce((s, a) => s + (a.costo ?? 0), 0);
  const nMiembros = grupoActivo ? miembros.length : 0;
  const total = COSTO_BASE * (1 + nMiembros) + totalActividades;

  // Auto-sync monto when total changes (unless user manually edited it)
  useEffect(() => {
    if (!montoTouched) {
      setDeposito((prev) => ({ ...prev, monto: total.toFixed(2) }));
    }
  }, [total, montoTouched]);

  function goTo(n: number) {
    setStep(n);
    setMaxStep((prev) => Math.max(prev, n));
  }

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6 bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
          <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Registro exitoso!</h2>
            <p className="text-slate-500">Tu folio de registro es:</p>
            <p className="text-2xl font-mono font-bold text-indigo-600 mt-1 bg-indigo-50 rounded-xl px-4 py-2 inline-block border border-indigo-100">
              {state.folio}
            </p>
          </div>
          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-5 py-4 border border-slate-200 text-left">
            📬 Revisa tu correo <strong className="text-slate-800">{state.correo}</strong> — ahí encontrarás tu contraseña de acceso y la confirmación de registro.
          </p>
          <a href="/perfil" className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95">
            Ir a mi perfil
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="pt-10 pb-6 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 bg-indigo-500 rounded-full" />
          <span className="text-indigo-600 text-sm font-medium">Congreso ANIEI 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Registro de participantes
        </h1>
        <p className="text-slate-500 mt-2 text-base">Completa los pasos para inscribirte al congreso</p>
      </div>

      {/* Progress stepper — icons are clickable to go back */}
      <div className="max-w-2xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-indigo-500 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            const clickable = s.id < step;
            return (
              <div key={s.id} className="relative flex flex-col items-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => clickable && goTo(s.id)}
                  title={clickable ? `Volver a ${s.label}` : s.label}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 focus:outline-none
                    ${done ? 'bg-emerald-50 border-emerald-300 text-emerald-600 hover:bg-emerald-100 cursor-pointer' :
                      active ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200 scale-110' :
                      'bg-white border-slate-200 text-slate-400 cursor-default'}`}
                >
                  {done ? '✓' : s.icon}
                </button>
                <span className={`text-xs font-medium hidden sm:block ${active ? 'text-indigo-600' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total indicator */}
      <div className="max-w-2xl mx-auto px-4 mb-4">
        <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-xl px-5 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 text-sm">Total estimado</span>
            {actividadesSeleccionadas.length > 0 && (
              <span className="text-xs bg-indigo-100 text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5">
                +{actividadesSeleccionadas.length} actividad{actividadesSeleccionadas.length > 1 ? 'es' : ''}
              </span>
            )}
            {nMiembros > 0 && (
              <span className="text-xs bg-violet-100 text-violet-600 border border-violet-200 rounded-full px-2 py-0.5">
                +{nMiembros} miembro{nMiembros > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="text-xl font-bold text-indigo-700">
            ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-400 ml-1">MXN</span>
          </span>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <form action={formAction}>
          {/* All hidden fields carrying wizard state to server action */}
          <input type="hidden" name="nombre" value={datos.nombre} />
          <input type="hidden" name="apellido" value={datos.apellido} />
          <input type="hidden" name="correo" value={datos.correo} />
          <input type="hidden" name="lada" value={datos.lada} />
          <input type="hidden" name="telefono" value={datos.telefono} />
          <input type="hidden" name="extension" value={datos.extension} />
          <input type="hidden" name="genero" value={datos.genero} />
          <input type="hidden" name="carrera" value={datos.carrera} />
          <input type="hidden" name="dependencia" value={datos.dependencia} />
          <input type="hidden" name="idCargo" value={datos.idCargo} />
          <input type="hidden" name="idTipoUsuario" value={datos.idTipoUsuario} />
          <input type="hidden" name="idInstitucion" value={datos.idInstitucion} />
          <input type="hidden" name="idEntidadFederativa" value={datos.idEntidadFederativa} />
          {/* Deposito hidden (StepPago renders real inputs directly) */}
          <input type="hidden" name="actividadesIds" value={actividadesSeleccionadas.map((a) => a.idActividad).join(',')} />
          <input type="hidden" name="numMiembros" value={grupoActivo ? miembros.length : 0} />
          {grupoActivo && miembros.map((m, i) => (
            <span key={i}>
              <input type="hidden" name={`miembro_${i}_nombre`} value={m.nombre} />
              <input type="hidden" name={`miembro_${i}_apellido`} value={m.apellido} />
            </span>
          ))}
          <input type="hidden" name="requiereFacturacion" value={facturacion.activa ? 'true' : 'false'} />

          {/* Step panels — always mounted, shown/hidden with CSS */}
          <div className={step === 1 ? 'block' : 'hidden'}>
            <StepDatosGenerales
              catalogos={catalogos}
              datos={datos}
              errors={state.errors}
              onChange={setDatos}
              onNext={() => goTo(2)}
            />
          </div>
          <div className={step === 2 ? 'block' : 'hidden'}>
            <StepActividades
              actividades={actividades}
              seleccionadas={actividadesSeleccionadas}
              onToggle={(a) =>
                setActividadesSeleccionadas((prev) =>
                  prev.find((s) => s.idActividad === a.idActividad)
                    ? prev.filter((s) => s.idActividad !== a.idActividad)
                    : [...prev, a],
                )
              }
              onBack={() => goTo(1)}
              onNext={() => goTo(3)}
            />
          </div>
          <div className={step === 3 ? 'block' : 'hidden'}>
            <StepGrupo
              grupoActivo={grupoActivo}
              miembros={miembros}
              onToggleGrupo={() => { setGrupoActivo((v) => !v); if (grupoActivo) setMiembros([]); }}
              onMiembrosChange={setMiembros}
              onBack={() => goTo(2)}
              onNext={() => goTo(4)}
            />
          </div>
          <div className={step === 4 ? 'block' : 'hidden'}>
            <StepPago
              total={total}
              desglose={{ base: COSTO_BASE, nMiembros, actividades: actividadesSeleccionadas }}
              deposito={deposito}
              facturacion={facturacion}
              estados={catalogos.estados}
              errors={state.errors}
              isPending={isPending}
              onDepositoChange={(d) => setDeposito(d)}
              onMontoTouch={() => setMontoTouched(true)}
              onFacturacionChange={(f) => setFacturacion(f)}
              onBack={() => goTo(3)}
            />
          </div>

          {state.errors?._form && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {state.errors._form}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
