'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { registrarGrupoRapidoAction, GrupoRapidoActionState } from './actions';
import { Titulo, Estado, Institucion, PrecioInscripcion } from '@/shared/types/catalogos';
import { FormularioDeposito, DepositoFormValues } from '@/app/registro/components/FormularioDeposito';

export interface MiembroGrupo {
  nombre: string;
  apellido: string;
}

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
  id_institucion: number | null;
  id_entidad_federativa: number | null;
}

interface GrupoRapidoFormProps {
  responsable: ResponsableData;
  catalogos: { titulos: Titulo[]; estados: Estado[]; instituciones: Institucion[] };
  precios: PrecioInscripcion[];
  precioVigente: PrecioInscripcion | null;
}

const STEPS = [
  { id: 1, label: 'Responsable', icon: '👤' },
  { id: 2, label: 'Integrantes', icon: '👥' },
  { id: 3, label: 'Pago', icon: '💳' },
];

const emptyDeposito: DepositoFormValues = {
  bancoSucursal: '',
  ciudad: '',
  referencia: '',
  monto: '',
  fechaDeposito: '',
  notas: '',
};

const initialState: GrupoRapidoActionState = { success: false };

function formatMXN(amount: number) {
  return amount.toLocaleString('es-MX', { minimumFractionDigits: 2 });
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function GrupoRapidoForm({
  responsable,
  catalogos,
  precios,
  precioVigente,
}: GrupoRapidoFormProps) {
  const [state, formAction, isPending] = useActionState(registrarGrupoRapidoAction, initialState);
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [grupoActivo, setGrupoActivo] = useState(false);
  const [miembros, setMiembros] = useState<MiembroGrupo[]>([]);
  const [deposito, setDeposito] = useState<DepositoFormValues>(emptyDeposito);
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
    setMaxStep((prev) => Math.max(prev, n));
  }

  const addMiembro = () => setMiembros([...miembros, { nombre: '', apellido: '' }]);
  const removeMiembro = (index: number) => {
    setMiembros(miembros.filter((_, i) => i !== index));
  };
  const updateMiembro = (index: number, field: keyof MiembroGrupo, value: string) => {
    const newMiembros = [...miembros];
    newMiembros[index] = { ...newMiembros[index], [field]: value };
    setMiembros(newMiembros);
  };

  const canGoToStep2 = true;
  const canGoToStep3 = !grupoActivo || miembros.every((m) => m.nombre.trim() && m.apellido.trim());

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
            📬 Revisa tu correo <strong className="text-slate-800">{state.data?.emailPadre}</strong> — ahí encontrarás el PDF con el código QR para que los miembros completen su registro.
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
          <input type="hidden" name="responsableIdInstitucion" value={responsable.id_institucion?.toString() ?? ''} />
          <input type="hidden" name="responsableIdEntidadFederativa" value={responsable.id_entidad_federativa?.toString() ?? ''} />

          <input type="hidden" name="grupoActivo" value={grupoActivo ? 'true' : 'false'} />
          <input type="hidden" name="numMiembros" value={miembros.length} />
          {miembros.map((m, i) => (
            <span key={i}>
              <input type="hidden" name={`miembro_${i}_nombre`} value={m.nombre} />
              <input type="hidden" name={`miembro_${i}_apellido`} value={m.apellido} />
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
                  <strong>Información importante:</strong> Los miembros de tu grupo quedarán registrados bajo tu misma <strong>Institución</strong>, <strong>Dependencia</strong> y <strong>Estado</strong>, con perfil de <strong>Alumno</strong>.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nombre</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.nombre}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Apellido</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.apellido}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Correo electrónico</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                  {responsable.correo}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lada</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.lada || '—'}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Teléfono</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.telefono || '—'}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Extensión</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.extension || '—'}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Género</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.genero === 'M' ? 'Masculino' : responsable.genero === 'F' ? 'Femenino' : responsable.genero === 'O' ? 'Prefiero no decirlo' : '—'}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Carrera / Programa</label>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                    {responsable.carrera || '—'}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Institución</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                  {getInstitucionNombre()}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Facultad / Dependencia</label>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 text-sm">
                  {responsable.dependencia || '—'}
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

          {/* Step 2: Integrantes */}
          <div className={step === 2 ? 'block' : 'hidden'}>
            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Integrantes del Grupo</h2>
                <p className="text-slate-500 text-sm mt-0.5">Agrega los miembros de tu grupo (opcional)</p>
              </div>

              <div className="flex items-start justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Registro grupal</h3>
                  <p className="text-slate-500 text-sm mt-0.5">
                    {grupoActivo ? 'Agrega los miembros de tu grupo.' : 'Activa si deseas registrar miembros adicionales.'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={grupoActivo}
                  onClick={() => { setGrupoActivo((v) => !v); if (grupoActivo) setMiembros([]); }}
                  className={`mt-1 relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${grupoActivo ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${grupoActivo ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {grupoActivo && (
                <>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addMiembro}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
                    >
                      + Agregar integrante
                    </button>
                  </div>

                  {miembros.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                      <p className="text-sm">No hay integrantes agregados</p>
                      <p className="text-xs mt-1">Haz clic en "Agregar integrante" para comenzar</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {miembros.map((miembro, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Nombre(s)"
                              value={miembro.nombre}
                              onChange={(e) => updateMiembro(index, 'nombre', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Apellido(s)"
                              value={miembro.apellido}
                              onChange={(e) => updateMiembro(index, 'apellido', e.target.value)}
                              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMiembro(index)}
                            className="text-red-500 hover:text-red-700 px-3 text-sm font-medium"
                          >
                            Eliminar
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-between pt-1">
                <button
                  type="button"
                  onClick={() => goTo(1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => goTo(3)}
                  disabled={!canGoToStep3}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                >
                  Continuar
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Pago */}
          <div className={step === 3 ? 'block' : 'hidden'}>
            <div className="space-y-4">
              {/* Cost summary */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Resumen del pago</h2>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Congreso ANIEI 2026 (responsable)</span>
                    <span className="text-slate-800 font-medium">${formatMXN(costoBase)}</span>
                  </div>
                  {nMiembros > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">+{nMiembros} miembro{nMiembros > 1 ? 's' : ''} de grupo</span>
                      <span className="text-violet-600 font-medium">+${formatMXN(costoMiembro * nMiembros)}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-100 pt-2.5 flex justify-between items-center">
                    <span className="font-semibold text-slate-900">Total</span>
                    <span className="text-2xl font-extrabold text-indigo-700">
                      ${formatMXN(total)}
                      <span className="text-sm font-normal text-slate-400 ml-1">MXN</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Deposit data */}
              <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-semibold text-slate-900">Datos del depósito / transferencia</h3>
                <FormularioDeposito
                  variant="light"
                  values={deposito}
                  onChange={(field, val) => {
                    if (field === 'monto') setMontoTouched(true);
                    setDeposito((prev) => ({ ...prev, [field]: val }));
                  }}
                  errors={state.errors}
                  showFileUpload
                  fileInputName="archivo"
                  fileError={state.errors?.archivo}
                />
              </div>

              {/* Nav + Submit */}
              <div className="flex justify-between pt-1">
                <button
                  type="button"
                  onClick={() => goTo(2)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Atrás
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Registrando...
                    </>
                  ) : (
                    <>
                      Completar registro grupal
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
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
