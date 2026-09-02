'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ActividadDTO } from '@/application/dtos/ActividadDTO';
import { EquipoDTO, UsuarioBusquedaDTO } from '@/application/dtos/EquipoDTO';
import {
  crearEquipoAction,
  actualizarEquipoAction,
  eliminarEquipoAction,
  buscarUsuariosEquipoAction,
  getEquiposAction,
} from '../actions';

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
  if (!tipo) return null;
  const key = tipo.clave?.toLowerCase() ?? tipo.descripcion.toLowerCase();
  const color = TIPO_COLORS[key] ?? 'bg-slate-100 text-slate-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {tipo.descripcion}
    </span>
  );
}

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface IntegranteSeleccionado {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  esRepresentante: boolean;
}

interface Props {
  actividad: ActividadDTO;
  initialEquipos: EquipoDTO[];
}

export default function EquiposManagerClient({ actividad, initialEquipos }: Props) {
  const router = useRouter();
  const [equipos, setEquipos] = useState<EquipoDTO[]>(initialEquipos);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEquipo, setEditingEquipo] = useState<EquipoDTO | null>(null);
  const [eliminandoId, setEliminandoId] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const res = await getEquiposAction(actividad.idActividad);
    if (res.success) setEquipos(res.data);
  }, [actividad.idActividad]);

  function openNew() {
    setEditingEquipo(null);
    setModalOpen(true);
  }

  function openEdit(equipo: EquipoDTO) {
    setEditingEquipo(equipo);
    setModalOpen(true);
  }

  async function handleEliminar(idEquipo: number) {
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return;
    setEliminandoId(idEquipo);
    const res = await eliminarEquipoAction(idEquipo);
    setEliminandoId(null);
    if (res.success) {
      await refresh();
    } else {
      alert(res.error);
    }
  }

  async function handleSave(nombreEquipo: string, integrantes: IntegranteSeleccionado[]) {
    if (editingEquipo) {
      const res = await actualizarEquipoAction(editingEquipo.idEquipo, {
        nombreEquipo,
        integrantes: integrantes.map((i) => ({
          folioRegistro: i.folioRegistro,
          esRepresentante: i.esRepresentante,
        })),
      });
      if (!res.success) {
        alert(res.error);
        return false;
      }
    } else {
      const res = await crearEquipoAction({
        nombreEquipo,
        idActividad: actividad.idActividad,
        integrantes: integrantes.map((i) => ({
          folioRegistro: i.folioRegistro,
          esRepresentante: i.esRepresentante,
        })),
      });
      if (!res.success) {
        alert(res.error);
        return false;
      }
    }
    await refresh();
    setModalOpen(false);
    return true;
  }

  return (
    <div className="p-8 font-sans min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <a
                href="/cpanel/equipos"
                className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Equipos
              </a>
              <span className="text-slate-300">/</span>
              <span className="text-sm text-slate-600 font-medium">{actividad.nombre}</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Gestión de Equipos</h1>
              <TipoBadge tipo={actividad.tipoActividad} />
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {formatFecha(actividad.fechaInicio)} · {equipos.length} equipo{equipos.length !== 1 ? 's' : ''} registrado{equipos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <PlusIcon /> Nuevo Equipo
          </button>
        </div>

        {equipos.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <UsersIcon />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No hay equipos registrados</h3>
            <p className="text-sm text-slate-500 mb-4">
              Crea el primer equipo para esta actividad.
            </p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all"
            >
              <PlusIcon /> Crear equipo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {equipos.map((equipo) => (
              <div
                key={equipo.idEquipo}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold">
                      #{equipo.numeroEquipo}
                    </span>
                    <h3 className="font-bold text-slate-900">{equipo.nombreEquipo}</h3>
                    <span className="text-xs text-slate-400">
                      {equipo.integrantes.length} integrante{equipo.integrantes.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(equipo)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <EditIcon /> Editar
                    </button>
                    <button
                      onClick={() => handleEliminar(equipo.idEquipo)}
                      disabled={eliminandoId === equipo.idEquipo}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <TrashIcon /> {eliminandoId === equipo.idEquipo ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
                <div className="px-6 py-3">
                  <div className="flex flex-wrap gap-2">
                    {equipo.integrantes.map((int) => (
                      <div
                        key={int.folioRegistro}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                          int.esRepresentante
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <span className="font-mono text-[10px] opacity-60">{int.folioRegistro}</span>
                        <span>{int.nombre} {int.apellido}</span>
                        {int.esRepresentante && (
                          <span className="px-1.5 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase">
                            Cap
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <EquipoModal
          actividad={actividad}
          equipo={editingEquipo}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

interface ModalProps {
  actividad: ActividadDTO;
  equipo: EquipoDTO | null;
  onClose: () => void;
  onSave: (nombre: string, integrantes: IntegranteSeleccionado[]) => Promise<boolean>;
}

function EquipoModal({ actividad, equipo, onClose, onSave }: ModalProps) {
  const [nombre, setNombre] = useState(equipo?.nombreEquipo ?? '');
  const [integrantes, setIntegrantes] = useState<IntegranteSeleccionado[]>(
    equipo?.integrantes.map((i) => ({
      folioRegistro: i.folioRegistro,
      nombre: i.nombre,
      apellido: i.apellido,
      esRepresentante: i.esRepresentante,
    })) ?? []
  );
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<UsuarioBusquedaDTO[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function buscar(val: string) {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setResultados([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setBuscando(true);
      const res = await buscarUsuariosEquipoAction(val);
      setBuscando(false);
      if (res.success) {
        const filtrados = res.data.filter(
          (u) => !integrantes.some((i) => i.folioRegistro === u.folioRegistro)
        );
        setResultados(filtrados);
        setShowDropdown(true);
      }
    }, 350);
  }

  function agregarIntegrante(usuario: UsuarioBusquedaDTO) {
    const yaExiste = integrantes.some((i) => i.folioRegistro === usuario.folioRegistro);
    if (yaExiste) return;
    const nuevo: IntegranteSeleccionado = {
      folioRegistro: usuario.folioRegistro,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      esRepresentante: integrantes.length === 0,
    };
    setIntegrantes((prev) => [...prev, nuevo]);
    setQuery('');
    setResultados([]);
    setShowDropdown(false);
  }

  function removerIntegrante(folio: string) {
    setIntegrantes((prev) => {
      const filtered = prev.filter((i) => i.folioRegistro !== folio);
      if (filtered.length > 0 && !filtered.some((i) => i.esRepresentante)) {
        filtered[0].esRepresentante = true;
      }
      return filtered;
    });
  }

  function toggleRepresentante(folio: string) {
    setIntegrantes((prev) =>
      prev.map((i) => ({
        ...i,
        esRepresentante: i.folioRegistro === folio,
      }))
    );
  }

  async function handleSubmit() {
    if (!nombre.trim()) {
      alert('El nombre del equipo es obligatorio');
      return;
    }
    if (integrantes.length === 0) {
      alert('Debe agregar al menos un integrante');
      return;
    }
    setSaving(true);
    const ok = await onSave(nombre.trim(), integrantes);
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {equipo ? `Editar Equipo #${equipo.numeroEquipo}` : 'Nuevo Equipo'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Nombre del equipo <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Ej. Code Warriors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Integrantes <span className="text-rose-500">*</span>
            </label>
            <p className="text-xs text-slate-400">Busca por folio o nombre del participante</p>

            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <SearchIcon />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => buscar(e.target.value)}
                  onFocus={() => resultados.length > 0 && setShowDropdown(true)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Buscar por folio o nombre..."
                />
                {buscando && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                )}
              </div>

              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                  {resultados.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-400 text-center">
                      No se encontraron resultados
                    </div>
                  ) : (
                    resultados.map((u) => (
                      <button
                        key={u.folioRegistro}
                        onClick={() => agregarIntegrante(u)}
                        className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {u.folioRegistro}
                          </span>
                          <span className="text-sm font-medium text-slate-800">
                            {u.nombre} {u.apellido}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-0.5 block">{u.correo}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {integrantes.length > 0 && (
              <div className="space-y-2 mt-3">
                {integrantes.map((int) => (
                  <div
                    key={int.folioRegistro}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
                      int.esRepresentante
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <span className="font-mono text-xs text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {int.folioRegistro}
                    </span>
                    <span className="text-sm font-medium text-slate-800 flex-1">
                      {int.nombre} {int.apellido}
                    </span>
                    <button
                      onClick={() => toggleRepresentante(int.folioRegistro)}
                      className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                        int.esRepresentante
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {int.esRepresentante ? 'Capitán' : 'Miembro'}
                    </button>
                    <button
                      onClick={() => removerIntegrante(int.folioRegistro)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <XIcon />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : equipo ? 'Actualizar' : 'Crear equipo'}
          </button>
        </div>
      </div>
    </div>
  );
}
