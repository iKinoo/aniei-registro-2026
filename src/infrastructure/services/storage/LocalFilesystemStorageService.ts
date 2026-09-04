import { createHmac } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { FileReference, IStorageService } from "@/application/ports/IStorageService";

/**
 * Almacenamiento en el sistema de archivos del proyecto (./storage).
 * Postgres guarda SOLO la ruta `bucket/path`; los binarios viven en disco.
 * Sin Docker, sin S3: filesystem puro.
 */
export class LocalFilesystemStorageService implements IStorageService {
  private readonly baseDir: string;
  private readonly secret: string;
  private readonly ttlSeconds: number;

  constructor(baseDir: string, secret: string, ttlSeconds = 300) {
    this.baseDir = path.resolve(baseDir);
    this.secret = secret;
    this.ttlSeconds = ttlSeconds;
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

  async subir(ruta: string, buffer: Buffer, mime: string): Promise<string> {
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
    const exp = Math.floor(Date.now() / 1000) + this.ttlSeconds;
    const sig = createHmac("sha256", this.secret).update(`${ruta}:${exp}`).digest("hex");
    return `/api/archivos/${ruta}?exp=${exp}&sig=${sig}`;
  }
}

/** Verifica firmas generadas por getAccess. */
export function verificarFirma(ruta: string, exp: string, sig: string, secret: string): boolean {
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum * 1000 < Date.now()) return false;
  if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
  try {
    const esperado = createHmac("sha256", secret).update(`${ruta}:${expNum}`).digest("hex");
    if (esperado.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < esperado.length; i++) diff |= esperado.charCodeAt(i) ^ sig.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}
