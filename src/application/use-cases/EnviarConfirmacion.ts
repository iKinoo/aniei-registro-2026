import { IEmailService } from '@/application/ports/IEmailService';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import { IStorageService } from '@/application/ports/IStorageService';

export class EnviarConfirmacion {
  constructor(
    private readonly emailService: IEmailService,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly catalogoRepo: ICatalogoRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(idUsuario: number): Promise<void> {
    const usuario = await this.usuarioRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new Error(`Usuario con id ${idUsuario} no encontrado`);
    }

    const instituciones = await this.catalogoRepo.obtenerInstituciones();
    const institucion = instituciones.find((i) => i.idInstitucion === usuario.idInstitucion);

    const folio = usuario.folioRecibo?.toString();
    if (!folio) {
      throw new Error(`El usuario con id ${idUsuario} no tiene folio asignado`);
    }

    // Descargar el pdf de la constancia desde el storage
    const pdfBuffer = await this.storageService.descargar(`constancias/${folio}.pdf`);

    // Enviar constancia por correo
    await this.emailService.enviarConstancia(usuario.correo.toString(), pdfBuffer, folio);
  }
}
