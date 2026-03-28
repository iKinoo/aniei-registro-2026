export class GrupoRegistroError extends Error {
  constructor(
    message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = 'GrupoRegistroError';
  }

  static MIEMBRO_CORREO_DUPLICADO(correo: string): GrupoRegistroError {
    return new GrupoRegistroError(
      `El correo ${correo} ya se encuentra registrado`,
      'MIEMBRO_CORREO_DUPLICADO',
    );
  }

  static GRUPO_VACIO(): GrupoRegistroError {
    return new GrupoRegistroError(
      'El grupo debe tener al menos un miembro',
      'GRUPO_VACIO',
    );
  }

  static RESPONSABLE_NO_ENCONTRADO(correo: string): GrupoRegistroError {
    return new GrupoRegistroError(
      `No se encontró al responsable con correo ${correo}`,
      'RESPONSABLE_NO_ENCONTRADO',
    );
  }
}
