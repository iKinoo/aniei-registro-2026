import type { IAccesoRepository } from '../ports/IAccesoRepository';
import type { IPasswordHasher } from '../ports/IPasswordHasher';

export class ValidarCredenciales {
  constructor(private readonly accesos: IAccesoRepository, private readonly hasher: IPasswordHasher) {}

  async execute(folio: string, password: string) {
    const credenciales = await this.accesos.obtenerCredenciales(folio);
    if (!credenciales || !await this.hasher.verify(password, credenciales.passwordHash)) return null;
    return credenciales.acceso;
  }
}
