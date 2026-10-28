export interface ListasAsistenciaZipDTO {
  readonly nombreArchivo: string;
  readonly contenido: Uint8Array;
  readonly totalActividades: number;
  readonly totalParticipantes: number;
}
