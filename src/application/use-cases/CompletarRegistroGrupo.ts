import type { ITransactionManager } from '../ports/ITransactionManager';
import type { IPasswordHasher } from '../ports/IPasswordHasher';
import type { IPasswordGenerator } from '../ports/IPasswordGenerator';
import type { IEmailService } from '../ports/IEmailService';
import type { ICatalogoRepository } from '../ports/ICatalogoRepository';
import type { CompletarRegistroDTO } from '../dtos/ActualizarUsuarioDTO';
import { Email } from '@/core/value-objects/Email';
import { RegistroError } from '@/core/errors/RegistroError';

export class CompletarRegistroGrupo {
  constructor(private readonly tx: ITransactionManager, private readonly hasher: IPasswordHasher,
    private readonly passwords: IPasswordGenerator, private readonly email: IEmailService,
    private readonly catalogos: ICatalogoRepository) {}

  async execute(token: string, folio: string, data: CompletarRegistroDTO) {
    Email.create(data.correo);
    const password = this.passwords.generar();
    const hash = await this.hasher.hash(password);
    const instituciones = await this.catalogos.obtenerInstituciones();
    const usuario = await this.tx.run(async ctx => {
      const u = await ctx.grupoRepo.bloquearMiembro(token, folio);
      if (!u || !u.correo.toString().endsWith('@temp.aniei.org')) {
        throw RegistroError.DATOS_INVALIDOS('El integrante no está pendiente de completar');
      }
      await ctx.usuarioRepo.completar(folio, data);
      await ctx.accesoRepo.actualizarCredenciales(folio, data.correo, hash);
      return u;
    });
    try {
      await this.email.enviarConfirmacionRegistro(data.correo, {
        nombre: usuario.nombre, apellido: usuario.apellido, folio,
        institucion: instituciones.find(i => i.idInstitucion === usuario.idInstitucion)?.nombre ?? 'N/A',
        fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }), password,
      });
    } catch (error) { console.error('Error al enviar confirmación de registro:', error); }
    return { folioRegistro: folio, password };
  }
}
