import { IFacturacionRepository } from '@/application/ports/IFacturacionRepository';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { FacturacionDTO } from '@/application/dtos/FacturacionDTO';
import { Facturacion } from '@/core/entities/Facturacion';


/**
 * TODO: no se está usando, revisar o remover
 */
export class SolicitarFacturacion {
  constructor(
    private readonly facturacionRepo: IFacturacionRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(dto: FacturacionDTO): Promise<Facturacion> {
    const usuario = await this.usuarioRepo.buscarPorId(dto.idUsuario);
    if (!usuario) {
      throw new Error(`Usuario con id ${dto.idUsuario} no encontrado`);
    }

    const facturacion = Facturacion.create({
      idUsuario: dto.idUsuario,
      razonSocial: dto.razonSocial,
      rfc: dto.rfc,
      calle: dto.calle,
      numExterior: dto.numExterior,
      numInterior: dto.numInterior,
      colonia: dto.colonia,
      municipio: dto.municipio,
      codigoPostal: dto.codigoPostal,
      idEntidadFederativaRfc: dto.idEntidadFederativaRfc,
    });

    return this.facturacionRepo.crear(facturacion);
  }
}
