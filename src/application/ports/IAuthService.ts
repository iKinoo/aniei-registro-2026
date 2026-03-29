import { AuthSessionDTO } from '../dtos/AuthSessionDTO';

export interface SignInCredentials {
  email: string;
  password?: string;
}

export interface IAuthService {
  /**
   * Intenta iniciar sesión usando email y contraseña.
   * Devuelve verdadero si el proceso del Identity Provider (Ej. Supabase) es exitoso.
   */
  signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string }>;

  /**
   * Cierra la sesión activa en el proveedor de identidad.
   */
  signOut(): Promise<void>;

  /**
   * Obtiene la sesión actual incluyendo datos de la tabla accesos.
   */
  getCurrentSession(): Promise<AuthSessionDTO | null>;
}
