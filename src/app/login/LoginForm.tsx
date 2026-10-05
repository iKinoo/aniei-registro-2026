'use client';

import Link from 'next/link';

import { useActionState } from 'react';
import { loginAction } from './actions';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, { error: '', success: false });

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-2">
          {state.error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="numeroFolio">
            Folio de Registro <span className="font-medium text-slate-400">(solo el número)</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500 select-none shadow-sm">
              ANI26-
            </span>
            <input
              id="numeroFolio"
              name="numeroFolio"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              required
              placeholder="0001"
              className="w-full rounded-r-xl border border-slate-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm text-slate-900 shadow-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm text-slate-900 shadow-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? 'Iniciando sesión...' : 'Ingresar'}
      </button>

      <Link
        href="/"
        className="w-full flex justify-center py-3.5 px-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200 transition-all"
      >
        No estoy registrado
      </Link>
    </form>
  );
}
