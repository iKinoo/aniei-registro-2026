import { IEmailService } from '@/application/ports/IEmailService';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';

export class EnviarConfirmacion {
  constructor(
    private readonly emailService: IEmailService,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly catalogoRepo: ICatalogoRepository,
  ) {}

  async execute(idUsuario: number): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new Error(`Usuario con id ${idUsuario} no encontrado`);
    }

    const instituciones = await this.catalogoRepo.obtenerInstituciones();
    const institucion = instituciones.find((i) => i.idInstitucion === usuario.idInstitucion);

    const fechaStr = usuario.fechaRegistro.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    await this.emailService.enviarConfirmacionRegistro(usuario.correo.toString(), {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      folio: usuario.folioRecibo?.toString() ?? 'N/A',
      institucion: institucion?.nombre ?? 'N/A',
      fecha: fechaStr,
    });
  }
}
