'use client';
import { useTransition } from 'react';
import { handleLogout } from './logoutAction';

export default function LogoutForm() {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => handleLogout())}
      disabled={isPending}
      className="text-sm px-4 py-2 border border-slate-200 shadow-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
    >
      {isPending ? 'Saliendo...' : 'Cerrar Sesión'}
    </button>
  );
}
