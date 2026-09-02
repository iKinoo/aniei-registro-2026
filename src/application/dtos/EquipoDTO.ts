export interface EquipoIntegranteDTO {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
  esRepresentante: boolean;
}

export interface EquipoDTO {
  idEquipo: number;
  numeroEquipo: number;
  nombreEquipo: string;
  idActividad: number;
  idInstitucion: number | null;
  fechaRegistro: Date | null;
  integrantes: EquipoIntegranteDTO[];
}

export interface CrearEquipoDTO {
  nombreEquipo: string;
  idActividad: number;
  integrantes: { folioRegistro: string; esRepresentante: boolean }[];
}

export interface ActualizarEquipoDTO {
  nombreEquipo?: string;
  integrantes?: { folioRegistro: string; esRepresentante: boolean }[];
}

export interface UsuarioBusquedaDTO {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
}
