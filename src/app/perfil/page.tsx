import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { DepositoHistorialItem } from '@/app/components/HistorialDepositos';
import { HistorialDepositosUsuario } from '@/app/components/HistorialDepositosUsuario';
import AutoLogout from './AutoLogout';
import { CerrarSesionButton } from './CerrarSesionButton';
import styles from './page.module.css';

export const metadata = { title: 'Mi Perfil | ANIEI 2026' };

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  const acceso = await prisma.accesos.findUnique({
    where: { email: session.user.email },
    include: {
      usuarios: {
        include: {
          instituciones: true,
        },
      },
    },
  });

  if (!acceso || !acceso.usuarios) {
    return <AutoLogout />;
  }

  const usuario = acceso.usuarios;

  // Cargar inscripciones a actividades con detalle
  const inscripciones = acceso.folio_registro
    ? await prisma.inscripcion_actividades.findMany({
        where: { folio_registro: acceso.folio_registro },
        include: {
          actividades: {
            include: {
              tipo_actividad: true,
              instituciones: true,
            },
          },
        },
        orderBy: { fecha_inscripcion: 'desc' },
      })
    : [];

  // Cargar historial de depósitos
  const depositosRaw = acceso.folio_registro
    ? await prisma.depositos.findMany({
        where: { folio_registro: acceso.folio_registro },
        orderBy: { fecha_registro: 'desc' },
      })
    : [];

  const depositos: DepositoHistorialItem[] = depositosRaw.map((d) => ({
    idDeposito: d.id_deposito,
    proposito: d.proposito ?? 'EVENTO_PRINCIPAL',
    monto: Number(d.monto),
    referencia: d.referencia,
    bancoSucursal: d.banco_sucursal,
    ciudad: d.ciudad,
    fechaDeposito: d.fecha_deposito,
    fechaRegistro: d.fecha_registro ?? new Date(),
    notas: d.notas,
    archivoUrl: d.archivo_url,
    archivoNombre: d.archivo_nombre,
  }));

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={styles.headerSub}>Congreso ANIEI 2026</p>
            <h1 className={styles.title}>Mi Perfil</h1>
          </div>
          <div className={styles.folioBadge}>{usuario.folio_registro || 'Sin folio'}</div>
        </div>

        <div className={styles.content}>
          {/* Datos Personales */}
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
              <span className={styles.value}>{usuario.instituciones?.nombre || 'N/A'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Fecha de Registro</span>
              <span className={styles.value}>
                {usuario.fecha_registro
                  ? new Date(usuario.fecha_registro).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : 'N/A'}
              </span>
            </div>
          </div>
            
          {/* Actividades inscritas */}
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
              <a href="/actividades" className={styles.btnActividades}>
                Ver actividades disponibles →
              </a>
            </div>
          ) : (
            <div className={styles.actividadesList}>
              {inscripciones.map((insc) => {
                const act = insc.actividades;
                if (!act) return null;
                return (
                  <div key={insc.id_inscripcion} className={styles.actividadCard}>
                    <div className={styles.actividadTop}>
                      {act.tipo_actividad && (
                        <span className={styles.tipoBadge}>
                          {act.tipo_actividad.descripcion}
                        </span>
                      )}
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
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(act.fecha_inicio).toLocaleDateString('es-MX', {
                          day: '2-digit', month: 'short', year: 'numeric',
                        })} · {new Date(act.fecha_inicio).toLocaleTimeString('es-MX', {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      {act.instituciones && (
                        <span className={styles.metaItem}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          {act.instituciones.abreviatura ?? act.instituciones.nombre}
                          {act.id_sala != null && ` · Sala ${act.id_sala}`}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Historial de Depósitos */}
          <div className={styles.sectionTitle}>
            Historial de Depósitos
            <span className={styles.actividadesBadge}>{depositos.length}</span>
          </div>
          <div className="mb-8">
            <HistorialDepositosUsuario depositos={depositos} />
          </div>

          {/* Acciones */}
          <div className={styles.actions}>
            {inscripciones.length > 0 && (
              <a href="/actividades" className={styles.btnSecondary}>
                Inscribirse a actividades
              </a>
            )}
            <a href="/perfil/grupo/registro" className={styles.btnPrimary}>
              Registro Grupal
            </a>
            <CerrarSesionButton />
          </div>
        </div>
      </div>
    </div>
  );
}
