'use client';

import Link from 'next/link';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const TIPO_COLORS: Record<string, string> = {
  'conferencia': 'bg-blue-100 text-blue-700',
  'taller': 'bg-amber-100 text-amber-700',
  'hackaton': 'bg-purple-100 text-purple-700',
  'torneo': 'bg-emerald-100 text-emerald-700',
  'concurso': 'bg-rose-100 text-rose-700',
};

function TipoBadge({ tipo }: { tipo: ActividadDTO['tipoActividad'] }) {
  if (!tipo) return <span className="text-slate-400 text-xs italic">Sin tipo</span>;
  const key = tipo.clave?.toLowerCase() ?? tipo.descripcion.toLowerCase();
  const color = TIPO_COLORS[key] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {tipo.descripcion}
    </span>
  );
}

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface Props {
  actividades: ActividadDTO[];
}

export default function EquiposListClient({ actividades }: Props) {
  return (
    <div className="p-8 font-sans min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Administrar Equipos</h1>
            <p className="text-sm text-slate-500 mt-1">Selecciona una actividad para gestionar sus equipos</p>
          </div>
          <Link
            href="/cpanel"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al cpanel
          </Link>
        </div>

        {actividades.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UsersIcon />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay actividades con equipos</h3>
            <p className="text-sm text-slate-500">
              No se encontraron actividades configuradas para manejar equipos.
              <br />
              Crea un tipo de actividad con la opción "Maneja equipos" habilitada.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {actividades.map((act) => (
              <Link
                key={act.idActividad}
                href={`/cpanel/equipos/${act.idActividad}`}
                className="group bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
                      {act.nombre}
                    </h3>
                    <TipoBadge tipo={act.tipoActividad} />
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatFecha(act.fechaInicio)}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Cupo: {act.cupoMaximo}</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 group-hover:text-indigo-700">
                      Gestionar <ArrowIcon />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
