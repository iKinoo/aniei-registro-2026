export class ComprobanteError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'ComprobanteError';
  }

  static TIPO_NO_PERMITIDO(mime: string): ComprobanteError {
    return new ComprobanteError(
      `Tipo de archivo no permitido: ${mime}`,
      'TIPO_NO_PERMITIDO',
    );
  }

  static TAMANIO_EXCEDIDO(tamanio: number): ComprobanteError {
    return new ComprobanteError(
      `El archivo excede el tamaño máximo permitido (${Math.round(tamanio / 1024 / 1024)} MB)`,
      'TAMANIO_EXCEDIDO',
    );
  }

  static ARCHIVO_REQUERIDO(): ComprobanteError {
    return new ComprobanteError(
      'El comprobante de pago es requerido',
      'ARCHIVO_REQUERIDO',
    );
  }
}
