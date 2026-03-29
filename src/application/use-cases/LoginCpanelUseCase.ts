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

      // 2. Obtener la sesión configurada y cruzar datos con la tabla de accesos
      const session = await this.authService.getCurrentSession();

      if (!session) {
        // El login con el provider fue exitoso pero el usuario no está registrado en nuestra tabla 'accesos'
        // Por seguridad, debemos cerrar la sesión en el identity provider.
        await this.authService.signOut();
        return { success: false, error: 'Acceso denegado. El usuario no está autorizado para este panel.' };
      }

      return { success: true, session };
    } catch (error: any) {
      return { success: false, error: error.message || 'Ocurrió un error inesperado al iniciar sesión.' };
    }
  }
}
