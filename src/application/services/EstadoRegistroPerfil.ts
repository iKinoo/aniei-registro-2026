import type { UsuarioConsultaDTO } from '../dtos/ConsultaRegistroDTO';
import type { CamposFaltantesPerfilDTO } from '../dtos/PerfilRegistroDTO';

export function obtenerCamposFaltantes(usuario: UsuarioConsultaDTO): CamposFaltantesPerfilDTO {
  return {
    telefono: !usuario.telefono,
    lada: !usuario.lada,
    extension: !usuario.extension,
    genero: !usuario.genero,
    carrera: !usuario.carrera,
    idTitulo: !usuario.idTitulo || usuario.idTitulo <= 0,
    dependencia: !usuario.dependencia,
    institucion: !usuario.idInstitucion && !usuario.institucionExterna,
    idEntidadFederativa: !usuario.idEntidadFederativa || usuario.idEntidadFederativa <= 0,
    idTipoParticipante: !usuario.idTipoParticipante || usuario.idTipoParticipante <= 0,
  };
}

export function datosRegistroCompletos(usuario: UsuarioConsultaDTO): boolean {
  const faltantes = obtenerCamposFaltantes(usuario);
  return !faltantes.genero
    && !faltantes.idTitulo
    && !faltantes.institucion
    && !faltantes.idEntidadFederativa
    && !faltantes.idTipoParticipante;
}
