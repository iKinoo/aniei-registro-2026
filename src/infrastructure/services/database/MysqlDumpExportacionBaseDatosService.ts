import { spawn } from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createGzip } from 'node:zlib';
import type { ExportacionBaseDatosDTO } from '@/application/dtos/ExportacionBaseDatosDTO';
import type { CancelacionExportacion, IExportacionBaseDatosService } from '@/application/ports/IExportacionBaseDatosService';
import { ExportacionBaseDatosError, type MotivoExportacionBaseDatos } from '@/core/errors/ExportacionBaseDatosError';

export interface ConexionMysql {
  host: string;
  port: number;
  usuario: string;
  password: string;
  base: string;
}

export interface OpcionesExportacionMysql {
  binario: string;
  timeoutMs: number;
  maxBytes: number;
  directorioTemporal?: string;
  estancamientoMs?: number;
}

interface SesionExportacion {
  directorio: string | null;
  proceso: ChildProcess | null;
  cerrada: boolean;
  cierre: Promise<void> | null;
  martillo: ReturnType<typeof setTimeout> | null;
}

const IDENTIFICADOR_BASE = /^[A-Za-z0-9_$]+$/;
const PREFIJO_TEMPORAL = 'aniei-bd-export-';
const EDAD_MAXIMA_TEMPORAL_MS = 6 * 60 * 60 * 1000;
const BLOQUE_LECTURA = 256 * 1024;
const DIAGNOSTICO_MAX = 2048;
const ESTANCAMIENTO_POR_DEFECTO_MS = 60_000;
const GRACIA_KILL_MS = 5_000;

export function parsearConexionMysql(valor: string): ConexionMysql {
  const url = new URL(valor);
  if (url.protocol !== 'mysql:') throw new Error('El protocolo de DATABASE_URL debe ser mysql:');
  const host = url.hostname;
  const base = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!host || !url.username || !base) throw new Error('DATABASE_URL debe incluir host, usuario y base');
  if (!IDENTIFICADOR_BASE.test(base)) throw new Error('El nombre de base en DATABASE_URL no es válido');
  return {
    host,
    port: url.port ? Number(url.port) : 3306,
    usuario: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    base,
  };
}

export function escaparValorArchivoOpciones(valor: string): string {
  return valor
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/%/g, '\\%');
}

export function contenidoArchivoOpciones(conexion: ConexionMysql): string {
  return [
    '[client]',
    `host="${escaparValorArchivoOpciones(conexion.host)}"`,
    `port=${conexion.port}`,
    `user="${escaparValorArchivoOpciones(conexion.usuario)}"`,
    `password="${escaparValorArchivoOpciones(conexion.password)}"`,
    '',
  ].join('\n');
}

export function construirArgumentosMysqldump(archivoOpciones: string, base: string): string[] {
  return [
    `--defaults-file=${archivoOpciones}`,
    '--single-transaction',
    '--quick',
    '--default-character-set=utf8mb4',
    '--hex-blob',
    '--tz-utc',
    '--routines',
    '--events',
    '--triggers',
    '--no-tablespaces',
    '--set-gtid-purged=OFF',
    '--databases',
    base,
  ];
}

export function nombreRespaldoUtc(fecha: Date): string {
  const parte = (valor: number) => String(valor).padStart(2, '0');
  return `aniei-bd-${fecha.getUTCFullYear()}-${parte(fecha.getUTCMonth() + 1)}-${parte(fecha.getUTCDate())}_${parte(fecha.getUTCHours())}-${parte(fecha.getUTCMinutes())}-${parte(fecha.getUTCSeconds())}-UTC.sql.gz`;
}

export class MysqlDumpExportacionBaseDatosService implements IExportacionBaseDatosService {
  private readonly binario: string;
  private readonly timeoutMs: number;
  private readonly maxBytes: number;
  private readonly directorioTemporal: string;
  private readonly estancamientoMs: number;
  private sesionActiva: SesionExportacion | null = null;

  constructor(
    private readonly conexion: ConexionMysql | null,
    opciones: OpcionesExportacionMysql,
  ) {
    this.binario = opciones.binario;
    this.timeoutMs = opciones.timeoutMs;
    this.maxBytes = opciones.maxBytes;
    this.directorioTemporal = opciones.directorioTemporal ?? os.tmpdir();
    this.estancamientoMs = opciones.estancamientoMs ?? ESTANCAMIENTO_POR_DEFECTO_MS;
  }

