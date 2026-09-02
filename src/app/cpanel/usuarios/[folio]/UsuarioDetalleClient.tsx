'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DepositoHistorialItem } from '@/app/components/HistorialDepositos';
import { HistorialDepositosAdmin } from '@/app/components/HistorialDepositosAdmin';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { eliminarUsuarioAction, reenviarConstanciaAction, obtenerUrlArchivoAction } from '@/app/cpanel/actions';

interface UsuarioData {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  lada: string | null;
  extension: string | null;
  genero: string | null;
  carrera: string | null;
  dependencia: string | null;
  institucion: string | null;
  institucionExterna: string | null;
  titulo: string | null;
  estado: string | null;
  fechaRegistro: Date | null;
}

interface FacturacionData {
  razonSocial: string;
  rfc: string;
  calle: string | null;
  numExterior: string | null;
  numInterior: string | null;
  colonia: string | null;
  municipio: string | null;
  codigoPostal: string | null;
  constanciaUrl: string | null;
  constanciaNombre: string | null;
}

interface InscripcionData {
  idInscripcion: number;
  idActividad: number | null;
  nombreActividad: string;
  tipoActividad: string;
  fechaInscripcion: Date;
  urlConstancia: string | null;
}

interface Props {
  usuario: UsuarioData;
  depositos: DepositoHistorialItem[];
  facturacion: FacturacionData | null;
  inscripciones: InscripcionData[];
}

