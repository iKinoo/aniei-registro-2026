import { facturaciones } from '@/generated/prisma/client';
import { Facturacion } from '@/core/entities/Facturacion';

export class FacturacionMapper {
  static toDomain(raw: facturaciones): Facturacion {
    return Facturacion.create({
      idFacturacion: raw.id_facturacion,
      idUsuario: raw.id_usuario ?? 0,
      razonSocial: raw.razon_social,
      rfc: raw.rfc,
      calle: raw.calle,
      numExterior: raw.num_exterior,
      numInterior: raw.num_interior,
      colonia: raw.colonia,
      municipio: raw.municipio,
      codigoPostal: raw.codigo_postal,
      idEntidadFederativaRfc: raw.id_entidad_federativa_rfc,
    });
  }

  static toPersistence(facturacion: Facturacion) {
    return {
      id_usuario: facturacion.idUsuario,
      razon_social: facturacion.razonSocial,
      rfc: facturacion.rfc,
      calle: facturacion.calle,
      num_exterior: facturacion.numExterior,
      num_interior: facturacion.numInterior,
      colonia: facturacion.colonia,
      municipio: facturacion.municipio,
      codigo_postal: facturacion.codigoPostal,
      id_entidad_federativa_rfc: facturacion.idEntidadFederativaRfc,
    };
  }
}
