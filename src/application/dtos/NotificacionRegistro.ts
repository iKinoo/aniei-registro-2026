export interface NotificacionIndividualData {
  nombre: string;
  apellido: string;
  correo: string;
  folio: string;
  institucion: string;
  tipoUsuario: string;
  fecha: string;
  password: string;
}

export interface NotificacionMiembroData {
  nombre: string;
  apellido: string;
  correo: string;
  folio: string;
  institucion: string;
  fecha: string;
  password: string;
}

export interface NotificacionGrupoData {
  miembros: NotificacionMiembroData[];
  responsableNombre: string;
  responsableApellido: string;
  responsableCorreo: string;
  token: string;
  totalMiembros: number;
}
