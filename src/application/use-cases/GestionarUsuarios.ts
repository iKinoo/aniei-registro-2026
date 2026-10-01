import type { ITransactionManager } from '../ports/ITransactionManager';
import type { IStorageService } from '../ports/IStorageService';
import type { ActualizarUsuarioDTO } from '../dtos/ActualizarUsuarioDTO';
import { Email } from '@/core/value-objects/Email';

export class GestionarUsuarios {
  constructor(private readonly transacciones: ITransactionManager, private readonly storage: IStorageService) {}

  async actualizar(folio: string, data: ActualizarUsuarioDTO): Promise<void> {
    Email.create(data.correo);
    await this.transacciones.run(ctx => ctx.usuarioRepo.actualizar(folio, data));
  }

  async eliminar(folio: string): Promise<void> {
    const archivos = await this.transacciones.run(ctx => ctx.usuarioRepo.eliminar(folio));
    for (const ruta of archivos) {
      try { await this.storage.eliminar(ruta); }
      catch (error) { console.error('Error al eliminar comprobante:', error); }
    }
  }
}
