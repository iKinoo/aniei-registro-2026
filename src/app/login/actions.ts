'use server';

import { getAuthService, getAccesoRepository } from '@/infrastructure/config/container';
import { LoginCpanelUseCase } from '@/application/use-cases/LoginCpanelUseCase';
import { redirect } from 'next/navigation';

const PREFIJO_FOLIO = 'ANI26-';
const DIGITOS_FOLIO = 4;

export async function loginAction(_prevState: { success: boolean; error?: string }, formData: FormData) {
  const numeroFolio = (formData.get('numeroFolio')?.toString() || '').trim().toUpperCase();
  const password = formData.get('password')?.toString() || '';

  if (!numeroFolio || !password) {
    return { error: 'El folio y la contraseña son requeridos.', success: false };
  }

  const numero = numeroFolio.startsWith(PREFIJO_FOLIO) ? numeroFolio.slice(PREFIJO_FOLIO.length) : numeroFolio;
  if (!/^\d{1,9}$/.test(numero)) {
    return { error: 'El número de folio debe contener solo dígitos.', success: false };
  }
  const folioRegistro = `${PREFIJO_FOLIO}${numero.padStart(DIGITOS_FOLIO, '0')}`;

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
