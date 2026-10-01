import type { IAuthService } from '../ports/IAuthService';
import type { IAccesoRepository } from '../ports/IAccesoRepository';
import type { IDepositoRepository } from '../ports/IDepositoRepository';
import { ArchivoAccesoError } from '@/core/errors/ArchivoAccesoError';

export class AutorizarArchivo {
  constructor(private readonly auth: IAuthService, private readonly accesos: IAccesoRepository,
    private readonly depositos: IDepositoRepository) {}

  async execute(ruta: string): Promise<void> {
    const session = await this.auth.getCurrentSession();
    if (!session) throw new ArchivoAccesoError('SIN_SESION');
    const acceso = await this.accesos.buscarPorFolioRegistro(session.folioRegistro);
    if (!acceso) throw new ArchivoAccesoError('SIN_SESION');
    if (acceso.isAdmin() || ruta === `constancias/${acceso.folioRegistro}.pdf`) return;
    const depositos = await this.depositos.buscarTodosPorUsuario(acceso.folioRegistro);
    if (!depositos.some(d => d.archivoUrl === ruta)) throw new ArchivoAccesoError('PROHIBIDO');
  }
}
