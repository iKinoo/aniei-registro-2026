export interface FileReference {
  bucket: string;
  path: string;
}

export function parseFileReference(ruta: string): FileReference {
  const parts = ruta.split('/');
  return {
    bucket: parts[0],
    path: parts.slice(1).join('/')
  };
}

export interface IStorageService {
  subir(ruta: string, buffer: Buffer, mime: string): Promise<string>;
  getAccess(file: FileReference): Promise<string>;
  eliminar(ruta: string): Promise<void>;
}
