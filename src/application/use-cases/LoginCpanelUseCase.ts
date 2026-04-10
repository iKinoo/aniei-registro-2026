import { IAuthService, SignInCredentials } from '../ports/IAuthService';
import { AuthSessionDTO } from '../dtos/AuthSessionDTO';

export class LoginCpanelUseCase {
  constructor(private readonly authService: IAuthService) {}

  async execute(credentials: SignInCredentials): Promise<{ success: boolean; session?: AuthSessionDTO; error?: string }> {
    try {
      // 1. Iniciar sesión a través del Identity Provider
      const signInResult = await this.authService.signIn(credentials);
      
      if (!signInResult.success) {
        return { success: false, error: signInResult.error || 'Credenciales inválidas.' };
      }

      // 2. Ya no es necesario obtener la sesión inmediatamente porque Auth.js se encarga de validar contra nuestra base de datos.
      // Además, obtener la sesión en el mismo Server Action puede fallar por cómo se manejan las cookies.
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Ocurrió un error inesperado al iniciar sesión.' };
    }
  }
}
