import { AuthSessionDTO } from '../dtos/AuthSessionDTO';

export interface SignInCredentials {
  folioRegistro: string;
  password?: string;
}

export interface IAuthService {
  signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string }>;
  signOut(): Promise<void>;
  getCurrentSession(): Promise<AuthSessionDTO | null>;
}
