import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService } from '@/application/ports/IStorageService';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';

export class GenerarConstancia {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly storageService: IStorageService,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly catalogoRepo: ICatalogoRepository,
  ) {}

  async execute(idUsuario: number): Promise<string> {
    const usuario = await this.usuarioRepo.buscarPorId(idUsuario);
    if (!usuario) {
      throw new Error(`Usuario con id ${idUsuario} no encontrado`);
    }

    const [instituciones, tiposUsuario] = await Promise.all([
      this.catalogoRepo.obtenerInstituciones(),
      this.catalogoRepo.obtenerTiposUsuario(),
    ]);

    const institucion = instituciones.find((i) => i.idInstitucion === usuario.idInstitucion);
    const tipoUsuario = tiposUsuario.find((t) => t.idTipoUsuario === usuario.idTipoUsuario);

    const folio = usuario.folioRecibo?.toString() ?? `ANIEI-2026-${String(idUsuario).padStart(4, '0')}`;
    const fechaStr = usuario.fechaRegistro.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const pdfBuffer = await this.pdfService.generarConstanciaInscripcion({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      folio,
      institucion: institucion?.nombre ?? 'N/A',
      tipoUsuario: tipoUsuario?.descripcion ?? 'N/A',
      fecha: fechaStr,
    });

    const ruta = `constancias/${folio}.pdf`;
    await this.storageService.subir(ruta, pdfBuffer, 'application/pdf');

    return await this.storageService.obtenerUrl(ruta);
  }
}
