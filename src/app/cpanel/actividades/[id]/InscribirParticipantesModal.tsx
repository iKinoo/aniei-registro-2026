'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { InscritoDTO } from '@/application/dtos/ActividadDTO';
import {
  buscarUsuariosInscripcionAction,
  inscribirParticipantesAction,
  type UsuarioInscripcionBusqueda,
} from './actions';

interface Props {
  idActividad: number;
  nombreActividad: string;
  inscritos: InscritoDTO[];
  cupoMaximo: number;
  costo: number;
  onClose: () => void;
  onSuccess: () => void;
}

const inputCls =
  'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

function XIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export default function InscribirParticipantesModal({
  idActividad,
  nombreActividad,
  inscritos,
  cupoMaximo,
  costo,
  onClose,
  onSuccess,
}: Props) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<UsuarioInscripcionBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [erroresPorFolio, setErroresPorFolio] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const solicitudRef = useRef(0);

  const yaInscritos = new Set(inscritos.map((inscrito) => inscrito.folioRegistro));
  const cupoDisponible = cupoMaximo > 0 ? Math.max(cupoMaximo - inscritos.length, 0) : null;

  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const buscar = (valor: string) => {
    setQuery(valor);
    setError('');

    if (debounceRef.current) clearTimeout(debounceRef.current);
    const termino = valor.trim();
    solicitudRef.current += 1;

    if (termino.length < 2) {
      setResultados([]);
      setBuscando(false);
      return;
    }

    const solicitud = solicitudRef.current;
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      const res = await buscarUsuariosInscripcionAction(termino);
      if (solicitud !== solicitudRef.current) return;
      setBuscando(false);
      if (res.success) {
        setResultados(res.data);
      } else {
        setResultados([]);
        setError(res.error);
      }
    }, 350);
  };

  const toggleSeleccion = (folioRegistro: string) => {
    if (yaInscritos.has(folioRegistro)) return;
    setError('');

    const siguiente = new Set(seleccionados);
    if (siguiente.has(folioRegistro)) {
      siguiente.delete(folioRegistro);
      setSeleccionados(siguiente);
      return;
    }

    if (cupoDisponible !== null && siguiente.size >= cupoDisponible) {
      setError(cupoDisponible === 0
        ? 'La actividad no tiene cupo disponible.'
        : cupoDisponible === 1
          ? 'Solo queda 1 lugar disponible.'
          : `Solo quedan ${cupoDisponible} lugares disponibles.`);
      return;
    }

    siguiente.add(folioRegistro);
    setSeleccionados(siguiente);
  };

  const inscribir = () => {
    if (seleccionados.size === 0) return;
    setError('');
    setErroresPorFolio({});

    startTransition(async () => {
      const res = await inscribirParticipantesAction(idActividad, Array.from(seleccionados));
      if (!res.success) {
        setError(res.error);
        return;
      }

      const fallidos = res.resultados.filter((resultado) => !resultado.exito);
      const errores = fallidos.reduce<Record<string, string>>((acumulado, resultado) => {
        acumulado[resultado.folioRegistro] = resultado.error ?? 'No se pudo inscribir al participante';
        return acumulado;
      }, {});
      setErroresPorFolio(errores);

      const exitosos = res.resultados.filter((resultado) => resultado.exito);
      if (exitosos.length > 0) {
        setSeleccionados(new Set(fallidos.map((resultado) => resultado.folioRegistro)));
        onSuccess();
        if (fallidos.length === 0) {
          onClose();
          return;
        }
      }

      if (fallidos.length > 0) {
        setError(
          exitosos.length > 0
            ? `Se inscribieron ${exitosos.length} participante(s), pero ${fallidos.length} no se pudieron inscribir.`
            : 'No se pudo inscribir a los participantes seleccionados.',
        );
      }
    });
  };

  const cerrar = () => {
    if (!isPending) onClose();
  };

  const resultadosVisibles = resultados.map((usuario) => ({
    ...usuario,
    yaInscrito: yaInscritos.has(usuario.folioRegistro),
    seleccionado: seleccionados.has(usuario.folioRegistro),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={cerrar} />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inscribir-participantes-titulo"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 id="inscribir-participantes-titulo" className="text-lg font-bold text-slate-900">
              Inscribir participantes
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">{nombreActividad}</p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            disabled={isPending}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
            aria-label="Cerrar"
          >
            <XIcon />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto">
          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800 space-y-1">
            <p>
              <strong>Cupo:</strong>{' '}
              {cupoDisponible === null
                ? 'sin límite'
                : `${cupoDisponible} de ${cupoMaximo} lugares disponibles`}
            </p>
            <p className="text-xs text-indigo-700">
              La inscripción manual no registra pago ni comprobante. El cupo se descuenta de inmediato.
              {costo > 0 && ` El costo de la actividad es de $${costo.toLocaleString('es-MX')} MXN.`}
            </p>
          </div>

          <div>
            <label htmlFor="buscar-participante" className="block text-sm font-medium text-slate-700 mb-1.5">
              Buscar usuario registrado
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <SearchIcon />
              </span>
              <input
                id="buscar-participante"
                type="text"
                autoFocus
                value={query}
                onChange={(event) => buscar(event.target.value)}
                placeholder="Nombre, apellido, correo o folio"
                className={`${inputCls} pl-9`}
              />
              {buscando && <span className="absolute right-3 top-2.5"><Spinner /></span>}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Escribe al menos 2 caracteres.</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-xl">
              <span className="mt-0.5">⚠</span>
              <span>{error}</span>
            </div>
          )}

          <div className="min-h-[120px]">
            {query.trim().length < 2 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                Busca al usuario que deseas inscribir en esta actividad.
              </p>
            ) : buscando && resultadosVisibles.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Buscando usuarios...</p>
            ) : resultadosVisibles.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No se encontraron usuarios.</p>
            ) : (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto">
                {resultadosVisibles.map((usuario) => {
                  const bloqueado = usuario.yaInscrito || cupoDisponible === 0;
                  const errorFila = erroresPorFolio[usuario.folioRegistro];
                  return (
                    <div key={usuario.folioRegistro} className={`px-4 py-3 ${bloqueado ? 'bg-slate-50' : 'hover:bg-indigo-50/50'}`}>
                      <label className={`flex items-center gap-3 ${bloqueado ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={usuario.seleccionado}
                          disabled={bloqueado}
                          onChange={() => toggleSeleccion(usuario.folioRegistro)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-800 truncate">
                            {usuario.nombre} {usuario.apellido}
                          </span>
                          <span className="block text-xs text-slate-500 truncate">
                            {usuario.correo} · {usuario.folioRegistro}
                          </span>
                        </span>
                        {usuario.yaInscrito && (
                          <span className="shrink-0 inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-600">
                            Ya inscrito
                          </span>
                        )}
                      </label>
                      {errorFila && <p className="mt-1.5 ml-7 text-xs text-rose-600">{errorFila}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-sm text-slate-600">
            {seleccionados.size === 0 ? 'Ningún participante seleccionado' : `${seleccionados.size} seleccionado(s)`}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={cerrar}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={inscribir}
              disabled={isPending || seleccionados.size === 0 || cupoDisponible === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isPending && <Spinner />}
              {isPending ? 'Inscribiendo...' : `Inscribir (${seleccionados.size})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
