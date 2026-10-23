'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getGruposAdminAction } from './actions';
import { obtenerUrlArchivoAction } from '@/app/cpanel/actions';
import type { GrupoForAdminDTO } from '@/application/dtos/GrupoForAdminDTO';
import type { PaginatedResult } from '@/application/dtos/PaginatedResult';
import { extraerRutaArchivo } from '@/shared/utils/archivos';

const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface Props {
  initialData: PaginatedResult<GrupoForAdminDTO> | null;
  initialError: string | null;
}

export function GruposAdminClient({ initialData, initialError }: Props) {
  const router = useRouter();
  const [grupos, setGrupos] = useState<GrupoForAdminDTO[]>(initialData?.data ?? []);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(initialData?.total ?? 0);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loadingArchivo, setLoadingArchivo] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(initialError);
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    if (search === debouncedSearch) return;
    const handler = setTimeout(() => {
      setLoading(true);
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search, debouncedSearch]);

  useEffect(() => {
    let activo = true;
    getGruposAdminAction(page, limit, debouncedSearch).then(result => {
      if (!activo) return;
      if (result.success && result.data) {
        setGrupos(result.data.data);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
        setError(null);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Error al cargar grupos:', err);
      if (activo) {
        setError('No se pudieron cargar los grupos. Intenta de nuevo.');
        setLoading(false);
      }
    });
    return () => { activo = false; };
  }, [page, limit, debouncedSearch, recarga]);

  const handleVerComprobante = async (grupo: GrupoForAdminDTO) => {
    if (!grupo.deposito) return;
    setLoadingArchivo(grupo.id);
    try {
      const result = await obtenerUrlArchivoAction(extraerRutaArchivo(grupo.deposito.archivoRuta));
      if (result.success) {
        window.open(result.url, '_blank', 'noopener,noreferrer');
      } else {
        alert('No se pudo acceder al comprobante: ' + result.error);
      }
    } catch {
      alert('No se pudo abrir el comprobante. Intenta de nuevo.');
    } finally {
      setLoadingArchivo(null);
    }
  };

  return (
    <div className="p-4 sm:p-8 font-sans">
      <div className="relative max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <Link href="/cpanel/usuarios" className="text-sm text-slate-300 hover:text-white mb-2 inline-block">
              ← Volver a usuarios
            </Link>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Grupos Registrados</h1>
            <p className="text-slate-300 mt-1">Consulta los registros grupales, sus integrantes y depósitos asociados.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  aria-label="Buscar grupos por integrante, correo o folio"
                  maxLength={200}
                  placeholder="Buscar por integrante, correo o folio..."
                  className="pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-slate-800 placeholder-slate-400 w-48 sm:w-64 md:w-80 outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl shadow-xl border border-slate-100 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-5xl w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Grupo</th>
                  <th className="px-6 py-4 font-semibold">Registró</th>
                  <th className="px-6 py-4 font-semibold">Integrantes</th>
                  <th className="px-6 py-4 font-semibold">Depósito Asociado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span>Cargando grupos...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <p role="alert" className="text-red-700">{error}</p>
                      <button
                        onClick={() => { setLoading(true); setRecarga((valor) => valor + 1); }}
                        className="mt-3 text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Reintentar
                      </button>
                    </td>
                  </tr>
                ) : grupos.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron grupos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  grupos.map((grupo) => (
                    <GrupoFila
                      key={grupo.id}
                      grupo={grupo}
                      expanded={expandedId === grupo.id}
                      onToggle={() => setExpandedId(expandedId === grupo.id ? null : grupo.id)}
                      onVerComprobante={() => handleVerComprobante(grupo)}
                      cargandoComprobante={loadingArchivo === grupo.id}
                      onVerResponsable={() => router.push(`/cpanel/usuarios/${grupo.responsable.folioRegistro}`)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-sm text-slate-600">
              <span>
                Mostrando <span className="font-semibold">{grupos.length}</span> de <span className="font-semibold">{total}</span> grupos
              </span>
              <span className="mx-4">|</span>
              <label htmlFor="limit" className="mr-2">Mostrar:</label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => {
                  setLoading(true);
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="bg-white border border-slate-300 text-slate-900 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={40}>40</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex flex-row space-x-2">
              <button
                onClick={() => { setLoading(true); setPage((p) => Math.max(1, p - 1)); }}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <div className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg">
                Página {page} de {totalPages || 1}
              </div>
              <button
                onClick={() => { setLoading(true); setPage((p) => Math.min(totalPages, p + 1)); }}
                disabled={page >= totalPages || loading}
                className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GrupoFila({
  grupo,
  expanded,
  onToggle,
  onVerComprobante,
  cargandoComprobante,
  onVerResponsable,
}: {
  grupo: GrupoForAdminDTO;
  expanded: boolean;
  onToggle: () => void;
  onVerComprobante: () => void;
  cargandoComprobante: boolean;
  onVerResponsable: () => void;
}) {
  return (
    <>
      <tr className="hover:bg-slate-50/80 transition-colors duration-150">
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">Grupo #{grupo.id}</span>
            <span className="text-slate-400 text-xs">
              {new Date(grupo.fechaRegistro).toLocaleDateString('es-MX')}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex flex-col">
            <span className="font-medium text-slate-900">{grupo.responsable.nombreCompleto}</span>
            <span className="text-slate-500 text-xs">{grupo.responsable.correo}</span>
            <span className="text-slate-400 text-xs">{grupo.responsable.folioRegistro}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <button
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={`miembros-grupo-${grupo.id}`}
            className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-md hover:bg-indigo-100 transition-colors"
          >
            {grupo.miembros.length} {grupo.miembros.length === 1 ? 'miembro' : 'miembros'} <ChevronIcon open={expanded} />
          </button>
        </td>
        <td className="px-6 py-4">
          {grupo.deposito ? (
            <div className="flex flex-col gap-1">
              <span className="font-medium text-emerald-600">
                ${Number(grupo.deposito.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
              <span className="text-slate-500 text-xs">Ref: {grupo.deposito.referencia}</span>
              <span className="text-slate-400 text-xs">
                {new Date(grupo.deposito.fecha).toLocaleDateString('es-MX')}
              </span>
              <span className="text-slate-500 text-xs break-all">{grupo.deposito.archivoNombre}</span>
            </div>
          ) : (
            <span className="text-slate-400 text-sm italic">Sin depósito asociado</span>
          )}
        </td>
        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap overflow-visible">
          {grupo.deposito && (
            <button
              onClick={onVerComprobante}
              disabled={cargandoComprobante}
              className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              <EyeIcon /> {cargandoComprobante ? 'Cargando...' : 'Ver Comprobante'}
            </button>
          )}
          <button
            onClick={onVerResponsable}
            className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Ver Responsable
          </button>
        </td>
      </tr>
      {expanded && (
        <tr id={`miembros-grupo-${grupo.id}`} className="bg-slate-50/50">
          <td colSpan={5} className="px-6 py-4">
            <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Integrantes del grupo</p>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Folio</th>
                    <th className="px-4 py-2 font-semibold">Nombre</th>
                    <th className="px-4 py-2 font-semibold">Correo</th>
                    <th className="px-4 py-2 font-semibold">Carrera</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grupo.miembros.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-4 text-slate-500">Este grupo no tiene miembros registrados.</td>
                    </tr>
                  )}
                  {grupo.miembros.map((miembro) => (
                    <tr key={miembro.folioRegistro}>
                      <td className="px-4 py-2">
                        <Link
                          href={`/cpanel/usuarios/${miembro.folioRegistro}`}
                          className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          {miembro.folioRegistro}
                        </Link>
                      </td>
                      <td className="px-4 py-2 text-slate-900">{miembro.nombreCompleto}</td>
                      <td className="px-4 py-2 text-slate-600">{miembro.correo}</td>
                      <td className="px-4 py-2 text-slate-600">{miembro.carrera ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
