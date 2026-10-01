import type { usuarios, depositos } from '@/generated/prisma/client';
import type { UsuarioConsultaDTO, DepositoHistorialDTO } from '@/application/dtos/ConsultaRegistroDTO';

export function mapUsuarioConsulta(u: usuarios): UsuarioConsultaDTO {
  return {
    folioRegistro: u.folio_registro, nombre: u.nombre, apellido: u.apellido, correo: u.correo,
    telefono: u.telefono, lada: u.lada, extension: u.extension, genero: u.genero, carrera: u.carrera,
    dependencia: u.dependencia, idTitulo: u.id_titulo, idTipoParticipante: u.id_tipo_participante,
    idInstitucion: u.id_institucion, idEntidadFederativa: u.id_entidad_federativa,
    institucionExterna: u.institucion_externa, fechaRegistro: u.fecha_registro,
  };
}

export function mapDepositoHistorial(d: depositos): DepositoHistorialDTO {
  return {
    idDeposito: d.id_deposito, proposito: d.proposito ?? 'EVENTO_PRINCIPAL', monto: Number(d.monto),
    referencia: d.referencia, bancoSucursal: d.banco_sucursal, ciudad: d.ciudad,
    fechaDeposito: d.fecha_deposito, fechaRegistro: d.fecha_registro ?? d.fecha_deposito,
    notas: d.notas, archivoUrl: d.archivo_url, archivoNombre: d.archivo_nombre,
  };
}
