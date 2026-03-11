import { usuarios } from '@/generated/prisma/client';
import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { Telefono } from '@/core/value-objects/Telefono';
import { FolioRecibo } from '@/core/value-objects/FolioRecibo';
import { CodigoBarras } from '@/core/value-objects/CodigoBarras';
import { Genero } from '@/core/enums/Genero';

export class UsuarioMapper {
  static toDomain(raw: usuarios): Usuario {
    return Usuario.create({
      idUsuario: raw.id_usuario,
      folioRecibo: raw.folio_recibo ? FolioRecibo.create(raw.folio_recibo) : null,
      codigoBarras: raw.codigo_barras ? CodigoBarras.create(raw.codigo_barras) : null,
      nombre: raw.nombre,
      apellido: raw.apellido,
      correo: Email.create(raw.correo),
      telefono: raw.telefono ? Telefono.create(raw.telefono, raw.lada, raw.extension) : null,
      genero: (raw.genero as Genero) ?? Genero.OTRO,
      carrera: raw.carrera,
      dependencia: raw.dependencia,
      idCargo: raw.id_cargo ?? 0,
      idTipoUsuario: raw.id_tipo_usuario ?? 0,
      idInstitucion: raw.id_institucion ?? 0,
      idEntidadFederativa: raw.id_entidad_federativa ?? 0,
      verificado: raw.verificado ?? false,
      fechaRegistro: raw.fecha_registro ?? new Date(),
    });
  }

  static toPersistence(usuario: Usuario) {
    return {
      folio_recibo: usuario.folioRecibo?.toString() ?? null,
      codigo_barras: usuario.codigoBarras?.toString() ?? null,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo.toString(),
      telefono: usuario.telefono?.getNumero() ?? null,
      lada: usuario.telefono?.getLada() ?? null,
      extension: usuario.telefono?.getExtension() ?? null,
      genero: usuario.genero as string,
      carrera: usuario.carrera,
      dependencia: usuario.dependencia,
      id_cargo: usuario.idCargo,
      id_tipo_usuario: usuario.idTipoUsuario,
      id_institucion: usuario.idInstitucion,
      id_entidad_federativa: usuario.idEntidadFederativa,
      verificado: usuario.verificado,
    };
  }
}
