export interface PonenteDTO {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  rol: string | null;
  urlConstancia?: string | null;
}

export interface InscritoDTO {
  idUsuario: number;
  nombre: string;
  apellido: string;
  correo: string;
  fechaInscripcion: Date | null;
}

export interface ActividadDTO {
  idActividad: number;
  nombre: string;
  descripcion: string | null;
  cupoMaximo: number;
  /** Cantidad de inscripciones actuales. 0 si no se incluyó en el query. */
  cupoOcupado: number;
  fechaInicio: string; // ISO string
  fechaFin: string;    // ISO string
  idTipoActividad: number | null;
  idInstitucionSede: number | null;
  idSala: number | null;
  // Relations
  tipoActividad: { idTipoActividad: number; descripcion: string; clave: string | null; manejaEquipos: boolean } | null;
  institucionSede: { idInstitucion: number; nombre: string; abreviatura: string | null } | null;
  // Optional details
  tallerDetalle: { horarioTexto: string | null; diasSemana: string | null } | null;
  costo: { folioRecibo: string | null; monto: number | null } | null;
  ponentes: PonenteDTO[];
}

export interface CrearActividadDTO {
  nombre: string;
  descripcion?: string;
  cupoMaximo?: number;
  fechaInicio: string;
  fechaFin: string;
  idTipoActividad?: number;
  idInstitucionSede?: number;
  idSala?: number;
  // Optional detail sections
  tallerDetalle?: {
    horarioTexto?: string;
    diasSemana?: string;
  };
  costo?: {
    folioRecibo?: string;
    monto?: number;
  };
}

export type ActualizarActividadDTO = Partial<CrearActividadDTO>;
