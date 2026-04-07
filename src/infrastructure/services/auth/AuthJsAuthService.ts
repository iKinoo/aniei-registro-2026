import { IAuthService, SignInCredentials } from '@/application/ports/IAuthService';
import { AuthSessionDTO } from '@/application/dtos/AuthSessionDTO';
import { signIn, signOut, auth } from '@/auth';
import { AuthError } from 'next-auth';

export class AuthJsAuthService implements IAuthService {
  async signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string }> {
    try {
      await signIn('credentials', {
        email: credentials.email,
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
      
      // En Next.js 14 y NextAuth v5, `signIn` en el servidor suele lanzar un error de tipo "NEXT_REDIRECT" incluso si se desactiva el redireccionamiento en algunas versiones beta. 
      // Si la cookie ya fue seteada, la validación fue exitosa. 
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
      // Ignorar si es un error de redirección programado
      if (error && typeof error === 'object' && 'digest' in error && (error.digest as string).startsWith('NEXT_REDIRECT')) {
        return;
      }
      throw error;
    }
  }

  async getCurrentSession(): Promise<AuthSessionDTO | null> {
    const session = await auth();
    
    if (!session || !session.user || !session.user.email) {
      return null;
    }

    return {
      email: session.user.email,
      authId: session.user.id || null,
    };
  }
}
