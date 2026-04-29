'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';
import { registrarUsuarioAction, RegistroActionState } from '../actions/registrar-usuario.action';
import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';
import { StepDatosGenerales } from './steps/StepDatosGenerales';
import { StepActividades } from './steps/StepActividades';
import { StepGrupo } from './steps/StepGrupo';
import { StepCheckout } from './steps/StepCheckout';
import { StepFacturacion } from './steps/StepFacturacion';

const COSTO_BASE = 2000;

export interface MiembroWizard {
  nombre: string;
  apellido: string;
}

export interface DatosGeneralesWizard {
  nombre: string;
  apellido: string;
  correo: string;
  lada: string;
  telefono: string;
  extension: string;
  genero: string;
  carrera: string;
  dependencia: string;
  idCargo: string;
  idTipoUsuario: string;
  idInstitucion: string;
  idEntidadFederativa: string;
}

interface RegistroFormProps {
  catalogos: {
    cargos: Cargo[];
    estados: Estado[];
    instituciones: Institucion[];
    tiposUsuario: TipoUsuario[];
  };
  actividades: ActividadDTO[];
}

const STEPS = [
  { id: 1, label: 'Datos Generales', icon: '👤' },
  { id: 2, label: 'Actividades', icon: '🎯' },
  { id: 3, label: 'Grupo', icon: '👥' },
  { id: 4, label: 'Checkout', icon: '💳' },
  { id: 5, label: 'Facturación', icon: '🧾' },
];

const initialState: RegistroActionState = { success: false };

const emptyDatos: DatosGeneralesWizard = {
  nombre: '', apellido: '', correo: '', lada: '', telefono: '',
  extension: '', genero: '', carrera: '', dependencia: '',
  idCargo: '', idTipoUsuario: '', idInstitucion: '', idEntidadFederativa: '',
};

export function RegistroForm({ catalogos, actividades }: RegistroFormProps) {
  const [state, formAction, isPending] = useActionState(registrarUsuarioAction, initialState);
  const [step, setStep] = useState(1);
  const [datos, setDatos] = useState<DatosGeneralesWizard>(emptyDatos);
  const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState<ActividadDTO[]>([]);
  const [grupoActivo, setGrupoActivo] = useState(false);
  const [miembros, setMiembros] = useState<MiembroWizard[]>([]);

  const totalActividades = actividadesSeleccionadas.reduce((s, a) => s + (a.costo ?? 0), 0);
  const nMiembros = grupoActivo ? miembros.length : 0;
  const total = COSTO_BASE * (1 + nMiembros) + totalActividades;

  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-400/30 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
            <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">¡Registro exitoso!</h2>
            <p className="text-slate-300">Tu folio de registro es:</p>
            <p className="text-2xl font-mono font-bold text-indigo-300 mt-1 bg-white/5 rounded-xl px-4 py-2 inline-block border border-white/10">
              {state.folio}
            </p>
          </div>
          <p className="text-sm text-slate-400 bg-white/5 rounded-xl px-5 py-4 border border-white/10 text-left">
            📬 Revisa tu correo <strong className="text-white">{state.correo}</strong> — ahí encontrarás tu contraseña de acceso y la confirmación de registro.
          </p>
          <a
            href="/perfil"
            className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-900/40 transition-all hover:shadow-xl active:scale-95"
          >
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
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          <span className="text-indigo-300 text-sm font-medium">Congreso ANIEI 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Registro de participantes
        </h1>
        <p className="text-slate-400 mt-2 text-base">Completa los pasos para inscribirte al congreso</p>
      </div>

      {/* Progress stepper */}
      <div className="max-w-3xl mx-auto px-4 mb-8">
        <div className="flex items-center justify-between relative">
          {/* connector line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-white/10" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-indigo-500 transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((s) => {
            const done = step > s.id;
            const active = step === s.id;
            return (
              <div key={s.id} className="relative flex flex-col items-center gap-2 z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                    done
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50'
                      : active
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-900/50 scale-110'
                      : 'bg-slate-900 border-white/10 text-slate-500'
                  }`}
                >
                  {done ? '✓' : s.icon}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${active ? 'text-indigo-300' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Total indicator */}
        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-3 mb-6 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 text-sm">Total estimado</span>
            {actividadesSeleccionadas.length > 0 && (
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full px-2 py-0.5">
                +{actividadesSeleccionadas.length} actividad{actividadesSeleccionadas.length > 1 ? 'es' : ''}
              </span>
            )}
            {nMiembros > 0 && (
              <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded-full px-2 py-0.5">
                +{nMiembros} miembro{nMiembros > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <span className="text-xl font-bold text-white">
            ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            <span className="text-xs font-normal text-slate-400 ml-1">MXN</span>
          </span>
        </div>

        <form action={formAction} className="space-y-0">
          {/* Hidden fields for all wizard data */}
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
          {/* Activities */}
          <input type="hidden" name="actividadesIds" value={actividadesSeleccionadas.map((a) => a.idActividad).join(',')} />
          {/* Group members */}
          <input type="hidden" name="numMiembros" value={grupoActivo ? miembros.length : 0} />
          {grupoActivo && miembros.map((m, i) => (
            <span key={i}>
              <input type="hidden" name={`miembro_${i}_nombre`} value={m.nombre} />
              <input type="hidden" name={`miembro_${i}_apellido`} value={m.apellido} />
            </span>
          ))}

          {/* Step panels */}
          <div className={step === 1 ? 'block' : 'hidden'}>
            <StepDatosGenerales
              catalogos={catalogos}
              datos={datos}
              errors={state.errors}
              onChange={setDatos}
              onNext={() => setStep(2)}
            />
          </div>
          <div className={step === 2 ? 'block' : 'hidden'}>
            <StepActividades
              actividades={actividades}
              seleccionadas={actividadesSeleccionadas}
              onToggle={(a) => {
                setActividadesSeleccionadas((prev) =>
                  prev.find((s) => s.idActividad === a.idActividad)
                    ? prev.filter((s) => s.idActividad !== a.idActividad)
                    : [...prev, a],
                );
              }}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          </div>
          <div className={step === 3 ? 'block' : 'hidden'}>
            <StepGrupo
              grupoActivo={grupoActivo}
              miembros={miembros}
              onToggleGrupo={() => {
                setGrupoActivo((v) => !v);
                if (grupoActivo) setMiembros([]);
              }}
              onMiembrosChange={setMiembros}
              onBack={() => setStep(2)}
              onNext={() => setStep(4)}
            />
          </div>
          <div className={step === 4 ? 'block' : 'hidden'}>
            <StepCheckout
              total={total}
              desglose={{
                base: COSTO_BASE,
                nMiembros,
                actividades: actividadesSeleccionadas,
              }}
              errors={state.errors}
              onBack={() => setStep(3)}
              onNext={() => setStep(5)}
            />
          </div>
          <div className={step === 5 ? 'block' : 'hidden'}>
            <StepFacturacion
              estados={catalogos.estados}
              errors={state.errors}
              fields={state.fields}
              isPending={isPending}
              onBack={() => setStep(4)}
            />
          </div>

          {/* Global form error */}
          {state.errors?._form && (
            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300">
              {state.errors._form}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
