'use server';

import { getAuthService } from '@/infrastructure/config/container';
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

  // Redirect to cpanel on success
  redirect('/cpanel');
}
