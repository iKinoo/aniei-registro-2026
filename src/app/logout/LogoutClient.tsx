'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export function LogoutClient() {
  const router = useRouter();

  const handleConfirm = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <p className={styles.headerSub}>Congreso ANIEI 2026</p>
            <h1 className={styles.title}>Cerrar sesión</h1>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>

          <p className={styles.message}>
            ¿Estás seguro de que deseas cerrar tu sesión?
          </p>

          <p className={styles.submessage}>
            Tendrás que iniciar sesión nuevamente para acceder a tu perfil e inscripciones.
          </p>

          <div className={styles.actions}>
            <button type="button" onClick={handleCancel} className={styles.btnCancel}>
              Cancelar
            </button>
            <button type="button" onClick={handleConfirm} className={styles.btnConfirm}>
              Sí, cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
