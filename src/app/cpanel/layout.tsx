import { getAuthService } from '@/infrastructure/config/container';
import LogoutForm from './LogoutForm';

export default async function CpanelLayout({ children }: { children: React.ReactNode }) {
  const authService = getAuthService();
  const session = await authService.getCurrentSession();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {session && (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="shrink-0 flex items-center space-x-4">
                <span className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  CPanel
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex flex-col justify-center">
                  <span className="text-sm font-semibold text-slate-900">Hola, {session.nombre || session.email}</span>
                  <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">{session.rol}</span>
                </div>
              </div>
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