export function UsuarioDetalleClient({ usuario, depositos, facturacion, inscripciones }: Props) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingConstancia, setLoadingConstancia] = useState(false);
  const [loadingConstanciaFiscal, setLoadingConstanciaFiscal] = useState(false);
  const [loadingActivityConstancia, setLoadingActivityConstancia] = useState<number | null>(null);
  const [resending, setResending] = useState(false);

  const handleEliminar = async () => {
    setIsDeleting(true);
    const result = await eliminarUsuarioAction(usuario.folioRegistro);
    setIsDeleting(false);
    if (result.success) {
      setDeleteDialog(false);
      router.push('/cpanel');
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  const handleVerConstanciaGeneral = async () => {
    setLoadingConstancia(true);
    try {
      const ruta = `constancias/${usuario.folioRegistro}.pdf`;
      const result = await obtenerUrlArchivoAction(ruta);
      if (result.success) {
        window.open(result.url, '_blank');
      } else {
        alert('No se pudo acceder a la constancia: ' + result.error);
      }
    } finally {
      setLoadingConstancia(false);
    }
  };

  const handleVerConstanciaFiscal = async () => {
    if (!facturacion?.constanciaUrl) return;
    setLoadingConstanciaFiscal(true);
    try {
      const result = await obtenerUrlArchivoAction(facturacion.constanciaUrl);
      if (result.success) {
        window.open(result.url, '_blank');
      } else {
        alert('No se pudo acceder a la constancia fiscal: ' + result.error);
      }
    } finally {
      setLoadingConstanciaFiscal(false);
    }
  };

  const handleVerConstanciaActividad = async (urlConstancia: string, idInscripcion: number) => {
    setLoadingActivityConstancia(idInscripcion);
    try {
      const result = await obtenerUrlArchivoAction(urlConstancia);
      if (result.success) {
        window.open(result.url, '_blank');
      } else {
        alert('No se pudo acceder a la constancia: ' + result.error);
      }
    } finally {
      setLoadingActivityConstancia(null);
    }
  };

  const handleReenviarCorreo = async () => {
    if (!confirm('¿Reenviar la constancia de registro a este usuario?')) return;
    setResending(true);
    try {
      const result = await reenviarConstanciaAction(usuario.folioRegistro);
      if (result.success) {
        alert('Constancia reenviada exitosamente');
      } else {
        alert('Error: ' + result.error);
      }
    } finally {
      setResending(false);
    }
  };

  const nombreCompleto = `${usuario.nombre} ${usuario.apellido}`;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/cpanel" className="text-sm text-slate-500 hover:text-slate-800 mb-2 inline-block">
            Volver al panel
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{nombreCompleto}</h1>
          <p className="text-slate-500 text-sm mt-1">
            Folio: <span className="font-mono font-medium text-slate-700">{usuario.folioRegistro}</span> · {usuario.correo}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-100">
            {usuario.titulo || 'Sin titulo'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/cpanel/usuarios/${usuario.folioRegistro}/editar`)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Editar
            </button>
            <button
              type="button"
              onClick={() => setDeleteDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Eliminar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Datos registrados</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Nombre</span>
            <p className="text-slate-700 font-medium">{usuario.nombre}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Apellido</span>
            <p className="text-slate-700 font-medium">{usuario.apellido}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Correo</span>
            <p className="text-slate-700 font-medium">{usuario.correo}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Telefono</span>
            <p className="text-slate-700 font-medium">{usuario.lada ? `+${usuario.lada} ` : ''}{usuario.telefono || '—'}{usuario.extension ? ` ext. ${usuario.extension}` : ''}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Genero</span>
            <p className="text-slate-700 font-medium">
              {usuario.genero === 'M' ? 'Masculino' : usuario.genero === 'F' ? 'Femenino' : usuario.genero === 'O' ? 'Otro' : '—'}
            </p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Carrera</span>
            <p className="text-slate-700 font-medium">{usuario.carrera || '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Dependencia</span>
            <p className="text-slate-700 font-medium">{usuario.dependencia || '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Institucion</span>
            <p className="text-slate-700 font-medium">{usuario.institucion || usuario.institucionExterna || '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Estado</span>
            <p className="text-slate-700 font-medium">{usuario.estado || '—'}</p>
          </div>
          <div>
            <span className="text-slate-400 text-xs uppercase tracking-wider">Registrado el</span>
            <p className="text-slate-700 font-medium">
              {usuario.fechaRegistro
                ? new Date(usuario.fechaRegistro).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Constancia del evento</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handleVerConstanciaGeneral}
              disabled={loadingConstancia}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {loadingConstancia ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
              Ver constancia
            </button>
            <button
              onClick={handleReenviarCorreo}
              disabled={resending}
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-transparent shadow-sm text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {resending ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              Reenviar correo
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Constancia de inscripcion al congreso ANIEI 2026. Usa &quot;Reenviar correo&quot; para enviar una copia al correo del usuario.
        </p>
      </div>

      {facturacion && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Datos de facturacion</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm mb-4">
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">Razon social</span>
              <p className="text-slate-700 font-medium">{facturacion.razonSocial}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">RFC</span>
              <p className="text-slate-700 font-medium font-mono">{facturacion.rfc}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">Calle</span>
              <p className="text-slate-700 font-medium">
                {facturacion.calle || '—'}{facturacion.numExterior ? ` #${facturacion.numExterior}` : ''}{facturacion.numInterior ? ` Int. ${facturacion.numInterior}` : ''}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">Colonia</span>
              <p className="text-slate-700 font-medium">{facturacion.colonia || '—'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">Municipio</span>
              <p className="text-slate-700 font-medium">{facturacion.municipio || '—'}</p>
            </div>
            <div>
              <span className="text-slate-400 text-xs uppercase tracking-wider">Codigo postal</span>
              <p className="text-slate-700 font-medium">{facturacion.codigoPostal || '—'}</p>
            </div>
          </div>
          {facturacion.constanciaUrl && (
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Constancia de situacion fiscal</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleVerConstanciaFiscal}
                  disabled={loadingConstanciaFiscal}
                  className="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-200 shadow-sm text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {loadingConstanciaFiscal ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  {facturacion.constanciaNombre || 'Ver archivo'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Historial de depositos
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {depositos.length}
          </span>
        </h2>
        <HistorialDepositosAdmin depositos={depositos} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-4">
          Actividades inscritas
          <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {inscripciones.length}
          </span>
        </h2>
        {inscripciones.length === 0 ? (
          <p className="text-sm text-slate-400 italic">El usuario no esta inscrito en ninguna actividad.</p>
        ) : (
          <div className="space-y-3">
            {inscripciones.map((insc) => (
              <div key={insc.idInscripcion} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-medium text-slate-900">{insc.nombreActividad}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {insc.tipoActividad} · Inscrito el{' '}
                    {new Date(insc.fechaInscripcion).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  {insc.urlConstancia ? (
                    <button
                      onClick={() => handleVerConstanciaActividad(insc.urlConstancia!, insc.idInscripcion)}
                      disabled={loadingActivityConstancia === insc.idInscripcion}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 shadow-sm text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                      {loadingActivityConstancia === insc.idInscripcion ? (
                        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      Ver constancia
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Sin constancia</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog}
        title="Eliminar usuario"
        message={`¿Estas seguro de que deseas eliminar al usuario "${nombreCompleto}"? Esta accion no se puede deshacer y eliminara todos sus datos, incluyendo depositos e inscripciones.`}
        confirmText="Si, eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onCancel={() => setDeleteDialog(false)}
      />
    </div>
  );
}
