'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { registrarUsuarioAction, RegistroActionState } from '../actions/registrar-usuario.action';
import { Titulo, Estado, Institucion, PrecioInscripcion } from '@/shared/types/catalogos';
import { StepDatosGenerales } from './steps/StepDatosGenerales';
import { StepGrupo } from './steps/StepGrupo';
import { StepPago } from './steps/StepPago';

export interface MiembroWizard { nombre: string; apellido: string; }

export interface DatosGeneralesWizard {
  nombre: string; apellido: string; correo: string;
  lada: string; telefono: string; extension: string;
  genero: string; carrera: string; dependencia: string;
  idTitulo: string; idInstitucion: string; idEntidadFederativa: string;
}

export interface DepositoWizard {
  bancoSucursal: string; ciudad: string;
  referencia: string; monto: string; fechaDeposito: string;
  notas: string;
}

export interface FacturacionWizard {
  activa: boolean; razonSocial: string; rfc: string;
  calle: string; numExterior: string; numInterior: string;
  colonia: string; municipio: string; codigoPostal: string; idEntidadFederativaRfc: string;
}

interface RegistroFormProps {
  catalogos: { titulos: Titulo[]; estados: Estado[]; instituciones: Institucion[] };
  precios: PrecioInscripcion[];
  precioVigente: PrecioInscripcion | null;
}

const STEPS = [
  { id: 1, label: 'Datos Generales', icon: '👤' },
  { id: 2, label: 'Grupo',           icon: '👥' },
  { id: 3, label: 'Pago',            icon: '💳' },
];

const emptyDatos: DatosGeneralesWizard = {
  nombre: '', apellido: '', correo: '', lada: '', telefono: '',
  extension: '', genero: '', carrera: '', dependencia: '',
  idTitulo: '', idInstitucion: '', idEntidadFederativa: '',
};

const emptyDeposito: DepositoWizard = {
  bancoSucursal: '', ciudad: '', referencia: '', monto: '', fechaDeposito: '', notas: '',
};

const emptyFacturacion: FacturacionWizard = {
  activa: false, razonSocial: '', rfc: '', calle: '', numExterior: '',
  numInterior: '', colonia: '', municipio: '', codigoPostal: '', idEntidadFederativaRfc: '',
};

const initialState: RegistroActionState = { success: false };

function formatMXN(amount: number) {
  return amount.toLocaleString('es-MX', { minimumFractionDigits: 2 });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function RegistroForm({ catalogos, precios, precioVigente }: RegistroFormProps) {
  const [state, formAction, isPending] = useActionState(registrarUsuarioAction, initialState);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [datos, setDatos] = useState<DatosGeneralesWizard>(emptyDatos);
  const [grupoActivo, setGrupoActivo] = useState(false);
  const [miembros, setMiembros] = useState<MiembroWizard[]>([]);
  const [deposito, setDeposito] = useState<DepositoWizard>(emptyDeposito);
  const [facturacion, setFacturacion] = useState<FacturacionWizard>(emptyFacturacion);
  const [montoTouched, setMontoTouched] = useState(false);

  const costoBase = precioVigente?.costo ?? 0;
  const costoMiembro = precioVigente?.costoMiembro ?? 0;
  const nMiembros = grupoActivo ? miembros.length : 0;
  const total = costoBase + costoMiembro * nMiembros;

  const preciosFuturos = precios
    .filter((p) => p.activo && new Date(p.fechaLimite) > new Date())
    .sort((a, b) => new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime());

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
          <div className="flex flex-col gap-3">
            <a href="/actividades" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95">
              Seleccionar actividades
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <a href="/perfil" className="inline-flex items-center justify-center gap-2 px-8 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold rounded-xl transition-all active:scale-95">
              Ir a mi perfil
            </a>
          </div>
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

      {/* Price info banner */}
      <div className="max-w-2xl mx-auto px-4 mb-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-semibold text-amber-800">Información de costos de inscripción</span>
          </div>

          {precioVigente ? (
            <div className="grid gap-2 text-sm">
              <div className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2 border border-amber-100">
                <span className="text-slate-600">Costo actual (desde {formatDate(precioVigente.fechaLimite)})</span>
                <span className="font-bold text-slate-900">${formatMXN(precioVigente.costo)} MXN</span>
              </div>
              {precioVigente.costoMiembro > 0 && (
                <div className="flex items-center justify-between px-3">
                  <span className="text-slate-500 text-xs">Costo adicional por miembro de grupo</span>
                  <span className="font-medium text-slate-700 text-xs">${formatMXN(precioVigente.costoMiembro)} MXN</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-amber-700">No hay un precio vigente configurado.</p>
          )}

          {preciosFuturos.length > 0 && (
            <div className="border-t border-amber-200 pt-3">
              <p className="text-xs font-medium text-amber-700 mb-2">Próximos cambios de precio:</p>
              <div className="space-y-1.5">
                {preciosFuturos.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-xs px-1">
                    <span className="text-slate-500">A partir del {formatDate(p.fechaLimite)}</span>
                    <span className="font-semibold text-slate-700">${formatMXN(p.costo)} MXN</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress stepper */}
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
          <input type="hidden" name="nombre" value={datos.nombre} />
          <input type="hidden" name="apellido" value={datos.apellido} />
          <input type="hidden" name="correo" value={datos.correo} />
          <input type="hidden" name="lada" value={datos.lada} />
          <input type="hidden" name="telefono" value={datos.telefono} />
          <input type="hidden" name="extension" value={datos.extension} />
          <input type="hidden" name="genero" value={datos.genero} />
          <input type="hidden" name="carrera" value={datos.carrera} />
          <input type="hidden" name="dependencia" value={datos.dependencia} />
          <input type="hidden" name="idTitulo" value={datos.idTitulo} />
          <input type="hidden" name="idInstitucion" value={datos.idInstitucion} />
          <input type="hidden" name="idEntidadFederativa" value={datos.idEntidadFederativa} />
          <input type="hidden" name="numMiembros" value={grupoActivo ? miembros.length : 0} />
          {grupoActivo && miembros.map((m, i) => (
            <span key={i}>
              <input type="hidden" name={`miembro_${i}_nombre`} value={m.nombre} />
              <input type="hidden" name={`miembro_${i}_apellido`} value={m.apellido} />
            </span>
          ))}
          <input type="hidden" name="requiereFacturacion" value={facturacion.activa ? 'true' : 'false'} />

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
            <StepGrupo
              grupoActivo={grupoActivo}
              miembros={miembros}
              costoMiembro={costoMiembro}
              onToggleGrupo={() => { setGrupoActivo((v) => !v); if (grupoActivo) setMiembros([]); }}
              onMiembrosChange={setMiembros}
              onBack={() => goTo(1)}
              onNext={() => goTo(3)}
            />
          </div>
          <div className={step === 3 ? 'block' : 'hidden'}>
            <StepPago
              total={total}
              desglose={{ base: costoBase, nMiembros, costoMiembro }}
              deposito={deposito}
              facturacion={facturacion}
              estados={catalogos.estados}
              errors={state.errors}
              isPending={isPending}
              onDepositoChange={(d) => setDeposito(d)}
              onMontoTouch={() => setMontoTouched(true)}
              onFacturacionChange={(f) => setFacturacion(f)}
              onBack={() => goTo(2)}
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
