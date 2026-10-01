'use server';

import { getAuthService, getAccesoRepository } from '@/infrastructure/config/container';
import { LoginCpanelUseCase } from '@/application/use-cases/LoginCpanelUseCase';
import { redirect } from 'next/navigation';

export async function loginAction(_prevState: { success: boolean; error?: string }, formData: FormData) {
  const folioRegistro = formData.get('folioRegistro')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  if (!folioRegistro || !password) {
    return { error: 'El folio y la contraseña son requeridos.', success: false };
  }

  const authService = getAuthService();
  const useCase = new LoginCpanelUseCase(authService, getAccesoRepository());
  
  const result = await useCase.execute({ folioRegistro, password });

  if (!result.success) {
    return { error: result.error, success: false };
  }

  const role = result.role ?? 'USER';

  if (role === 'ADMIN') {
    redirect('/cpanel');
  } else {
    redirect('/perfil');
  }
}
