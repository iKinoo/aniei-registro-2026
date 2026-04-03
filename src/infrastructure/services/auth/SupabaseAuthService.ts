import { IAuthService, SignInCredentials } from '@/application/ports/IAuthService';
import { AuthSessionDTO } from '@/application/dtos/AuthSessionDTO';
import { createClient } from '@/infrastructure/config/supabase/server';


export class SupabaseAuthService implements IAuthService {
  async signIn(credentials: SignInCredentials): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient(); // createServerClient depends on cookies which are synchronous in newer Next.js but it's safe to await/use.
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password || '',
    });

    if (error) {
      return { success: false, error: 'Credenciales inválidas o error de red.' };
    }
    return { success: true };
  }

  async signOut(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  async getCurrentSession(): Promise<AuthSessionDTO | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return null;
    }

    return {
      email: user.email,
      authId: user.id,
    };
  }
}
