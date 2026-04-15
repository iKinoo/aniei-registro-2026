'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { PonenteDTO } from '@/application/dtos/ActividadDTO';
import {
  buscarUsuariosAction,
  vincularPonenteAction,
  desvincularPonenteAction,
  registrarPonenteAction,
  UsuarioBusquedaResult,
} from './ponentes.actions';

const inputCls = 'w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

// ---- Modal de registro rápido de ponente ----
interface ModalRegistroProps {
  idActividad: number;
  rol: string;
  onSuccess: (ponente: PonenteDTO) => void;
  onClose: () => void;
}

function ModalRegistroPonente({ idActividad, rol, onSuccess, onClose }: ModalRegistroProps) {
  const [form, setForm] = useState({ nombre: '', apellido: '', correo: '' });
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre.trim() || !form.apellido.trim() || !form.correo.trim()) {
      setError('Nombre, apellido y correo son obligatorios.');
      return;
    }
    setError('');
    startTransition(async () => {
      const res = await registrarPonenteAction(
        { nombre: form.nombre, apellido: form.apellido, correo: form.correo },
        idActividad,
        rol,
      );
      if (!res.success) { setError(res.error); return; }
      onSuccess({
        idUsuario: res.idUsuario,
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        rol: rol || 'Ponente',
      });
    });
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-white font-bold text-lg">Registrar nuevo ponente</h3>
            <p className="text-indigo-200 text-xs mt-0.5">Se enviará un correo con acceso al sistema</p>
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Nombre <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre(s)" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Apellido <span className="text-rose-500">*</span></label>
              <input className={inputCls} value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} placeholder="Apellido(s)" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Correo electrónico <span className="text-rose-500">*</span></label>
            <input className={inputCls} type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} placeholder="correo@ejemplo.com" />
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs px-3 py-2 rounded-lg">
            ⚠ Se creará la cuenta y se enviará un correo al ponente indicando que su información de pago está <strong>pendiente</strong>.
          </div>

          {error && <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg transition">Cancelar</button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {isPending ? 'Registrando...' : 'Registrar y vincular'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- Componente principal ----
interface Props {
  idActividad: number | null; // null = nueva actividad, aún no guardada
  ponentesIniciales: PonenteDTO[];
  onChange?: (ponentes: PonenteDTO[]) => void; // para nueva actividad (sin persistir todavía)
}

export function SeccionPonentes({ idActividad, ponentesIniciales, onChange }: Props) {
  const [ponentes, setPonentes] = useState<PonenteDTO[]>(ponentesIniciales);
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<UsuarioBusquedaResult[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [showRegistro, setShowRegistro] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Sincronizar ponentes iniciales cuando cambia la actividad (al abrir edición)
  useEffect(() => { setPonentes(ponentesIniciales); }, [ponentesIniciales]);

  function notifyChange(updated: PonenteDTO[]) {
    setPonentes(updated);
    onChange?.(updated);
  }

  function buscar(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) { setResultados([]); return; }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      const res = await buscarUsuariosAction(val);
      setBuscando(false);
      if (res.success) setResultados(res.data);
    }, 350);
  }

  function handleAnadir(u: UsuarioBusquedaResult) {
    setError('');
    startTransition(async () => {
      const rolInicial = 'Ponente';
      if (idActividad != null) {
        const res = await vincularPonenteAction(idActividad, u.idUsuario, rolInicial);
        if (!res.success) { setError(res.error ?? 'Error al vincular'); return; }
      }
      const nuevo: PonenteDTO = {
        idUsuario: u.idUsuario,
        nombre: u.nombre,
        apellido: u.apellido,
        correo: u.correo,
        rol: rolInicial,
      };
      const actualizado = ponentes.find((p) => p.idUsuario === u.idUsuario)
        ? ponentes
        : [...ponentes, nuevo];
      notifyChange(actualizado);
      setQuery('');
      setResultados([]);
    });
  }

  function handleQuitar(idUsuario: number) {
    startTransition(async () => {
      if (idActividad != null) {
        await desvincularPonenteAction(idActividad, idUsuario);
      }
      notifyChange(ponentes.filter((p) => p.idUsuario !== idUsuario));
    });
  }

  function handleRegistroExitoso(ponente: PonenteDTO) {
    setShowRegistro(false);
    const actualizado = ponentes.find((p) => p.idUsuario === ponente.idUsuario)
      ? ponentes
      : [...ponentes, ponente];
    notifyChange(actualizado);
    setQuery('');
    setResultados([]);
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-slate-700">Ponentes</label>

      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => buscar(e.target.value)}
          placeholder="Buscar por nombre, apellido o correo..."
          className={inputCls}
        />
        {buscando && (
          <div className="absolute right-3 top-2.5">
            <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        )}

        {/* Dropdown de resultados */}
        {resultados.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 overflow-hidden">
            {resultados.map((r) => (
              <button
                key={r.idUsuario}
                type="button"
                onClick={() => handleAnadir(r)}
                className={`w-full text-left px-4 py-3 text-sm hover:bg-indigo-50 transition-colors flex justify-between items-center`}
              >
                <span className="font-medium text-slate-800">{r.nombre} {r.apellido}</span>
                <span className="text-slate-400 text-xs truncate max-w-[180px]">{r.correo}</span>
              </button>
            ))}
            <div className="border-t border-slate-100 px-4 py-2.5 flex justify-between items-center bg-slate-50">
              <span className="text-xs text-slate-500">¿No está en la lista?</span>
              <button
                type="button"
                onClick={() => { setResultados([]); setShowRegistro(true); }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                + Registrar nuevo ponente
              </button>
            </div>
          </div>
        )}

        {/* Sin resultados */}
        {query.trim().length >= 2 && resultados.length === 0 && !buscando && (
          <div className=" top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 px-4 py-3">
            <p className="text-sm text-slate-500">No se encontraron usuarios.</p>
            <button
              type="button"
              onClick={() => { setResultados([]); setShowRegistro(true); }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-1 transition-colors"
            >
              + Registrar nuevo ponente
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-600">{error}</p>}

      {/* Lista de ponentes añadidos */}
      {ponentes.length > 0 && (
        <div className="space-y-1.5">
          {ponentes.map((p) => (
            <div key={p.idUsuario} className="flex items-center justify-between px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {p.nombre[0]}{p.apellido[0]}
                </div>
                <div className="min-w-0 flex flex-col">
                  <p className="text-sm font-semibold text-slate-800 leading-tight">{p.nombre} {p.apellido}</p>
                  <input
                    type="text"
                    value={p.rol ?? 'Ponente'}
                    onChange={(e) => {
                      const actualizados = ponentes.map(x => x.idUsuario === p.idUsuario ? { ...x, rol: e.target.value } : x);
                      notifyChange(actualizados);
                    }}
                    onBlur={(e) => {
                      if (idActividad != null) {
                        startTransition(async () => {
                           await vincularPonenteAction(idActividad, p.idUsuario, e.target.value || 'Ponente');
                        });
                      }
                    }}
                    placeholder="Ponente"
                    className="text-xs text-slate-500 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-indigo-500 max-w-[140px] px-0.5 py-0.5 mt-0.5"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuitar(p.idUsuario)}
                disabled={isPending}
                className="text-slate-400 hover:text-rose-500 transition-colors ml-2 shrink-0"
                aria-label="Quitar ponente"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sub-modal de registro */}
      {showRegistro && (
        <ModalRegistroPonente
          idActividad={idActividad ?? 0}
          rol={'Ponente'}
          onSuccess={handleRegistroExitoso}
          onClose={() => setShowRegistro(false)}
        />
      )}
    </div>
  );
}
