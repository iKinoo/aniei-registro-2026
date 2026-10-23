'use client';

import { useEffect, useRef, useState } from 'react';

type Estado = 'inactivo' | 'generando' | 'preparando';

const TEXTOS: Record<Estado, string> = {
  inactivo: 'Descargar base de datos',
  generando: 'Generando respaldo…',
  preparando: 'Preparando descarga…',
};

function nombreDesdeDisposicion(disposicion: string | null): string {
  const coincidencia = /filename="?([^";]+)"?/i.exec(disposicion ?? '');
  const nombre = coincidencia?.[1]?.replace(/["\r\n]/g, '').trim();
  return nombre && nombre.length > 0 ? nombre : 'aniei-bd.sql.gz';
}

export default function DescargarBaseDatosClient() {
  const [estado, setEstado] = useState<Estado>('inactivo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exitoMsg, setExitoMsg] = useState<string | null>(null);
  const controlRef = useRef<AbortController | null>(null);
  const montadoRef = useRef(true);

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      controlRef.current?.abort();
    };
  }, []);

  async function manejarDescarga() {
    if (controlRef.current) return;
    setErrorMsg(null);
    setExitoMsg(null);
    setEstado('generando');

    const control = new AbortController();
    controlRef.current = control;
    try {
      const respuesta = await fetch('/api/admin/base-datos/exportar', { method: 'POST', signal: control.signal });

      if (!respuesta.ok) {
        let mensaje = 'No se pudo generar el respaldo. Inténtalo de nuevo.';
        try {
          const cuerpo = (await respuesta.json()) as { error?: string };
          if (typeof cuerpo.error === 'string' && cuerpo.error.length > 0) mensaje = cuerpo.error;
          if (respuesta.status === 401) mensaje = 'La sesión expiró. Inicia sesión novamente.';
        } catch {
          /* la respuesta no trajo un mensaje útil */
        }
        setErrorMsg(mensaje);
        return;
      }

      const tipoContenido = respuesta.headers.get('content-type') ?? '';
      if (!tipoContenido.includes('application/gzip')) {
        setErrorMsg('El servidor no devolvió un respaldo válido. Verifica tu sesión e inténtalo de nuevo.');
        return;
      }

      setEstado('preparando');
      const nombre = nombreDesdeDisposicion(respuesta.headers.get('content-disposition'));
      const blob = await respuesta.blob();
      const url = URL.createObjectURL(blob);
      try {
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = nombre;
        document.body.appendChild(enlace);
        enlace.click();
        enlace.remove();
      } finally {
        URL.revokeObjectURL(url);
      }
      setExitoMsg('Descarga iniciada');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorMsg('No se pudo generar el respaldo. Inténtalo de nuevo.');
    } finally {
      controlRef.current = null;
      if (montadoRef.current) setEstado('inactivo');
    }
  }

  const ocupado = estado !== 'inactivo';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
        <h2 className="text-base font-semibold text-slate-900">Base de datos</h2>
        <p className="mt-1 text-sm text-slate-500">
          Descarga la estructura y los datos de la base de datos en un archivo SQL comprimido.
        </p>
      </div>

      <div className="p-6 space-y-4">
        {exitoMsg && (
          <div role="status" className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm text-emerald-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {exitoMsg}
          </div>
        )}

        {errorMsg && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 text-sm text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {errorMsg}
          </div>
        )}

        <button
          type="button"
          onClick={manejarDescarga}
          disabled={ocupado}
          aria-busy={ocupado}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {ocupado ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {TEXTOS[estado]}
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {TEXTOS.inactivo}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
