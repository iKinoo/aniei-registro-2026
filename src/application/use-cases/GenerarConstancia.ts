import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService, parseFileReference } from '@/application/ports/IStorageService';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';

export class GenerarConstancia {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly storageService: IStorageService,
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly catalogoRepo: ICatalogoRepository,
  ) {}

  async execute(folioRegistro: string): Promise<string> {
    const usuario = await this.usuarioRepo.buscarPorId(folioRegistro);
    if (!usuario) {
      throw new Error(`Usuario con id ${folioRegistro} no encontrado`);
    }

    const [instituciones, titulos] = await Promise.all([
      this.catalogoRepo.obtenerInstituciones(),
      this.catalogoRepo.obtenerTitulos(),
    ]);

    const institucion = instituciones.find((i) => i.idInstitucion === usuario.idInstitucion);
    const titulo = titulos.find((t) => t.idTitulo === usuario.idTitulo);

    const folio = usuario.folioRegistro?.toString() ?? `ANIEI-2026-${String(folioRegistro).padStart(4, '0')}`;
    const fechaStr = usuario.fechaRegistro.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const pdfBuffer = await this.pdfService.generarConstanciaInscripcion({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      folio,
      institucion: institucion?.nombre ?? 'N/A',
      tipoUsuario: titulo?.descripcion ?? 'N/A',
      fecha: fechaStr,
    });

    const ruta = `constancias/${folio}.pdf`;
    await this.storageService.subir(ruta, pdfBuffer, 'application/pdf');

    const fileRef = parseFileReference(ruta);
    return await this.storageService.getAccess(fileRef);
  }
}
