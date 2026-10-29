export interface InscripcionActividadDTO {
  idInscripcion: number;
  folioRegistro: string;
  idActividad: number;
  fechaInscripcion: string;
  urlConstancia?: string | null;
}

export interface ResultadoInscripcionManualDTO {
  folioRegistro: string;
  exito: boolean;
  error?: string;
}
