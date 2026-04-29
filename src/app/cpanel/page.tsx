'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUsuariosAdminAction, reenviarConstanciaAction, obtenerUrlArchivoAction } from './actions';
import { UsuarioForAdminDTO } from '@/application/dtos/UsuarioForAdminDTO';

// Icon components
const SearchIcon = () => (
  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const FileIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="animate-spin mr-1 h-4 w-4 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function AdminPanel() {
  const [usuarios, setUsuarios] = useState<UsuarioForAdminDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    const result = await getUsuariosAdminAction(page, limit, debouncedSearch);
    if (result.success && result.data) {
      setUsuarios(result.data.data);
      setTotal(result.data.total);
      setTotalPages(result.data.totalPages);
    } else {
      console.error(result.error);
    }
    setLoading(false);
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handler for resending confirmation
  const handleResend = async (folioRegistro: string) => {
    if (!confirm('¿Estás seguro de que deseas reenviar la constancia de registro a este usuario?')) return;

    // Optimistic UI could go here, but since it's an email, better to wait
    const result = await reenviarConstanciaAction(folioRegistro);
    if (result.success) {
      alert('Constancia reenviada exitosamente 🎉');
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleVerArchivo = async (folioRegistro: string, ruta: string) => {
    setLoadingFiles(prev => ({ ...prev, [folioRegistro]: true }));
    setFileErrors(prev => { const next = { ...prev }; delete next[folioRegistro]; return next; });

    const result = await obtenerUrlArchivoAction(ruta);
    
    setLoadingFiles(prev => { const next = { ...prev }; delete next[folioRegistro]; return next; });

    if (result.success) {
      window.open(result.url, '_blank');
    } else {
      setFileErrors(prev => ({ ...prev, [folioRegistro]: result.error }));
      setTimeout(() => {
        setFileErrors(prev => { const next = { ...prev }; delete next[folioRegistro]; return next; });
      }, 4000);
    }
  };

  return (
    <div className="p-8 font-sans">
      <div className="relative  max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Panel de Administración</h1>
            <p className="text-slate-500 mt-1">Gestiona los registros, verifica depósitos y reenvía constancias.</p>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre, correo..."
                className="pl-10 pr-4 py-2 bg-transparent border-none focus:ring-0 text-sm text-slate-800 placeholder-slate-400 w-64 md:w-80 outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="  w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Usuario</th>
                  <th className="px-6 py-4 font-semibold">Institución</th>
                  <th className="px-6 py-4 font-semibold">Detalle Depósito</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex justify-center flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span>Cargando usuarios...</span>
                      </div>
                    </td>
                  </tr>
                ) : usuarios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((user) => (
                    <tr key={user.folioRegistro} className=" hover:bg-slate-50/80 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">{user.nombreCompleto}</span>
                          <span className="text-slate-500 text-xs mt-0.5">{user.correo}</span>
                          {user.telefono && <span className="text-slate-400 text-xs">{user.telefono}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md">
                          {user.institucion}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.deposito ? (
                          <div className="flex flex-col gap-1">
                            <span className="font-medium text-emerald-600">
                              ${Number(user.deposito.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                            </span>
                            <span className="text-slate-500 text-xs">Ref: {user.deposito.referencia}</span>
                            <span className="text-slate-400 text-xs">
                              {new Date(user.deposito.fecha).toLocaleDateString('es-MX')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-sm italic">Sin depósito asociado</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">{user.tipoUsuario}</span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap overflow-visible">
                        {user.deposito?.archivo?.ruta && (
                          <div className="inline-flex flex-col items-center">
                            <button
                              onClick={() => handleVerArchivo(user.folioRegistro, user.deposito!.archivo.ruta)}
                              disabled={loadingFiles[user.folioRegistro]}
                              className="inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {loadingFiles[user.folioRegistro] ? <SpinnerIcon /> : <FileIcon />} Ver Archivo
                            </button>
                            {fileErrors[user.folioRegistro] && (
                              <div 
                                className="absolute  z-50 w-48 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg shadow-sm border border-red-200 whitespace-normal text-left transition-all duration-300"
                              >
                                {fileErrors[user.folioRegistro]}
                              </div>
                            )}
                          </div>
                        )}
                        <button
                          onClick={() => handleResend(user.folioRegistro)}
                          className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                          <SendIcon /> Reenviar Correo
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-sm text-slate-600">
              <span>
                Mostrando <span className="font-semibold">{usuarios.length}</span> de <span className="font-semibold">{total}</span> registros
              </span>
              <span className="mx-4">|</span>
              <label htmlFor="limit" className="mr-2">Mostrar:</label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => {
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
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <div className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg">
                Página {page} de {totalPages || 1}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
