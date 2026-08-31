'use server';

import { getAuthService, getAccesoRepository } from '@/infrastructure/config/container';
import { LoginCpanelUseCase } from '@/application/use-cases/LoginCpanelUseCase';
import { redirect } from 'next/navigation';

export async function loginAction(prevState: any, formData: FormData) {
  const folioRegistro = formData.get('folioRegistro')?.toString() || '';
  const password = formData.get('password')?.toString() || '';

  if (!folioRegistro || !password) {
    return { error: 'El folio y la contraseña son requeridos.', success: false };
  }

  const authService = getAuthService();
  const useCase = new LoginCpanelUseCase(authService);
  
  const result = await useCase.execute({ folioRegistro, password });

  if (!result.success) {
    return { error: result.error, success: false };
  }

  const accesoRepo = getAccesoRepository();
  const acceso = await accesoRepo.buscarPorFolioRegistro(folioRegistro);
  const role = acceso?.rol || 'USER';

  if (role === 'ADMIN') {
    redirect('/cpanel');
  } else {
    redirect('/perfil');
  }
}
