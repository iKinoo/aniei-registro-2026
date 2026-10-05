import type { IPasswordGenerator } from '@/application/ports/IPasswordGenerator';
import { generateSecurePassword } from '@/shared/security/password';

export class SecurePasswordGenerator implements IPasswordGenerator {
  generar(): string {
    return generateSecurePassword(5, false);
  }
}
