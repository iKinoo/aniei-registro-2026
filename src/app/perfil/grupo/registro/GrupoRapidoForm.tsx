'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { registrarGrupoRapidoAction, GrupoRapidoActionState } from './actions';
import { Titulo, Estado, Institucion, PrecioInscripcion, TipoParticipante } from '@/shared/types/catalogos';
import { MiembroWizard, DepositoWizard, FacturacionWizard } from '@/app/registro/components/RegistroForm';
import { StepGrupo } from '@/app/registro/components/steps/StepGrupo';
import { StepPago } from '@/app/registro/components/steps/StepPago';
import { FormularioDeposito, DepositoFormValues } from '@/app/registro/components/FormularioDeposito';

interface ResponsableData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  lada: string | null;
  extension: string | null;
  genero: string | null;
  carrera: string | null;
  dependencia: string | null;
  id_titulo: number | null;
  id_tipo_participante: number | null;
  id_institucion: number | null;
  id_entidad_federativa: number | null;
}

interface GrupoRapidoFormProps {
  responsable: ResponsableData;
  catalogos: { titulos: Titulo[]; estados: Estado[]; instituciones: Institucion[] };
  precios: PrecioInscripcion[];
  tiposParticipante: TipoParticipante[];
}

const STEPS = [
  { id: 1, label: 'Responsable', icon: '👤' },
  { id: 2, label: 'Integrantes', icon: '👥' },
  { id: 3, label: 'Pago', icon: '💳' },
];

const emptyDeposito: DepositoWizard = {
  bancoSucursal: '',
  ciudad: '',
  referencia: '',
  monto: '',
  fechaDeposito: '',
  notas: '',
};

const emptyFacturacion: FacturacionWizard = {
  activa: false, razonSocial: '', rfc: '', calle: '', numExterior: '',
  numInterior: '', colonia: '', municipio: '', codigoPostal: '', idEntidadFederativaRfc: '',
};

const initialState: GrupoRapidoActionState = { success: false };

function formatMXN(amount: number) {
  return amount.toLocaleString('es-MX', { minimumFractionDigits: 2 });
}

function obtenerPrecioVigente(
  idTipoParticipante: number,
  esAfiliada: boolean,
  precios: PrecioInscripcion[]
): PrecioInscripcion | null {
  const ahora = new Date();
  const preciosFiltrados = precios
    .filter((p) =>
      p.idTipoParticipante === idTipoParticipante &&
      p.esAfiliada === esAfiliada &&
      p.activo &&
      new Date(p.fechaLimite) <= ahora
    )
    .sort((a, b) => new Date(b.fechaLimite).getTime() - new Date(a.fechaLimite).getTime());
  return preciosFiltrados.length > 0 ? preciosFiltrados[0] : null;
}

