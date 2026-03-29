import { LoginForm } from './LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/60">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">CPanel</h1>
          <p className="text-sm font-medium text-slate-500">Inicia sesión para acceder al panel de administración.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
