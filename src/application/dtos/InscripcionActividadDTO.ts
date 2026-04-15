export interface InscripcionActividadDTO {
  idInscripcion: number;
  idUsuario: number;
  idActividad: number;
  fechaInscripcion: string;
  urlConstancia?: string | null;
}
