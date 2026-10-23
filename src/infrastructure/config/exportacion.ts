import { z } from 'zod';
import type { IExportacionBaseDatosService } from '@/application/ports/IExportacionBaseDatosService';
import {
  MysqlDumpExportacionBaseDatosService,
  parsearConexionMysql,
  type ConexionMysql,
} from '@/infrastructure/services/database/MysqlDumpExportacionBaseDatosService';

const esquemaOpciones = z.object({
  MYSQLDUMP_PATH: z.string().min(1).default('mysqldump'),
  DB_EXPORT_TIMEOUT_SECONDS: z.coerce.number().int().positive().max(3600).default(120),
  DB_EXPORT_MAX_BYTES: z.coerce.number().int().positive().default(1073741824),
});

let instancia: IExportacionBaseDatosService | null = null;

export function getExportacionBaseDatosService(): IExportacionBaseDatosService {
  if (instancia) return instancia;
  const opciones = esquemaOpciones.parse({
    MYSQLDUMP_PATH: process.env.MYSQLDUMP_PATH || undefined,
    DB_EXPORT_TIMEOUT_SECONDS: process.env.DB_EXPORT_TIMEOUT_SECONDS || undefined,
    DB_EXPORT_MAX_BYTES: process.env.DB_EXPORT_MAX_BYTES || undefined,
  });
  let conexion: ConexionMysql | null = null;
  try {
    conexion = parsearConexionMysql(process.env.DATABASE_URL ?? '');
  } catch {
    conexion = null;
  }
  instancia = new MysqlDumpExportacionBaseDatosService(conexion, {
    binario: opciones.MYSQLDUMP_PATH,
    timeoutMs: opciones.DB_EXPORT_TIMEOUT_SECONDS * 1000,
    maxBytes: opciones.DB_EXPORT_MAX_BYTES,
  });
  return instancia;
}
