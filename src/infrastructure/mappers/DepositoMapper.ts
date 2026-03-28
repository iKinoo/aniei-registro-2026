import { depositos } from '@/generated/prisma/client';
import { Deposito } from '@/core/entities/Deposito';
import { Monto } from '@/core/value-objects/Monto';

export class DepositoMapper {
  static toDomain(raw: depositos): Deposito {
    return Deposito.create({
      idDeposito: raw.id_deposito,
      idUsuario: raw.id_usuario ?? 0,
      bancoSucursal: raw.banco_sucursal ?? null,
      ciudad: raw.ciudad ?? null,
      referencia: raw.referencia,
      monto: Monto.create(Number(raw.monto)),
      fechaDeposito: raw.fecha_deposito,
      archivoUrl: raw.archivo_url,
      archivoNombre: raw.archivo_nombre,
      archivoMime: raw.archivo_mime,
      archivoTamanio: raw.archivo_tamanio,
      fechaRegistro: raw.fecha_registro ?? new Date(),
    });
  }

  static toPersistence(deposito: Deposito) {
    return {
      id_usuario: deposito.idUsuario,
      banco_sucursal: deposito.bancoSucursal,
      ciudad: deposito.ciudad,
      referencia: deposito.referencia,
      monto: deposito.monto.toNumber(),
      fecha_deposito: deposito.fechaDeposito,
      archivo_url: deposito.archivoUrl,
      archivo_nombre: deposito.archivo.getNombre(),
      archivo_mime: deposito.archivo.getMime(),
      archivo_tamanio: deposito.archivo.getTamanio(),
    };
  }
}
