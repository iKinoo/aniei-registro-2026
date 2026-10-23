export type MotivoExportacionBaseDatos =
  | 'CONCURRENCIA'
  | 'SIN_CONFIGURAR'
  | 'BINARIO_NO_DISPONIBLE'
  | 'TIMEOUT'
  | 'TAMANO_EXCEDIDO'
  | 'CANCELADO'
  | 'FALLO';

const MENSAJES: Record<MotivoExportacionBaseDatos, string> = {
  CONCURRENCIA: 'Ya hay una exportación de la base de datos en curso. Espera a que termine e inténtalo de nuevo.',
  SIN_CONFIGURAR: 'La exportación de la base de datos no está configurada en el servidor.',
  BINARIO_NO_DISPONIBLE: 'El cliente mysqldump no está disponible en el servidor.',
  TIMEOUT: 'La generación del respaldo superó el tiempo máximo permitido. Inténtalo de nuevo.',
  TAMANO_EXCEDIDO: 'El respaldo superó el tamaño máximo permitido. Contacta al administrador del sistema.',
  CANCELADO: 'La exportación de la base de datos fue cancelada.',
  FALLO: 'No se pudo generar el respaldo de la base de datos. Inténtalo de nuevo.',
};

export class ExportacionBaseDatosError extends Error {
  constructor(
    public readonly motivo: MotivoExportacionBaseDatos,
    public readonly detalle?: string,
  ) {
    super(MENSAJES[motivo]);
    this.name = 'ExportacionBaseDatosError';
  }
}
