import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService } from '@/application/ports/IStorageService';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { contenidoParticipacionGeneral } from '@/application/services/RedactorConstancia';

export class RegenerarConstanciaGeneral {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly storageService: IStorageService,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(folioRegistro: string): Promise<string> {
    const usuario = await this.usuarioRepo.buscarPorId(folioRegistro);
    if (!usuario) {
      throw new Error(`Usuario con folio ${folioRegistro} no encontrado`);
    }

    const pdfUint8Array = await this.pdfService.generarConstancia(
      contenidoParticipacionGeneral(`${usuario.nombre} ${usuario.apellido}`),
    );

    const ruta = `constancias/${folioRegistro}.pdf`;
    await this.storageService.subir(ruta, pdfUint8Array, 'application/pdf');

    return ruta;
  }
}
