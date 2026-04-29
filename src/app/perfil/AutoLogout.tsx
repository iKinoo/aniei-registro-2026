'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function AutoLogout() {
  useEffect(() => {
    signOut({ callbackUrl: '/login?error=PerfilIncompleto' });
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Cerrando sesión por perfil incompleto...</p>
    </div>
  );
}