  async exportar(cancelacion: CancelacionExportacion): Promise<ExportacionBaseDatosDTO> {
    if (!this.conexion) throw new ExportacionBaseDatosError('SIN_CONFIGURAR');
    if (cancelacion.estaCancelada()) throw new ExportacionBaseDatosError('CANCELADO');
    if (this.sesionActiva) throw new ExportacionBaseDatosError('CONCURRENCIA');

    const sesion: SesionExportacion = { directorio: null, proceso: null, cerrada: false, cierre: null, martillo: null };
    this.sesionActiva = sesion;

    try {
      await this.limpiarTemporalesAbandonados();
      const archivoGzip = await this.generarRespaldo(sesion, cancelacion);
      const stat = await fs.promises.stat(archivoGzip);
      if (stat.size <= 0) throw new ExportacionBaseDatosError('FALLO', 'mysqldump no produjo salida');
      if (stat.size > this.maxBytes) throw new ExportacionBaseDatosError('TAMANO_EXCEDIDO');
      return {
        nombreArchivo: nombreRespaldoUtc(new Date()),
        tipoContenido: 'application/gzip',
        tamanoBytes: stat.size,
        contenido: this.leerBloques(archivoGzip, sesion),
        liberar: () => this.cerrarSesion(sesion),
      };
    } catch (error) {
      await this.cerrarSesion(sesion);
      throw error;
    }
  }

  private async generarRespaldo(sesion: SesionExportacion, cancelacion: CancelacionExportacion): Promise<string> {
    const conexion = this.conexion;
    if (!conexion) throw new ExportacionBaseDatosError('SIN_CONFIGURAR');
    if (!IDENTIFICADOR_BASE.test(conexion.base)) throw new ExportacionBaseDatosError('SIN_CONFIGURAR', 'El nombre de base no es válido');

    const directorio = await fs.promises.mkdtemp(path.join(this.directorioTemporal, PREFIJO_TEMPORAL));
    await fs.promises.chmod(directorio, 0o700);
    sesion.directorio = directorio;

    const archivoOpciones = path.join(directorio, 'my.cnf');
    const archivoGzip = path.join(directorio, 'respaldo.sql.gz');
    await fs.promises.writeFile(archivoOpciones, contenidoArchivoOpciones(conexion), { mode: 0o600 });

    const proceso = spawn(this.binario, construirArgumentosMysqldump(archivoOpciones, conexion.base), { stdio: 'pipe' });
    sesion.proceso = proceso;

    const compresor = createGzip();
    const destino = fs.createWriteStream(archivoGzip, { mode: 0o600 });

    await new Promise<void>((resolve, reject) => {
      let completado = false;
      let rechazado: ExportacionBaseDatosError | null = null;
      let salioBien = false;
      let comprimio = false;
      let cerro = false;
      let bytesComprimidos = 0;
      let diagnostico = '';
      let cronometro: ReturnType<typeof setTimeout> | null = null;

      const fracasar = (motivo: MotivoExportacionBaseDatos, detalle?: string) => {
        if (completado || rechazado) return;
        rechazado = new ExportacionBaseDatosError(motivo, this.sanear(detalle ?? '', conexion.password));
        if (cronometro) clearTimeout(cronometro);
        proceso.kill('SIGTERM');
        sesion.martillo = setTimeout(() => {
          try {
            proceso.kill('SIGKILL');
          } catch {
            /* el proceso ya terminó */
          }
        }, GRACIA_KILL_MS);
        sesion.martillo.unref();
        proceso.stdout?.destroy();
        proceso.stderr?.destroy();
        compresor.destroy();
        destino.destroy();
        reject(rechazado);
      };

      const intentarCompletar = () => {
        if (completado || rechazado || !(salioBien && comprimio && cerro)) return;
        completado = true;
        if (cronometro) clearTimeout(cronometro);
        resolve();
      };

      cronometro = setTimeout(() => fracasar('TIMEOUT', `La generación superó ${this.timeoutMs} ms.`), this.timeoutMs);
      cancelacion.alCancelar(() => fracasar('CANCELADO'));

      proceso.once('error', (error: Error) => {
        const code = (error as Error & { code?: string }).code;
        fracasar(code === 'ENOENT' ? 'BINARIO_NO_DISPONIBLE' : 'FALLO', `No se pudo ejecutar el cliente mysqldump: ${code ?? error.message}`);
      });

      proceso.stderr.on('data', (bloque: Buffer) => {
        diagnostico = (diagnostico + bloque.toString('utf8')).slice(-DIAGNOSTICO_MAX);
      });

      proceso.once('close', (codigo) => {
        if (codigo === 0) {
          salioBien = true;
          intentarCompletar();
        } else {
          fracasar('FALLO', `mysqldump terminó con código ${codigo}. ${diagnostico}`);
        }
      });

      compresor.on('data', (bloque: Buffer) => {
        bytesComprimidos += bloque.length;
        if (bytesComprimidos > this.maxBytes) fracasar('TAMANO_EXCEDIDO', `El respaldo superó ${this.maxBytes} bytes comprimidos.`);
      });
      compresor.once('end', () => {
        comprimio = true;
        intentarCompletar();
      });
      compresor.once('error', (error: Error) => fracasar('FALLO', `La compresión falló: ${error.message}`));

      destino.once('close', () => {
        cerro = true;
        intentarCompletar();
      });
      destino.once('error', (error: Error) => fracasar('FALLO', `No se pudo escribir el respaldo temporal: ${error.message}`));

      proceso.stdout.pipe(compresor).pipe(destino);
    });

    await fs.promises.unlink(archivoOpciones).catch(() => { /* ya no es necesario */ });
    return archivoGzip;
  }

