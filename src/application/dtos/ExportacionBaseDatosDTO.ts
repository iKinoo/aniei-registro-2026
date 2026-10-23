export interface ExportacionBaseDatosDTO {
  readonly nombreArchivo: string;
  readonly tipoContenido: string;
  readonly tamanoBytes: number;
  readonly contenido: AsyncIterable<Uint8Array>;
  liberar(): Promise<void>;
}
