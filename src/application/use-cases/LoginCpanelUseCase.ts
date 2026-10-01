import { IAuthService, SignInCredentials } from '../ports/IAuthService';
import type { IAccesoRepository } from '../ports/IAccesoRepository';
import { AuthSessionDTO } from '../dtos/AuthSessionDTO';

export class LoginCpanelUseCase {
  constructor(private readonly authService: IAuthService, private readonly accesos: IAccesoRepository) {}

  async execute(credentials: SignInCredentials): Promise<{ success: boolean; session?: AuthSessionDTO; error?: string; role?: string }> {
    try {
      const signInResult = await this.authService.signIn(credentials);
      
      if (!signInResult.success) {
        return { success: false, error: signInResult.error || 'Credenciales inválidas.' };
      }

      const acceso = await this.accesos.buscarPorFolioRegistro(credentials.folioRegistro);
      return { success: true, role: acceso?.rol ?? 'USER' };
    } catch {
      return { success: false, error: 'Ocurrió un error inesperado al iniciar sesión.' };
    }
  }
}
