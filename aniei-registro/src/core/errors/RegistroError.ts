export class RegistroError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'RegistroError';
  }

  static CORREO_DUPLICADO(correo: string): RegistroError {
    return new RegistroError(
      `El correo ${correo} ya se encuentra registrado`,
      'CORREO_DUPLICADO',
    );
  }

  static DATOS_INVALIDOS(detalle: string): RegistroError {
    return new RegistroError(
      `Datos de registro inválidos: ${detalle}`,
      'DATOS_INVALIDOS',
    );
  }
}
