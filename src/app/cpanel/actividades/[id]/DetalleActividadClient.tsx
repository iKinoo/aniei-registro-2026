'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ActividadDTO, PonenteDTO, InscritoDTO } from '@/application/dtos/ActividadDTO';
import { generarConstanciaPonenteAction, enviarConstanciaPonenteAction } from './actions';

interface Props {
  actividad: ActividadDTO;
  nombreTipo: string;
  ponentes: PonenteDTO[];
  inscritos: InscritoDTO[];
}

export default function DetalleActividadClient({ actividad, nombreTipo, ponentes, inscritos }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingGenerar, setLoadingGenerar] = useState<number | null>(null);
  const [loadingSend, setLoadingSend] = useState<number | null>(null);

  const handleGenerar = async (idUsuario: number) => {
    setLoadingGenerar(idUsuario);
    try {
      const res = await generarConstanciaPonenteAction(actividad.idActividad, idUsuario);
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

  const handleEnviar = async (idUsuario: number) => {
    setLoadingSend(idUsuario);
    try {
      const res = await enviarConstanciaPonenteAction(actividad.idActividad, idUsuario);
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
              <p><strong className="text-slate-800">Costo:</strong> {actividad.costo?.monto != null ? `$${actividad.costo.monto} MXN` : 'Gratis'}</p>
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
                <div key={p.idUsuario} className="px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{p.nombre} {p.apellido}</p>
                    <p className="text-sm text-slate-500">{p.rol || 'Ponente'} • {p.correo}</p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleGenerar(p.idUsuario)}
                      disabled={loadingGenerar === p.idUsuario}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      {loadingGenerar === p.idUsuario ? 'Generando...' : (p.urlConstancia ? 'Volver a generar constancia' : 'Generar constancia')}
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
                          onClick={() => handleEnviar(p.idUsuario)}
                          disabled={loadingSend === p.idUsuario}
                          className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          {loadingSend === p.idUsuario ? 'Enviando...' : 'Enviar al correo del ponente'}
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
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">Participantes Inscritos ({inscritos.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-sans text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-6 py-3 font-semibold">Nombre</th>
                  <th className="px-6 py-3 font-semibold">Correo</th>
                  <th className="px-6 py-3 font-semibold">Fecha de Inscripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inscritos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">Ningún participante inscrito aún.</td>
                  </tr>
                ) : (
                  inscritos.map(i => (
                    <tr key={i.idUsuario} className="hover:bg-slate-50/50">
                      <td className="px-6 py-3 font-medium text-slate-900">{i.nombre} {i.apellido}</td>
                      <td className="px-6 py-3 text-slate-500">{i.correo}</td>
                      <td className="px-6 py-3 text-slate-500">{formatFecha(i.fechaInscripcion)}</td>
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