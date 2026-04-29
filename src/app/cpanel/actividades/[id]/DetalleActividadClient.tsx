'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ActividadDTO, PonenteDTO, InscritoDTO } from '@/application/dtos/ActividadDTO';
import { 
  generarConstanciaPonenteAction, 
  enviarConstanciaPonenteAction,
  generarConstanciaParticipanteAction,
  enviarConstanciaParticipanteAction,
  generarConstanciaParticipanteBatchAction
} from './actions';

interface Props {
  actividad: ActividadDTO;
  nombreTipo: string;
  ponentes: PonenteDTO[];
  inscritos: InscritoDTO[];
}

export default function DetalleActividadClient({ actividad, nombreTipo, ponentes, inscritos }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingGenerar, setLoadingGenerar] = useState<string | null>(null);
  const [loadingSend, setLoadingSend] = useState<string | null>(null);

  const manejaConstanciasParticipantes = actividad.tipoActividad?.generaConstanciaParticipante ?? false;
  const [selectedInscritos, setSelectedInscritos] = useState<Set<string>>(
    new Set(manejaConstanciasParticipantes ? inscritos.map(i => i.folioRegistro) : [])
  );
  const [loadingBatch, setLoadingBatch] = useState(false);

  const toggleSeleccionInscrito = (id: string) => {
    const next = new Set(selectedInscritos);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedInscritos(next);
  };

  const toggleSeleccionTodosInscritos = () => {
    if (selectedInscritos.size === inscritos.length) setSelectedInscritos(new Set());
    else setSelectedInscritos(new Set(inscritos.map(i => i.folioRegistro)));
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

  const formatFecha = (iso: Date | string | null) => {
    if (!iso) return '-';
    return new Date(iso).toLocaleString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="p-8 font-sans min-h-screen">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cpanel/actividades" className="text-slate-400 hover:text-slate-600 transition-colors">
            ← Volver
          </Link>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{actividad.nombre}</h1>
            <p className="text-slate-500 mt-1">{nombreTipo}</p>
          </div>
        </div>

        {/* General Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Información General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <p><strong className="text-slate-800">Título para constancia:</strong> {actividad.nombre}</p>
              <p><strong className="text-slate-800">Fecha de inicio:</strong> {formatFecha(actividad.fechaInicio)}</p>
              <p><strong className="text-slate-800">Fecha de fin:</strong> {formatFecha(actividad.fechaFin)}</p>
            </div>
            <div>
              <p>
                <strong className="text-slate-800">Cupo:</strong> {inscritos.length} / {actividad.cupoMaximo ? actividad.cupoMaximo : 'Sin límite'}
              </p>
              <p><strong className="text-slate-800">Costo:</strong> {actividad.costo != null && actividad.costo > 0 ? `$${actividad.costo} MXN` : 'Gratis'}</p>
            </div>
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
                        <a
                          href={p.urlConstancia}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Ver constancia
                        </a>
                        <a
                          href={p.urlConstancia}
                          download
                          className="px-3 py-1.5 border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          Descargar
                        </a>
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
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Participantes Inscritos ({inscritos.length})</h2>
            {manejaConstanciasParticipantes && inscritos.length > 0 && (
              <button
                onClick={handleGenerarParticipanteBatch}
                disabled={loadingBatch || selectedInscritos.size === 0}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loadingBatch ? 'Generando en lote...' : `Generar constancias (${selectedInscritos.size})`}
              </button>
            )}
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
                        checked={selectedInscritos.size === inscritos.length && inscritos.length > 0}
                        onChange={toggleSeleccionTodosInscritos}
                        disabled={loadingBatch}
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 font-semibold">Nombre</th>
                  <th className="px-6 py-3 font-semibold">Correo</th>
                  <th className="px-6 py-3 font-semibold">Fecha de Inscripción</th>
                  {manejaConstanciasParticipantes && (
                    <th className="px-6 py-3 font-semibold text-right">Constancia</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inscritos.length === 0 ? (
                  <tr>
                    <td colSpan={manejaConstanciasParticipantes ? 5 : 3} className="px-6 py-8 text-center text-slate-500">
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
                            disabled={loadingBatch}
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
                                <a
                                  href={i.urlConstancia}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3 py-1.5 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                >
                                  Ver/Descargar
                                </a>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}