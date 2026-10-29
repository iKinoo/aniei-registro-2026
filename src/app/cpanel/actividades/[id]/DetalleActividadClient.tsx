'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ActividadDTO, PonenteDTO, InscritoDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad, Institucion } from '@/application/dtos/CatalogosDTO';
import { 
  generarConstanciaPonenteAction, 
  enviarConstanciaPonenteAction,
  generarConstanciaParticipanteAction,
  enviarConstanciaParticipanteAction,
  generarConstanciaParticipanteBatchAction,
  generarListaParticipantesPdfAction,
  eliminarInscripcionAction,
  actualizarSeleccionConstanciaAction
} from './actions';
import { obtenerUrlArchivoAction } from '@/app/cpanel/actions';
import { extraerRutaArchivo } from '@/shared/utils/archivos';
import { ActividadModal } from '../ActividadModal';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import InscribirParticipantesModal from './InscribirParticipantesModal';

interface Props {
  actividad: ActividadDTO;
  nombreTipo: string;
  ponentes: PonenteDTO[];
  inscritos: InscritoDTO[];
  tiposActividad: TipoActividad[];
  instituciones: Institucion[];
}

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

export default function DetalleActividadClient({ actividad, nombreTipo, ponentes, inscritos, tiposActividad, instituciones }: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [loadingGenerar, setLoadingGenerar] = useState<string | null>(null);
  const [loadingSend, setLoadingSend] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isInscribirOpen, setIsInscribirOpen] = useState(false);

  const manejaConstanciasParticipantes = actividad.tipoActividad?.generaConstanciaParticipante ?? false;
  const [selectedInscritos, setSelectedInscritos] = useState<Set<string>>(
    new Set(manejaConstanciasParticipantes
      ? inscritos.filter(i => i.incluirEnConstancia).map(i => i.folioRegistro)
      : [])
  );
  const [guardandoSeleccion, setGuardandoSeleccion] = useState<Set<string>>(new Set());
  const [guardandoSeleccionMasiva, setGuardandoSeleccionMasiva] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [abriendoConstancia, setAbriendoConstancia] = useState<string | null>(null);
  const [inscritoAEliminar, setInscritoAEliminar] = useState<InscritoDTO | null>(null);
  const [eliminandoInscripcion, setEliminandoInscripcion] = useState(false);

  useEffect(() => {
    setSelectedInscritos(new Set(
      manejaConstanciasParticipantes
        ? inscritos.filter(i => i.incluirEnConstancia).map(i => i.folioRegistro)
        : []
    ));
  }, [inscritos, manejaConstanciasParticipantes]);

  const handleAbrirConstancia = async (valor: string) => {
    const ruta = extraerRutaArchivo(valor);
    setAbriendoConstancia(ruta);
    try {
      const res = await obtenerUrlArchivoAction(ruta);
      if (res.success) window.open(res.url, '_blank');
      else alert(res.error);
    } finally {
      setAbriendoConstancia(null);
    }
  };

  const refreshPage = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  const toggleSeleccionInscrito = (folioRegistro: string) => {
    if (guardandoSeleccion.has(folioRegistro) || guardandoSeleccionMasiva) return;

    const incluir = !selectedInscritos.has(folioRegistro);
    const siguiente = new Set(selectedInscritos);
    if (incluir) siguiente.add(folioRegistro);
    else siguiente.delete(folioRegistro);

    const restaurar = () => {
      setSelectedInscritos(prev => {
        const restaurado = new Set(prev);
        if (incluir) restaurado.delete(folioRegistro);
        else restaurado.add(folioRegistro);
        return restaurado;
      });
    };

    setSelectedInscritos(siguiente);
    setGuardandoSeleccion(prev => new Set(prev).add(folioRegistro));

    actualizarSeleccionConstanciaAction(actividad.idActividad, folioRegistro, incluir)
      .then((res) => {
        if (res.success) return;
        restaurar();
        alert(res.error);
      })
      .catch(() => {
        restaurar();
        alert('Error al guardar la selección de constancias');
      })
      .finally(() => {
        setGuardandoSeleccion(prev => {
          const siguiente = new Set(prev);
          siguiente.delete(folioRegistro);
          return siguiente;
        });
      });
  };

  const toggleSeleccionTodosInscritos = () => {
    if (guardandoSeleccionMasiva || guardandoSeleccion.size > 0) return;

    const todosSeleccionados = inscritos.length > 0
      && inscritos.every(i => selectedInscritos.has(i.folioRegistro));
    const incluir = !todosSeleccionados;
    const anterior = new Set(selectedInscritos);

    setSelectedInscritos(incluir ? new Set(inscritos.map(i => i.folioRegistro)) : new Set());
    setGuardandoSeleccionMasiva(true);

    actualizarSeleccionConstanciaAction(actividad.idActividad, null, incluir)
      .then((res) => {
        if (res.success) return;
        setSelectedInscritos(anterior);
        alert(res.error);
      })
      .catch(() => {
        setSelectedInscritos(anterior);
        alert('Error al guardar la selección de constancias');
      })
      .finally(() => setGuardandoSeleccionMasiva(false));
  };

  const handleGenerarParticipanteBatch = async () => {
    if (selectedInscritos.size === 0) return alert('Selecciona al menos un participante');
    setLoadingBatch(true);
    try {
      const res = await generarConstanciaParticipanteBatchAction(actividad.idActividad, Array.from(selectedInscritos));
      if (!res.success) alert(res.error || 'Error al generar lote');
      else {
        const failed = res.resultados?.filter(r => !r.success) || [];
        if (failed.length > 0) alert(`Se generaron con éxito, pero ${failed.length} fallaron.`);
        else alert('Todas las constancias seleccionadas se generaron con éxito.');
        startTransition(() => router.refresh());
      }
    } finally {
      setLoadingBatch(false);
    }
  };

  const handleDescargarListaPdf = async () => {
    setLoadingPdf(true);
    try {
      const res = await generarListaParticipantesPdfAction(actividad.idActividad);
      if (!res.success) {
        alert(res.error || 'Error al generar la lista');
      } else {
        const { base64, nombreArchivo } = res.data;
        const blob = new Blob([Uint8Array.from(atob(base64), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleGenerarParticipante = async (folioRegistro: string) => {
    setLoadingGenerar(folioRegistro);
    try {
      const res = await generarConstanciaParticipanteAction(actividad.idActividad, folioRegistro);
      if (!res.success) alert(res.error || 'Error al generar la constancia');
      else startTransition(() => router.refresh());
    } finally {
      setLoadingGenerar(null);
    }
  };

  const handleEnviarParticipante = async (folioRegistro: string) => {
    setLoadingSend(folioRegistro);
    try {
      const res = await enviarConstanciaParticipanteAction(actividad.idActividad, folioRegistro);
      if (!res.success) alert(res.error || 'Error al enviar por correo');
      else alert('Constancia enviada correctamente al correo del participante.');
    } finally {
      setLoadingSend(null);
    }
  };

  const handleGenerar = async (folioRegistro: string) => {
    setLoadingGenerar(folioRegistro);
    try {
      const res = await generarConstanciaPonenteAction(actividad.idActividad, folioRegistro);
      if (!res.success) {
        alert(res.error || 'Error al generar la constancia');
      } else {
        startTransition(() => {
          router.refresh();
        });
      }
    } finally {
      setLoadingGenerar(null);
    }
  };

  const handleEnviar = async (folioRegistro: string) => {
    setLoadingSend(folioRegistro);
    try {
      const res = await enviarConstanciaPonenteAction(actividad.idActividad, folioRegistro);
      if (!res.success) {
        alert(res.error || 'Error al enviar por correo');
      } else {
        alert('Constancia enviada correctamente al correo del ponente.');
      }
    } finally {
      setLoadingSend(null);
    }
  };

  const confirmarEliminarInscripcion = async () => {
    if (!inscritoAEliminar) return;
    setEliminandoInscripcion(true);
    try {
      const res = await eliminarInscripcionAction(actividad.idActividad, inscritoAEliminar.folioRegistro);
      if (res.success) {
        setInscritoAEliminar(null);
        setSelectedInscritos((prev) => {
          const next = new Set(prev);
          next.delete(inscritoAEliminar.folioRegistro);
          return next;
        });
        refreshPage();
      } else {
        alert(res.error || 'Error al eliminar la inscripción');
      }
    } finally {
      setEliminandoInscripcion(false);
    }
  };

  const formatFecha = (iso: Date | string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const formatHora = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

  const formatHorario = (h: { fechaInicio: string; fechaFin: string }) => {
    const fecha = new Date(h.fechaInicio).toLocaleDateString('es-MX', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
    });
    const mismoDia = h.fechaInicio.slice(0, 10) === h.fechaFin.slice(0, 10);
    return `${fecha.charAt(0).toUpperCase() + fecha.slice(1)} · ${formatHora(h.fechaInicio)}–${formatHora(h.fechaFin)}${mismoDia ? '' : ` (${formatFecha(h.fechaFin)})`}`;
  };

  return (
    <div className="p-8 font-sans min-h-full">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cpanel/actividades" className="text-slate-300 hover:text-white transition-colors">
            ← Volver
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              {actividad.nombre}
              {!actividad.activo && (
                <span className="ml-3 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-rose-100 text-rose-700 align-middle">
                  Inactiva
                </span>
              )}
            </h1>
            <p className="text-slate-300 mt-1">{nombreTipo}</p>
          </div>
          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            <EditIcon /> Editar
          </button>
        </div>

        {/* General Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p><strong className="text-slate-800">Título para constancia:</strong> {actividad.nombre}</p>
              <p><strong className="text-slate-800">Modalidad:</strong> {actividad.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial'}</p>
              {actividad.modalidad === 'VIRTUAL' ? (
                <p className="flex flex-wrap items-center gap-2">
                  <strong className="text-slate-800">Enlace de sesión:</strong>
                  {actividad.enlaceSesion ? (
                    <a
                      href={actividad.enlaceSesion}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline break-all"
                    >
                      {actividad.enlaceSesion}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Aún no se ha capturado</span>
                  )}
                </p>
              ) : (
                <>
                  <p><strong className="text-slate-800">Institución responsable:</strong> {actividad.institucionSede ? (actividad.institucionSede.abreviatura ?? actividad.institucionSede.nombre) : '—'}</p>
                  <p><strong className="text-slate-800">Sala / Auditorio:</strong> {actividad.sala || '—'}</p>
                </>
              )}
            </div>
            <div>
              <p><strong className="text-slate-800">Cupo:</strong> {inscritos.length} / {actividad.cupoMaximo ? actividad.cupoMaximo : 'Sin límite'}</p>
              <p><strong className="text-slate-800">Costo:</strong> {actividad.costo != null && actividad.costo > 0 ? `$${actividad.costo} MXN` : 'Gratis'}</p>
            </div>
          </div>
          <div>
            <p className="text-sm"><strong className="text-slate-800">Horarios:</strong></p>
            {actividad.horarios.length === 0 ? (
              <p className="text-sm text-slate-400 italic mt-1">Sin horarios definidos.</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {actividad.horarios.map((h, i) => (
                  <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                    <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatHorario(h)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Ponentes */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Ponentes ({ponentes.length})</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {ponentes.length === 0 ? (
              <p className="px-6 py-8 text-center text-slate-500">No hay ponentes asignados a esta actividad.</p>
            ) : (
              ponentes.map(p => (
                <div key={p.folioRegistro} className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{p.nombre} {p.apellido}</p>
                    <p className="text-sm text-slate-500">{p.rol || 'Ponente'} • {p.correo}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleGenerar(p.folioRegistro)}
                      disabled={loadingGenerar === p.folioRegistro}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      {loadingGenerar === p.folioRegistro ? 'Generando...' : (p.urlConstancia ? 'Volver a generar constancia' : 'Generar constancia')}
                    </button>

                    {p.urlConstancia && (
                      <>
                        <button
                          onClick={() => handleAbrirConstancia(p.urlConstancia!)}
                          disabled={abriendoConstancia === extraerRutaArchivo(p.urlConstancia)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          {abriendoConstancia === extraerRutaArchivo(p.urlConstancia) ? 'Abriendo...' : 'Ver constancia'}
                        </button>
                        <button
                          onClick={() => handleEnviar(p.folioRegistro)}
                          disabled={loadingSend === p.folioRegistro}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          {loadingSend === p.folioRegistro ? 'Enviando...' : 'Enviar al correo del ponente'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Inscritos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="text-lg font-semibold text-slate-800">
              Participantes Inscritos ({inscritos.length})
              {(guardandoSeleccionMasiva || guardandoSeleccion.size > 0) && (
                <span className="ml-2 text-xs font-normal text-slate-400">Guardando selección...</span>
              )}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsInscribirOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <PlusIcon />
                Inscribir participantes
              </button>
              <button
                onClick={handleDescargarListaPdf}
                disabled={loadingPdf || inscritos.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {loadingPdf ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Descargar lista (PDF)
                  </>
                )}
              </button>
              {manejaConstanciasParticipantes && inscritos.length > 0 && (
                <button
                  onClick={handleGenerarParticipanteBatch}
                  disabled={loadingBatch || selectedInscritos.size === 0 || guardandoSeleccionMasiva || guardandoSeleccion.size > 0}
                  className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loadingBatch ? 'Generando en lote...' : `Generar constancias (${selectedInscritos.size})`}
                </button>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  {manejaConstanciasParticipantes && (
                    <th className="px-6 py-3 font-semibold text-center w-12">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                        checked={inscritos.length > 0 && inscritos.every(i => selectedInscritos.has(i.folioRegistro))}
                        onChange={toggleSeleccionTodosInscritos}
                        disabled={loadingBatch || guardandoSeleccionMasiva || guardandoSeleccion.size > 0}
                        title="Seleccionar a todos para constancias"
                        aria-label="Seleccionar a todos para constancias"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 font-semibold">Nombre</th>
                  <th className="px-6 py-3 font-semibold">Correo</th>
                  <th className="px-6 py-3 font-semibold">Fecha de Inscripción</th>
                  {manejaConstanciasParticipantes && (
                    <th className="px-6 py-3 font-semibold text-right">Constancia</th>
                  )}
                  <th className="px-6 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inscritos.length === 0 ? (
                  <tr>
                    <td colSpan={manejaConstanciasParticipantes ? 6 : 4} className="px-6 py-8 text-center text-slate-500">
                      Ningún participante inscrito aún.
                    </td>
                  </tr>
                ) : (
                  inscritos.map((i) => (
                    <tr key={i.folioRegistro} className="hover:bg-slate-50/50 transition-colors">
                      {manejaConstanciasParticipantes && (
                        <td className="px-6 py-3 text-center align-middle">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                            checked={selectedInscritos.has(i.folioRegistro)}
                            onChange={() => toggleSeleccionInscrito(i.folioRegistro)}
                            disabled={loadingBatch || guardandoSeleccionMasiva || guardandoSeleccion.has(i.folioRegistro)}
                            title="Incluir en la generación de constancias"
                            aria-label={`Incluir a ${i.nombre} ${i.apellido} en la generación de constancias`}
                          />
                        </td>
                      )}
                      <td className="px-6 py-3 font-medium text-slate-900 align-middle">
                        {i.nombre} {i.apellido}
                      </td>
                      <td className="px-6 py-3 text-slate-500 align-middle">{i.correo}</td>
                      <td className="px-6 py-3 text-slate-500 align-middle">
                        {formatFecha(i.fechaInscripcion)}
                      </td>
                      {manejaConstanciasParticipantes && (
                        <td className="px-6 py-3 text-right">
                          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-2">
                            <button
                              onClick={() => handleGenerarParticipante(i.folioRegistro)}
                              disabled={loadingGenerar === i.folioRegistro || loadingBatch}
                              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 min-w-max"
                            >
                              {loadingGenerar === i.folioRegistro ? 'Generando...' : (i.urlConstancia ? 'Regenerar' : 'Generar')}
                            </button>

                            {i.urlConstancia && (
                              <>
                                <button
                                  onClick={() => handleAbrirConstancia(i.urlConstancia!)}
                                  disabled={abriendoConstancia === extraerRutaArchivo(i.urlConstancia)}
                                  className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 min-w-max"
                                >
                                  {abriendoConstancia === extraerRutaArchivo(i.urlConstancia) ? 'Abriendo...' : 'Ver/Descargar'}
                                </button>
                                <button
                                  onClick={() => handleEnviarParticipante(i.folioRegistro)}
                                  disabled={loadingSend === i.folioRegistro || loadingBatch}
                                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 min-w-max"
                                >
                                  {loadingSend === i.folioRegistro ? 'Enviando...' : 'Enviar correo'}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => setInscritoAEliminar(i)}
                          disabled={eliminandoInscripcion}
                          title="Eliminar inscripción"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 min-w-max"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {isEditOpen && (
        <ActividadModal
          editingActividad={actividad}
          tiposActividad={tiposActividad}
          instituciones={instituciones}
          onSuccess={refreshPage}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {isInscribirOpen && (
        <InscribirParticipantesModal
          idActividad={actividad.idActividad}
          nombreActividad={actividad.nombre}
          inscritos={inscritos}
          cupoMaximo={actividad.cupoMaximo}
          costo={actividad.costo}
          onSuccess={refreshPage}
          onClose={() => setIsInscribirOpen(false)}
        />
      )}

      <ConfirmDialog
        isOpen={!!inscritoAEliminar}
        title="Eliminar inscripción"
        message={`¿Eliminar a "${inscritoAEliminar ? `${inscritoAEliminar.nombre} ${inscritoAEliminar.apellido}` : ''}" de esta actividad? Se borrará su lugar en el cupo${inscritoAEliminar?.urlConstancia ? ' y su constancia generada' : ''}.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={eliminandoInscripcion}
        onConfirm={confirmarEliminarInscripcion}
        onCancel={() => setInscritoAEliminar(null)}
      />
    </div>
  );
}
