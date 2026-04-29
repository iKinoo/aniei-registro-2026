export interface PonenteDTO {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string | null;
  urlConstancia?: string | null;
}

export interface InscritoDTO {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
  fechaInscripcion: Date | null;
  urlConstancia?: string | null;
}

export interface ActividadDTO {
  idActividad: number;
  nombre: string;
  cupoMaximo: number;
  /** Cantidad de inscripciones actuales. 0 si no se incluyó en el query. */
  cupoOcupado: number;
  fechaInicio: string; // ISO string
  fechaFin: string;    // ISO string
  idTipoActividad: number | null;
  idInstitucionSede: number | null;
  idSala: number | null;
  // Relations
  tipoActividad: { idTipoActividad: number; descripcion: string; clave: string | null; manejaEquipos: boolean; generaConstanciaParticipante: boolean } | null;
  institucionSede: { idInstitucion: number; nombre: string; abreviatura: string | null } | null;
  // Optional details
  costo: number;
  ponentes: PonenteDTO[];
}

export interface CrearActividadDTO {
  nombre: string;
  cupoMaximo?: number;
  fechaInicio: string;
  fechaFin: string;
  idTipoActividad?: number;
  idInstitucionSede?: number;
  idSala?: number;
  // Optional detail sections
  costo?: number;
}

export type ActualizarActividadDTO = Partial<CrearActividadDTO>;
