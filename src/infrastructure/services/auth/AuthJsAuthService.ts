import { IAuthService, SignInCredentials } from '@/application/ports/IAuthService';
import { AuthSessionDTO } from '@/application/dtos/AuthSessionDTO';
import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';

export class AuthJsAuthService implements IAuthService {
  async signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      await signIn('credentials', {
        folioRegistro: credentials.folioRegistro,
        password: credentials.password || '',
        redirect: false,
      });
      return { success: true };
    } catch (error: any) {
      if (error instanceof AuthError) {
        switch (error.type) {
          case 'CredentialsSignin':
            return { success: false, error: 'Credenciales inválidas.' };
          default:
            return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión.' };
        }
      }

      if (error && typeof error === 'object' && 'digest' in error && (error.digest as string).startsWith('NEXT_REDIRECT')) {
        return { success: true };
      }

      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut({ redirect: false });
    } catch (error: any) {
      if (error && typeof error === 'object' && 'digest' in error && (error.digest as string).startsWith('NEXT_REDIRECT')) {
        return;
      }
      throw error;
    }
  }

  async getCurrentSession(): Promise<AuthSessionDTO | null> {
    const session = await auth();

    if (!session || !session.user || !(session.user as any).folioRegistro) {
      return null;
    }

    return {
      folioRegistro: (session.user as any).folioRegistro,
      authId: session.user.id || null,
    };
  }
}
