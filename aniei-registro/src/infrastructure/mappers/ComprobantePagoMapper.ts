import { comprobantes_pago } from '@/generated/prisma/client';
import { ComprobantePago } from '@/core/entities/ComprobantePago';
import { Monto } from '@/core/value-objects/Monto';

export class ComprobantePagoMapper {
  static toDomain(raw: comprobantes_pago): ComprobantePago {
    return ComprobantePago.create({
      idComprobante: raw.id_comprobante,
      idUsuario: raw.id_usuario ?? 0,
      archivoUrl: raw.archivo_url,
      archivoNombre: raw.archivo_nombre,
      archivoMime: raw.archivo_mime,
      archivoTamanio: raw.archivo_tamanio,
      monto: raw.monto ? Monto.create(Number(raw.monto)) : null,
      esGrupal: raw.es_grupal ?? false,
      fechaRegistro: raw.fecha_registro ?? new Date(),
    });
  }

  static toPersistence(comprobante: ComprobantePago) {
    return {
      id_usuario: comprobante.idUsuario,
      archivo_url: comprobante.archivoUrl,
      archivo_nombre: comprobante.archivo.getNombre(),
      archivo_mime: comprobante.archivo.getMime(),
      archivo_tamanio: comprobante.archivo.getTamanio(),
      monto: comprobante.monto?.toNumber() ?? null,
      es_grupal: comprobante.esGrupal,
    };
  }
}
