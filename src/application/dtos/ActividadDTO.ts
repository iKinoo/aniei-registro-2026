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
  incluirEnConstancia: boolean;
  correoEnviado: boolean;
}

/** Relación ponente-actividad sin agrupar (una fila por vínculo) */
export interface VinculoPonenteDTO {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
  idActividad: number;
  nombreActividad: string;
  rol: string | null;
}

/** Resumen de un ponente con todas las actividades que imparte */
export interface PonenteResumenDTO {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
  actividades: { idActividad: number; nombre: string; rol: string | null }[];
}

/** Resultado del envío de listas de asistencia a un ponente */
export interface ResultadoEnvioListasDTO {
  folioRegistro: string;
  nombre: string;
  correo: string;
  actividades: number;
  exito: boolean;
  error?: string;
}

/** Resultado del envío de constancia a un participante */
export interface ResultadoEnvioConstanciaDTO {
  folioRegistro: string;
  nombre: string;
  correo: string;
  exito: boolean;
  error?: string;
}

export type ModalidadActividad = 'PRESENCIAL' | 'VIRTUAL';

export interface HorarioActividadDTO {
  fechaInicio: string; // ISO string
  fechaFin: string;    // ISO string
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
  sala: string | null;
  modalidad: ModalidadActividad;
  enlaceSesion: string | null;
  horarios: HorarioActividadDTO[];
  /** false = desactivada (soft-delete): oculta en pantallas de usuario, conserva inscritos. */
  activo: boolean;
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
  /** Rango de la actividad. Si se envían horarios, se recalcula como mínimo/máximo de estos. */
  fechaInicio: string;
  fechaFin: string;
  idTipoActividad?: number;
  idInstitucionSede?: number;
  sala?: string;
  modalidad?: ModalidadActividad;
  enlaceSesion?: string | null;
  horarios?: HorarioActividadDTO[];
  activo?: boolean;
  // Optional detail sections
  costo?: number;
}

export type ActualizarActividadDTO = Partial<CrearActividadDTO>;
