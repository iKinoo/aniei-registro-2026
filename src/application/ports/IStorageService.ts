export interface IStorageService {
  subir(ruta: string, buffer: Buffer, mime: string): Promise<string>;
  obtenerUrl(ruta: string): Promise<string>;
  eliminar(ruta: string): Promise<void>;
}
