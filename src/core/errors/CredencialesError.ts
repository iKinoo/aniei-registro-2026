export class CredencialesError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'CredencialesError';
  }

  static ACCESO_NO_ENCONTRADO(folio: string): CredencialesError {
    return new CredencialesError(
      `No existe un acceso para el folio ${folio}`,
      'ACCESO_NO_ENCONTRADO',
    );
  }

  static CONTRASENA_INVALIDA(detalle: string): CredencialesError {
    return new CredencialesError(
      `Contraseña inválida: ${detalle}`,
      'CONTRASENA_INVALIDA',
    );
  }
}
