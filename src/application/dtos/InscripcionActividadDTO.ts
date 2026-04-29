export interface InscripcionActividadDTO {
  idInscripcion: number;
  folioRegistro: string;
  idActividad: number;
  fechaInscripcion: string;
  urlConstancia?: string | null;
}