export function GrupoRapidoForm({
  responsable,
  catalogos,
  precios,
  tiposParticipante,
}: GrupoRapidoFormProps) {
  const [state, formAction, isPending] = useActionState(registrarGrupoRapidoAction, initialState);
  const [step, setStep] = useState(1);
  const [grupoActivo, setGrupoActivo] = useState(false);
  const [miembros, setMiembros] = useState<MiembroWizard[]>([]);
  const [deposito, setDeposito] = useState<DepositoWizard>(emptyDeposito);
  const [facturacion, setFacturacion] = useState<FacturacionWizard>(emptyFacturacion);
  const [montoTouched, setMontoTouched] = useState(false);

  const idTipoParticipante = responsable.id_tipo_participante ?? 0;
  const esAfiliada = !!responsable.id_institucion;

  const precioResponsable = idTipoParticipante > 0
    ? obtenerPrecioVigente(idTipoParticipante, esAfiliada, precios)
    : null;

  const costoBase = precioResponsable?.costo ?? 0;
  const nMiembros = grupoActivo ? miembros.length : 0;

  const costoMiembros = miembros.reduce((sum, m) => {
    const precioMiembro = obtenerPrecioVigente(m.idTipoParticipante, esAfiliada, precios);
    return sum + (precioMiembro?.costo ?? 0);
  }, 0);

  const total = costoBase + costoMiembros;

  useEffect(() => {
    if (!montoTouched) {
      setDeposito((prev) => ({ ...prev, monto: total.toFixed(2) }));
    }
  }, [total, montoTouched]);

  useEffect(() => {
    if (!state.success && state.fields) {
      const f = state.fields;
      setDeposito({
        bancoSucursal: f.bancoSucursal ?? '',
        ciudad: f.ciudad ?? '',
        referencia: f.referencia ?? '',
        monto: f.monto ?? '',
        fechaDeposito: f.fechaDeposito ?? '',
        notas: f.notas ?? '',
      });
      if (state.errors) {
        const errKeys = Object.keys(state.errors).join(',');
        if (errKeys.includes('bancoSucursal') || errKeys.includes('ciudad') || errKeys.includes('referencia') || errKeys.includes('monto') || errKeys.includes('fechaDeposito') || errKeys.includes('archivo')) {
          setStep(3);
        } else {
          setStep(1);
        }
      }
    }
  }, [state]);

  function goTo(n: number) {
    setStep(n);
  }

  const getInstitucionNombre = () => {
    const inst = catalogos.instituciones.find((i) => i.idInstitucion === responsable.id_institucion);
    return inst?.nombre || '—';
  };

  const getEstadoNombre = () => {
    const est = catalogos.estados.find((e) => e.idEntidadFederativa === responsable.id_entidad_federativa);
    return est?.nombre || '—';
  };

  const getTituloNombre = () => {
    const tit = catalogos.titulos.find((t) => t.idTitulo === responsable.id_titulo);
    return tit?.descripcion || '—';
  };

  const getTipoParticipanteNombre = () => {
    const tipo = tiposParticipante.find((t) => t.idTipoParticipante === responsable.id_tipo_participante);
    return tipo?.descripcion || '—';
  };

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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Grupo Registrado!</h2>
            <p className="text-slate-500">Se registraron {state.totalRegistrados} miembros</p>
          </div>
          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-5 py-4 border border-slate-200 text-left">
            📬 Se ha enviado una confirmación a tu correo con los detalles del grupo registrado.
          </p>
          <div className="flex flex-col gap-3">
            <a href="/perfil" className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95">
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
          Registro Grupal
        </h1>
        <p className="text-slate-500 mt-2 text-base">Registra a los miembros de tu grupo</p>
      </div>

      {/* Sticky stepper + total */}
      <div className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-sm py-4 shadow-sm">
        {/* Progress stepper */}
        <div className="max-w-2xl mx-auto px-4 mb-4">
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
        <div className="max-w-2xl mx-auto px-4">
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
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-16 pt-4">
        <form action={formAction}>
          {/* Hidden fields for responsable data */}
          <input type="hidden" name="responsableNombre" value={responsable.nombre} />
          <input type="hidden" name="responsableApellido" value={responsable.apellido} />
          <input type="hidden" name="responsableCorreo" value={responsable.correo} />
          <input type="hidden" name="responsableTelefono" value={responsable.telefono ?? ''} />
          <input type="hidden" name="responsableLada" value={responsable.lada ?? ''} />
          <input type="hidden" name="responsableExtension" value={responsable.extension ?? ''} />
          <input type="hidden" name="responsableGenero" value={responsable.genero ?? ''} />
          <input type="hidden" name="responsableCarrera" value={responsable.carrera ?? ''} />
          <input type="hidden" name="responsableDependencia" value={responsable.dependencia ?? ''} />
          <input type="hidden" name="responsableIdTitulo" value={responsable.id_titulo?.toString() ?? ''} />
          <input type="hidden" name="responsableIdTipoParticipante" value={responsable.id_tipo_participante?.toString() ?? ''} />
          <input type="hidden" name="responsableIdInstitucion" value={responsable.id_institucion?.toString() ?? ''} />
          <input type="hidden" name="responsableIdEntidadFederativa" value={responsable.id_entidad_federativa?.toString() ?? ''} />

          <input type="hidden" name="grupoActivo" value={grupoActivo ? 'true' : 'false'} />
          <input type="hidden" name="numMiembros" value={miembros.length} />
          {miembros.map((m, i) => (
            <span key={i}>
              <input type="hidden" name={`miembro_${i}_nombre`} value={m.nombre} />
              <input type="hidden" name={`miembro_${i}_apellido`} value={m.apellido} />
              <input type="hidden" name={`miembro_${i}_correo`} value={m.correo} />
              <input type="hidden" name={`miembro_${i}_idTipoParticipante`} value={m.idTipoParticipante} />
            </span>
          ))}

          {/* Step 1: Responsable */}
          <div className={step === 1 ? 'block' : 'hidden'}>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Datos del Responsable</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Estos datos se heredarán automáticamente a todos los miembros del grupo
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
                <p>
                  <strong>Información importante:</strong> Los miembros de tu grupo quedarán registrados bajo tu misma <strong>Institución</strong>, <strong>Dependencia</strong>, <strong>Estado</strong> y <strong>Tipo de Participante</strong>.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.nombre} {responsable.apellido}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Correo electrónico</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.correo}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tipo de participante</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {getTipoParticipanteNombre()}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Institución</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {getInstitucionNombre()}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Título</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {getTituloNombre()}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {getEstadoNombre()}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-2 text-sm"
                >
                  Continuar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Integrantes - Reutiliza StepGrupo */}
          <div className={step === 2 ? 'block' : 'hidden'}>
            <StepGrupo
              grupoActivo={grupoActivo}
              miembros={miembros}
              tiposParticipante={tiposParticipante}
              esAfiliada={esAfiliada}
              precios={precios}
              onToggleGrupo={() => { setGrupoActivo((v) => !v); if (grupoActivo) setMiembros([]); }}
              onMiembrosChange={setMiembros}
              onBack={() => goTo(1)}
              onNext={() => goTo(3)}
            />
          </div>

          {/* Step 3: Pago - Reutiliza StepPago */}
          <div className={step === 3 ? 'block' : 'hidden'}>
            <StepPago
              total={total}
              desglose={{ costoLider: costoBase, costoMiembros, nMiembros, liderGratis: false }}
              deposito={deposito}
              facturacion={facturacion}
              estados={catalogos.estados}
              errors={state.errors as Record<string, string> | undefined}
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
