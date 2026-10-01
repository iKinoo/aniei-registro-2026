export interface ActualizarUsuarioDTO {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  lada: string | null;
  extension: string | null;
  genero: string | null;
  carrera: string | null;
  dependencia: string | null;
  idTitulo: number | null;
  idInstitucion: number | null;
  idEntidadFederativa: number | null;
}

export interface RegistroPonenteDTO {
  nombre: string;
  apellido: string;
  correo: string;
  idInstitucion?: number;
  telefono?: string;
  idTitulo?: number;
  idTipoParticipante?: number;
}
