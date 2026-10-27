import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FileReference, IStorageService } from "@/application/ports/IStorageService";
import { crearEnlaceArchivo } from './firmaEnlaceArchivo';

/**
 * Almacenamiento en el sistema de archivos del proyecto (./storage).
 * Postgres guarda SOLO la ruta `bucket/path`; los binarios viven en disco.
 * Sin Docker, sin S3: filesystem puro.
 */
export class LocalFilesystemStorageService implements IStorageService {
  private readonly baseDir: string;
  private readonly secret: string;

  constructor(baseDir: string, secret: string) {
    this.baseDir = path.resolve(baseDir);
    this.secret = secret;
  }

  private resolveRuta(ruta: string): string {
    if (!ruta || ruta.includes("\0")) throw new Error("Ruta inválida");
    if (path.isAbsolute(ruta)) throw new Error("Ruta absoluta no permitida");
    const normalizada = path.posix.normalize(ruta.replace(/\\/g, "/"));
    if (normalizada === ".." || normalizada.startsWith("../") || normalizada.includes("/../")) {
      throw new Error("Path traversal no permitido");
    }
    const destino = path.resolve(this.baseDir, ...normalizada.split("/"));
    const relativo = path.relative(this.baseDir, destino);
    if (relativo === ".." || relativo.startsWith(`..${path.sep}`) || path.isAbsolute(relativo)) {
      throw new Error("Ruta fuera del directorio base");
    }
    return destino;
  }

  async subir(ruta: string, buffer: Uint8Array, mime: string): Promise<string> {
    void mime; // el MIME lo valida el VO ArchivoComprobante antes de llegar aquí
    const destino = this.resolveRuta(ruta);
    await mkdir(path.dirname(destino), { recursive: true });
    await writeFile(destino, buffer);
    return ruta;
  }

  async descargar(ruta: string): Promise<Buffer> {
    const destino = this.resolveRuta(ruta);
    return readFile(destino);
  }

  async eliminar(ruta: string): Promise<void> {
    const destino = this.resolveRuta(ruta);
    await rm(destino, { force: true });
  }

  async getAccess(file: FileReference): Promise<string> {
    const ruta = `${file.bucket}/${file.path}`;
    this.resolveRuta(ruta); // valida antes de firmar
    return crearEnlaceArchivo(ruta, this.secret);
  }
}
