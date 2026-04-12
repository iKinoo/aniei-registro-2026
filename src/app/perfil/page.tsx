import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import styles from './page.module.css';

export default async function PerfilPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Obtenemos los detalles del usuario
  const acceso = await prisma.accesos.findUnique({
    where: { email: session.user.email },
    include: {
      usuarios: {
        include: {
          instituciones: true,
        }
      }
    }
  });

  if (!acceso || !acceso.usuarios) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Perfil Incompleto</h1>
          <p className={styles.description}>No se encontraron datos de registro asociados a este acceso.</p>
        </div>
      </div>
    );
  }

  const usuario = acceso.usuarios;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mi Perfil</h1>
          <div className={styles.folioBadge}>{usuario.folio_recibo || 'Sin asignar'}</div>
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
              <span className={styles.value}>{usuario.instituciones?.nombre || 'N/A'}</span>
            </div>
            <div className={styles.field}>
              <span className={styles.label}>Fecha de Registro</span>
              <span className={styles.value}>
                {usuario.fecha_registro ? new Date(usuario.fecha_registro).toLocaleDateString('es-MX') : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className={styles.actions}>
            <a href="/api/auth/signout" className={styles.logoutButton}>Cerrar Sesión</a>
          </div>
        </div>
      </div>
    </div>
  );
}
