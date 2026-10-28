'use client';

import { useEffect, useState } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import type { Estado, Institucion, PrecioInscripcion, TipoParticipante, Titulo } from '@/application/dtos/CatalogosDTO';
import type { CamposFaltantesPerfilDTO } from '@/application/dtos/PerfilRegistroDTO';
import { completarDatosRegistroAction, type CompletarDatosActionState } from './actions';

interface DatosUsuario {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  lada: string | null;
  extension: string | null;
  genero: string | null;
  carrera: string | null;
  dependencia: string | null;
  idTitulo: number | null;
  idTipoParticipante: number | null;
  idInstitucion: number | null;
  idEntidadFederativa: number | null;
  institucionExterna: string | null;
}

interface Props {
  usuario: DatosUsuario;
  faltantes: CamposFaltantesPerfilDTO;
  catalogos: { titulos: Titulo[]; estados: Estado[]; instituciones: Institucion[] };
  precios: PrecioInscripcion[];
  tiposParticipante: TipoParticipante[];
}

const initialState: CompletarDatosActionState = { success: false };
const inputCls = 'w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all';
const selectCls = `${inputCls} appearance-none cursor-pointer`;

function Field({ label, required, error, children }: { label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
}

function obtenerPrecioVigente(
  idTipoParticipante: number,
  esAfiliada: boolean,
  precios: PrecioInscripcion[],
): PrecioInscripcion | null {
  const ahora = new Date();
  return precios
    .filter((precio) => precio.idTipoParticipante === idTipoParticipante
      && precio.esAfiliada === esAfiliada
      && precio.activo
      && new Date(precio.fechaLimite) <= ahora)
    .sort((a, b) => new Date(b.fechaLimite).getTime() - new Date(a.fechaLimite).getTime())[0] ?? null;
}

function obtenerPreciosFuturos(
  idTipoParticipante: number,
  esAfiliada: boolean,
  precios: PrecioInscripcion[],
): PrecioInscripcion[] {
  const ahora = new Date();
  return precios
    .filter((precio) => precio.idTipoParticipante === idTipoParticipante
      && precio.esAfiliada === esAfiliada
      && precio.activo
      && new Date(precio.fechaLimite) > ahora)
    .sort((a, b) => new Date(a.fechaLimite).getTime() - new Date(b.fechaLimite).getTime());
}

function formatoMoneda(costo: number): string {
  return costo.toLocaleString('es-MX', { minimumFractionDigits: 2 });
}

function formatoFecha(fecha: Date): string {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function ResumenTarifa({ idTipoParticipante, esAfiliada, precios }: {
  idTipoParticipante: number;
  esAfiliada: boolean;
  precios: PrecioInscripcion[];
}) {
  const vigente = obtenerPrecioVigente(idTipoParticipante, esAfiliada, precios);
  const futuros = obtenerPreciosFuturos(idTipoParticipante, esAfiliada, precios);
  const etiqueta = esAfiliada ? 'Costo de inscripción (tarifa afiliada)' : 'Costo de inscripción (tarifa no afiliada)';

  if (!vigente && futuros.length === 0) {
    return <p className="text-amber-700">{etiqueta}: no configurado.</p>;
  }

  return (
    <div className="space-y-0.5">
      <p className="text-slate-600">
        {etiqueta}: {vigente
          ? <span className="font-semibold text-indigo-700">${formatoMoneda(vigente.costo)} MXN</span>
          : <span className="text-slate-500">sin tarifa vigente</span>}
      </p>
      {futuros.map((precio) => (
        <p key={precio.id} className="text-slate-500">
          A partir del {formatoFecha(precio.fechaLimite)}: <span className="font-medium text-slate-700">${formatoMoneda(precio.costo)} MXN</span>
        </p>
      ))}
    </div>
  );
}

export function CompletarDatosForm({ usuario, faltantes, catalogos, precios, tiposParticipante }: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(completarDatosRegistroAction, initialState);
  const [telefono, setTelefono] = useState(usuario.telefono ?? '');
  const [lada, setLada] = useState(usuario.lada ?? '');
  const [extension, setExtension] = useState(usuario.extension ?? '');
  const [genero, setGenero] = useState(usuario.genero ?? '');
  const [carrera, setCarrera] = useState(usuario.carrera ?? '');
  const [dependencia, setDependencia] = useState(usuario.dependencia ?? '');
  const [idTitulo, setIdTitulo] = useState(usuario.idTitulo?.toString() ?? '');
  const [idTipoParticipante, setIdTipoParticipante] = useState(usuario.idTipoParticipante?.toString() ?? '');
  const [idInstitucion, setIdInstitucion] = useState(usuario.idInstitucion?.toString() ?? '');
  const [institucionExterna, setInstitucionExterna] = useState(usuario.institucionExterna ?? '');
  const [idEntidadFederativa, setIdEntidadFederativa] = useState(usuario.idEntidadFederativa?.toString() ?? '');
  const [noAfiliada, setNoAfiliada] = useState(!usuario.idInstitucion && !!usuario.institucionExterna);

  const idTipoSeleccionado = parseInt(idTipoParticipante, 10) || 0;
  const afiliacionConocida = noAfiliada || !!idInstitucion;
  const esAfiliada = !noAfiliada && !!idInstitucion;

  const mostrarTelefono = faltantes.telefono || faltantes.lada || faltantes.extension;
  const mostrarDatosInstitucionales = faltantes.institucion || faltantes.dependencia
    || faltantes.idEntidadFederativa;

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  if (state.success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-800">
        <p className="font-semibold">Datos de registro guardados</p>
        <p className="text-sm mt-1">Tus datos quedaron bloqueados y no podrán modificarse.</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-6 sm:p-8 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Completar datos de registro</h2>
        <p className="text-slate-600 text-sm mt-1">
          Completa la información que falta. Una vez guardada, no podrá modificarse.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nombre">
          <input className={`${inputCls} bg-slate-100 text-slate-500`} value={`${usuario.nombre} ${usuario.apellido}`} readOnly />
        </Field>
        <Field label="Correo electrónico">
          <input className={`${inputCls} bg-slate-100 text-slate-500`} value={usuario.correo} readOnly />
        </Field>
      </div>

      {mostrarTelefono && (
        <div className="grid gap-4 sm:grid-cols-3">
          {faltantes.telefono && (
            <Field label="Teléfono" error={state.errors?.telefono}>
              <input className={inputCls} name="telefono" value={telefono} maxLength={20}
                placeholder="+52 997 110 5996" onChange={(e) => setTelefono(e.target.value)} />
            </Field>
          )}
          {faltantes.lada && (
            <Field label="Lada" error={state.errors?.lada}>
              <input className={inputCls} name="lada" value={lada} maxLength={10}
                placeholder="52" onChange={(e) => setLada(e.target.value)} />
            </Field>
          )}
          {faltantes.extension && (
            <Field label="Extensión" error={state.errors?.extension}>
              <input className={inputCls} name="extension" value={extension} maxLength={10}
                placeholder="100" onChange={(e) => setExtension(e.target.value)} />
            </Field>
          )}
        </div>
      )}

      {(faltantes.genero || faltantes.carrera) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {faltantes.genero && (
            <Field label="Género" required error={state.errors?.genero}>
              <select className={selectCls} name="genero" value={genero} required
                onChange={(e) => setGenero(e.target.value)}>
                <option value="">Seleccione...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Prefiero no decirlo</option>
              </select>
            </Field>
          )}
          {faltantes.carrera && (
            <Field label="Carrera / Programa" error={state.errors?.carrera}>
              <input className={inputCls} name="carrera" value={carrera} maxLength={128}
                placeholder="Ej. Ingeniería en Sistemas" onChange={(e) => setCarrera(e.target.value)} />
            </Field>
          )}
        </div>
      )}

      {(faltantes.idTitulo || faltantes.idTipoParticipante) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {faltantes.idTitulo && (
            <Field label="Título" required error={state.errors?.idTitulo}>
              <select className={selectCls} name="idTitulo" value={idTitulo} required
                onChange={(e) => setIdTitulo(e.target.value)}>
                <option value="">Seleccione...</option>
                {catalogos.titulos.map((titulo) => (
                  <option key={titulo.idTitulo} value={titulo.idTitulo}>{titulo.descripcion}</option>
                ))}
              </select>
            </Field>
          )}
          {faltantes.idTipoParticipante && (
            <Field label="Tipo de participante" required error={state.errors?.idTipoParticipante}>
              <select className={selectCls} name="idTipoParticipante" value={idTipoParticipante} required
                onChange={(e) => setIdTipoParticipante(e.target.value)}>
                <option value="">Seleccione...</option>
                {tiposParticipante.map((tipo) => (
                  <option key={tipo.idTipoParticipante} value={tipo.idTipoParticipante}>{tipo.descripcion}</option>
                ))}
              </select>
              {idTipoSeleccionado > 0 && (
                <div className="mt-1 rounded-lg border border-indigo-100 bg-white/80 px-3 py-2 text-xs">
                  {afiliacionConocida ? (
                    <ResumenTarifa
                      idTipoParticipante={idTipoSeleccionado}
                      esAfiliada={esAfiliada}
                      precios={precios}
                    />
                  ) : (
                    <>
                      <p className="text-slate-500 mb-1">
                        Selecciona tu institución para confirmar la tarifa. Tarifas aplicables:
                      </p>
                      <div className="grid gap-1 sm:grid-cols-2">
                        <ResumenTarifa idTipoParticipante={idTipoSeleccionado} esAfiliada precios={precios} />
                        <ResumenTarifa idTipoParticipante={idTipoSeleccionado} esAfiliada={false} precios={precios} />
                      </div>
                    </>
                  )}
                </div>
              )}
            </Field>
          )}
        </div>
      )}

      {mostrarDatosInstitucionales && (
        <div className="space-y-4 border-t border-indigo-200 pt-5">
          <h3 className="text-base font-semibold text-slate-900">Datos institucionales</h3>

          {faltantes.institucion && (
            <Field label="Institución" required error={state.errors?.idInstitucion || state.errors?.institucionExterna}>
              <div className="space-y-3">
                <select className={selectCls} name="idInstitucion" value={idInstitucion} disabled={noAfiliada}
                  required={!noAfiliada} onChange={(e) => setIdInstitucion(e.target.value)}>
                  <option value="">Seleccione...</option>
                  {catalogos.instituciones.map((institucion) => (
                    <option key={institucion.idInstitucion} value={institucion.idInstitucion}>
                      {institucion.abreviatura ? `${institucion.abreviatura} - ${institucion.nombre}` : institucion.nombre}
                    </option>
                  ))}
                </select>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={noAfiliada} onChange={(e) => setNoAfiliada(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500" />
                  <span className="text-sm text-slate-600">Mi institución no está afiliada</span>
                </label>
                <input type="hidden" name="noAfiliada" value={noAfiliada ? 'true' : 'false'} />
                {noAfiliada && (
                  <input className={inputCls} name="institucionExterna" value={institucionExterna} maxLength={150}
                    placeholder="Nombre de la institución" required onChange={(e) => setInstitucionExterna(e.target.value)} />
                )}
              </div>
            </Field>
          )}

          {faltantes.dependencia && (
            <Field label="Facultad / Dependencia" error={state.errors?.dependencia}>
              <input className={inputCls} name="dependencia" value={dependencia} maxLength={128}
                placeholder="Ej. Facultad de Ingeniería" onChange={(e) => setDependencia(e.target.value)} />
            </Field>
          )}

          {faltantes.idEntidadFederativa && (
            <Field label="Estado" required error={state.errors?.idEntidadFederativa}>
              <select className={selectCls} name="idEntidadFederativa" value={idEntidadFederativa} required
                onChange={(e) => setIdEntidadFederativa(e.target.value)}>
                <option value="">Seleccione...</option>
                {catalogos.estados.map((estado) => (
                  <option key={estado.idEntidadFederativa} value={estado.idEntidadFederativa}>{estado.nombre}</option>
                ))}
              </select>
            </Field>
          )}
        </div>
      )}

      {state.error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={isPending}
          className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          {isPending ? 'Guardando...' : 'Guardar datos'}
        </button>
      </div>
    </form>
  );
}
