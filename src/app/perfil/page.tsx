import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getRegistroQueryService } from '@/infrastructure/config/container';
import { ConsultarRegistros } from '@/application/use-cases/ConsultarRegistros';
import { HistorialDepositosUsuario } from '@/app/components/HistorialDepositosUsuario';
import AutoLogout from './AutoLogout';
import { CerrarSesionButton } from './CerrarSesionButton';
import styles from './page.module.css';

export const metadata = { title: 'Mi Perfil | ANIEI 2026' };

export default async function PerfilPage() {
  const session = await auth();

  const folioRegistro = session?.user?.folioRegistro;
  if (!folioRegistro) {
    redirect('/login');
  }

  const perfil = await new ConsultarRegistros(getRegistroQueryService()).obtenerPerfil(folioRegistro);
  if (!perfil) return <AutoLogout />;
  const { usuario, inscripciones, depositos, equipos } = perfil;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.headerSub}>Congreso ANIEI 2026</p>
            <h1 className={styles.title}>Mi Perfil</h1>
          </div>
          <div className={styles.folioBadge}>{usuario.folioRegistro || 'Sin folio'}</div>
        </div>

        <div className={styles.content}>
          <div className={styles.sectionTitle}>Datos Personales</div>
          <div className={styles.grid}>
            <div className={styles.field}>
              <span className={styles.label}>Nombre completo</span>
              <span className={styles.value}>{usuario.nombre} {usuario.apellido}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Correo Electrónico</span>
              <span className={styles.value}>{usuario.correo}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Institución</span>
              <span className={styles.value}>{usuario.institucion?.nombre || 'N/A'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Fecha de Registro</span>
              <span className={styles.value}>
                {usuario.fechaRegistro
                  ? new Date(usuario.fechaRegistro).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
            
          <div className={styles.sectionTitle}>
            Mis Actividades
            <span className={styles.actividadesBadge}>{inscripciones.length}</span>
          </div>

          {inscripciones.length === 0 ? (
            <div className={styles.emptyActividades}>
              <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Aún no te has inscrito a actividades.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                <a href="/actividades/talleres" className={styles.btnActividades}>
                  Talleres
                </a>
                <a href="/actividades/concursos" className={styles.btnActividades}>
                  Concursos
                </a>
                <a href="/actividades/actividades" className={styles.btnActividades}>
                  Actividades
                </a>
              </div>
            </div>
          ) : (
            <div className={styles.actividadesList}>
              {inscripciones.map((insc) => {
                const act = insc.actividad;
                if (!act) return null;
                return (
                  <div key={insc.idInscripcion} className={styles.actividadCard}>
                    <div className={styles.actividadTop}>
                      {act.tipoActividad && (
                        <span className={styles.tipoBadge}>
                          {act.tipoActividad.descripcion}
                        </span>
                      )}
                      <span className={styles.tipoBadge}>
                        {act.modalidad === 'VIRTUAL' ? 'Virtual' : 'Presencial'}
                      </span>
                      {act.costo && Number(act.costo) > 0 ? (
                        <span className={styles.costoBadge}>
                          ${Number(act.costo).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      ) : (
                        <span className={styles.gratisBadge}>Gratis</span>
                      )}
                    </div>
                    <h3 className={styles.actividadNombre}>{act.nombre}</h3>
                    <div className={styles.actividadMeta}>
                      <span className={styles.metaItem}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span style={{ display: 'flex', flexDirection: 'column' }}>
                          {(act.horarios.length > 0 ? act.horarios : [{ fechaInicio: act.fechaInicio, fechaFin: act.fechaFin }]).map((h, i) => (
                            <span key={i}>
                              {new Date(h.fechaInicio).toLocaleDateString('es-MX', {
                                day: '2-digit', month: 'short', year: 'numeric',
                              })} · {new Date(h.fechaInicio).toLocaleTimeString('es-MX', {
                                hour: '2-digit', minute: '2-digit',
                              })}–{new Date(h.fechaFin).toLocaleTimeString('es-MX', {
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </span>
                          ))}
                        </span>
                      </span>
                      {act.institucion && (
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {act.institucion.abreviatura ?? act.institucion.nombre}
                          {act.sala && ` · ${act.sala}`}
                        </span>
                      )}
                      {act.modalidad === 'VIRTUAL' && act.enlaceSesion && (
                        <a
                          href={act.enlaceSesion}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnUnirse}
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Unirse a la sesión
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {equipos.length > 0 && (
            <>
              <div className={styles.sectionTitle}>
                Mis Equipos
                <span className={styles.actividadesBadge}>{equipos.length}</span>
              </div>
              <div className={styles.actividadesList}>
                {equipos.map((ei) => {
                  const equipo = ei.equipo;
                  const actividad = equipo.actividad;
                  return (
                    <div key={equipo.idEquipo} className={styles.actividadCard}>
                      <div className={styles.actividadTop}>
                        <span className={styles.tipoBadge}>
                          Equipo #{equipo.numeroEquipo}
                        </span>
                        {ei.esRepresentante && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
                            Capitán
                          </span>
                        )}
                      </div>
                      <h3 className={styles.actividadNombre}>{equipo.nombreEquipo}</h3>
                      <div className={styles.actividadMeta}>
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {actividad.nombre}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          <div className={styles.sectionTitle}>
            Historial de Depósitos
            <span className={styles.actividadesBadge}>{depositos.length}</span>
          </div>
          <div className="mb-8">
            <HistorialDepositosUsuario depositos={depositos} />
          </div>

          <div className={styles.actions}>
            {session?.user?.role === 'ADMIN' && (
              <Link href="/cpanel/usuarios" className={styles.btnPrimary}>
                Panel de administración
              </Link>
            )}
            {inscripciones.length > 0 && (
              <>
                <a href="/actividades/talleres" className={styles.btnSecondary}>
                  Talleres
                </a>
                <a href="/actividades/concursos" className={styles.btnSecondary}>
                  Concursos
                </a>
                <a href="/actividades/actividades" className={styles.btnSecondary}>
                  Actividades
                </a>
              </>
            )}
            <CerrarSesionButton />
          </div>
        </div>
      </div>
    </div>
  );
}
