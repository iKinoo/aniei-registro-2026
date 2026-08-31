import Link from 'next/link';
import { getAuthService, getAccesoRepository } from '@/infrastructure/config/container';
import LogoutForm from './LogoutForm';

export default async function CpanelLayout({ children }: { children: React.ReactNode }) {
  const authService = getAuthService();
  const session = await authService.getCurrentSession();

  let acceso = null;
  if (session) {
    const accesoRepo = getAccesoRepository();
    acceso = await accesoRepo.buscarPorFolioRegistro(session.folioRegistro);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {session && acceso && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="shrink-0 flex items-center space-x-4">
                <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CPanel
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-semibold text-slate-900">Hola, {acceso.nombre || acceso.email}</span>
                  <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{acceso.rol}</span>
                </div>
              </div>

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/cpanel"
                  className="px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Usuarios
                </Link>
                <Link
                  href="/cpanel/actividades"
                  className="px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Actividades
                </Link>
                <Link
                  href="/cpanel/configuracion"
                  className="px-3 py-2 text-sm font-medium text-slate-600 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  Configuración
                </Link>
              </nav>

              <div>
                <LogoutForm />
              </div>
            </div>
          </div>
        </header>
      )}
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}