  private async *leerBloques(archivo: string, sesion: SesionExportacion): AsyncGenerator<Uint8Array> {
    const fuente = fs.createReadStream(archivo, { highWaterMark: BLOQUE_LECTURA });
    const iterador = fuente[Symbol.asyncIterator]();
    try {
      for (;;) {
        const siguiente = iterador.next();
        let cronometro: ReturnType<typeof setTimeout> | undefined;
        const resultado = await Promise.race([
          siguiente.then((valor) => ({ estancado: false as const, valor })),
          new Promise<{ estancado: true }>((resolve) => {
            cronometro = setTimeout(() => resolve({ estancado: true }), this.estancamientoMs);
          }),
        ]);
        if (cronometro) clearTimeout(cronometro);
        if (resultado.estancado) {
          siguiente.catch(() => { /* el flujo se destruye abajo */ });
          fuente.destroy();
          throw new ExportacionBaseDatosError('TIMEOUT', 'La descarga del respaldo se estancó.');
        }
        if (resultado.valor.done) return;
        yield new Uint8Array(resultado.valor.value);
      }
    } finally {
      fuente.destroy();
      await this.cerrarSesion(sesion);
    }
  }

  private cerrarSesion(sesion: SesionExportacion): Promise<void> {
    if (!sesion.cierre) {
      sesion.cerrada = true;
      sesion.cierre = this.efectuarCierre(sesion);
    }
    return sesion.cierre;
  }

  private async efectuarCierre(sesion: SesionExportacion): Promise<void> {
    if (sesion.martillo) clearTimeout(sesion.martillo);
    const proceso = sesion.proceso;
    if (proceso && proceso.exitCode === null && proceso.signalCode === null) {
      try {
        proceso.kill('SIGKILL');
      } catch {
        /* el proceso ya terminó */
      }
    }
    const directorio = sesion.directorio;
    sesion.directorio = null;
    if (directorio) {
      await fs.promises.rm(directorio, { recursive: true, force: true }).catch(() => { /* mejor esfuerzo */ });
    }
    if (this.sesionActiva === sesion) this.sesionActiva = null;
  }

  private async limpiarTemporalesAbandonados(): Promise<void> {
    const raiz = this.directorioTemporal;
    let nombres: string[];
    try {
      nombres = await fs.promises.readdir(raiz);
    } catch {
      return;
    }
    const ahora = Date.now();
    for (const nombre of nombres) {
      if (!nombre.startsWith(PREFIJO_TEMPORAL)) continue;
      const ruta = path.join(raiz, nombre);
      try {
        const info = await fs.promises.stat(ruta);
        if (!info.isDirectory() || ahora - info.mtimeMs <= EDAD_MAXIMA_TEMPORAL_MS) continue;
        await fs.promises.rm(ruta, { recursive: true, force: true });
      } catch {
        /* temporales ajenos o ya eliminados */
      }
    }
  }

  private sanear(detalle: string, password: string): string {
    const sinCredencial = password.length > 0 ? detalle.split(password).join('***') : detalle;
    return sinCredencial.slice(0, DIAGNOSTICO_MAX);
  }
}
