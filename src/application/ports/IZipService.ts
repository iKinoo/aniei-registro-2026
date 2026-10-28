export interface ArchivoZip {
  nombre: string;
  contenido: Uint8Array;
}

export interface IZipService {
  comprimir(archivos: ArchivoZip[]): Promise<Uint8Array>;
}
