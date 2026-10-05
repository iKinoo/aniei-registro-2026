import type { ITransactionManager } from '../ports/ITransactionManager';
import type { IEmailService } from '../ports/IEmailService';
import type { IPasswordHasher } from '../ports/IPasswordHasher';
import type { IPasswordGenerator } from '../ports/IPasswordGenerator';
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';
import { CredencialesError } from '@/core/errors/CredencialesError';

export interface ResultadoCambioContrasena {
  password: string;
  destinatario: string | null;
  correoEnviado: boolean;
}

const LONGITUD_MINIMA = 5;
const LONGITUD_MAXIMA = 72;

export class CambiarContrasenaUsuario {
  constructor(
    private readonly transacciones: ITransactionManager,
    private readonly passwordHasher: IPasswordHasher,
    private readonly passwordGenerator: IPasswordGenerator,
    private readonly emailService: IEmailService,
  ) {}

  async ejecutar(folio: string, passwordCustom?: string | null): Promise<ResultadoCambioContrasena> {
    const folioValidado = FolioRegistro.create(folio);
    const custom = passwordCustom?.trim();
    const password = custom ? custom : this.passwordGenerator.generar();
    if (password.length < LONGITUD_MINIMA || password.length > LONGITUD_MAXIMA) {
      throw CredencialesError.CONTRASENA_INVALIDA(
        `debe tener entre ${LONGITUD_MINIMA} y ${LONGITUD_MAXIMA} caracteres`,
      );
    }

    const passwordHash = await this.passwordHasher.hash(password);

    const datos = await this.transacciones.run(async (ctx) => {
      const acceso = await ctx.accesoRepo.buscarPorFolioRegistro(folioValidado.toString());
      if (!acceso) throw CredencialesError.ACCESO_NO_ENCONTRADO(folioValidado.toString());

      const usuario = await ctx.usuarioRepo.buscarPorFolio(folioValidado);
      const destinatario = acceso.email ?? usuario?.correo.toString() ?? null;

      await ctx.accesoRepo.actualizarPassword(folioValidado.toString(), passwordHash);

      return {
        destinatario,
        nombre: usuario?.nombre ?? acceso.nombre?.split(' ')[0] ?? '',
        apellido: usuario?.apellido ?? '',
      };
    });

    let correoEnviado = false;
    if (datos.destinatario) {
      try {
        await this.emailService.enviarCambioContrasena(datos.destinatario, {
          nombre: datos.nombre,
          apellido: datos.apellido,
          folio: folioValidado.toString(),
          password,
        });
        correoEnviado = true;
      } catch (error) {
        console.error('Error al enviar correo de cambio de contraseña:', error);
      }
    }

    return { password, destinatario: datos.destinatario, correoEnviado };
  }
}
