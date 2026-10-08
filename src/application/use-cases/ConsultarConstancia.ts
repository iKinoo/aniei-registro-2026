import type { IUsuarioRepository } from '../ports/IUsuarioRepository';
import type { ICatalogoRepository } from '../ports/ICatalogoRepository';
import type { IPdfService } from '../ports/IPdfService';
import type { ConstanciaData } from '../dtos/ConstanciaDTO';
import { contenidoParticipacionGeneral } from '../services/RedactorConstancia';
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';

export class ConsultarConstancia {
  constructor(private readonly usuarios: IUsuarioRepository, private readonly catalogos: ICatalogoRepository,
    private readonly pdf: IPdfService) {}

  async obtener(folio: string): Promise<ConstanciaData | null> {
    const usuario = await this.usuarios.buscarPorFolio(FolioRegistro.create(folio));
    if (!usuario) return null;
    const [instituciones, titulos] = await Promise.all([this.catalogos.obtenerInstituciones(), this.catalogos.obtenerTitulos()]);
    return { nombre: usuario.nombre, apellido: usuario.apellido, folio,
      institucion: instituciones.find(i => i.idInstitucion === usuario.idInstitucion)?.nombre ?? 'N/A',
      tipoUsuario: titulos.find(t => t.idTitulo === usuario.idTitulo)?.descripcion ?? 'N/A',
      fecha: usuario.fechaRegistro.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
    };
  }

  async descargar(folio: string): Promise<Uint8Array | null> {
    const datos = await this.obtener(folio);
    return datos ? this.pdf.generarConstancia(contenidoParticipacionGeneral(`${datos.nombre} ${datos.apellido}`)) : null;
  }
}
