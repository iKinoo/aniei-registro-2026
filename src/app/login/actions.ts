'use server';

import { getAuthService, getAccesoRepository } from '@/infrastructure/config/container';
import { LoginCpanelUseCase } from '@/application/use-cases/LoginCpanelUseCase';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  if (!email || !password) {
    return { error: 'El correo y la contraseña son requeridos.', success: false };
  }

  const authService = getAuthService();
  const useCase = new LoginCpanelUseCase(authService);
  
  const result = await useCase.execute({ email, password });

  if (!result.success) {
    return { error: result.error, success: false };
  }

  // En Server Actions, `auth()` no tiene las cookies actualizadas inmediatamente tras el signIn.
  // Por lo tanto, buscamos el rol directamente desde la base de datos para la redirección inicial.
  const accesoRepo = getAccesoRepository();
  const acceso = await accesoRepo.buscarPorEmail(email);
  const role = acceso?.rol || 'USER';

  if (role === 'ADMIN') {
    redirect('/cpanel');
  } else {
    redirect('/perfil');
  }
}
