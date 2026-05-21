export interface Estado {
  idEntidadFederativa: number;
  nombre: string;
}

export interface Institucion {
  idInstitucion: number;
  nombre: string;
  abreviatura: string | null;
}

export interface TipoUsuario {
  idTipoUsuario: number;
  descripcion: string;
}

export interface Titulo {
  idTitulo: number;
  descripcion: string;
}

export interface TipoActividad {
  idTipoActividad: number;
  clave: string | null;
  descripcion: string;
  manejaEquipos: boolean;
  generaConstanciaParticipante: boolean;
}

