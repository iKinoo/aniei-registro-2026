const MIMES_PERMITIDOS = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
const TAMANIO_MAXIMO = 5 * 1024 * 1024; // 5 MB

export class ArchivoComprobante {
  private constructor(
    private readonly nombre: string,
    private readonly mime: string,
    private readonly tamanio: number,
  ) {}

  static create(nombre: string, mime: string, tamanio: number): ArchivoComprobante {
    if (!nombre.trim()) {
      throw new Error('El nombre del archivo es requerido');
    }
    if (!MIMES_PERMITIDOS.includes(mime.toLowerCase())) {
      throw new Error(
        `Tipo de archivo no permitido: ${mime}. Tipos permitidos: ${MIMES_PERMITIDOS.join(', ')}`,
      );
    }
    if (tamanio <= 0) {
      throw new Error('El archivo está vacío');
    }
    if (tamanio > TAMANIO_MAXIMO) {
      throw new Error(
        `El archivo excede el tamaño máximo permitido (${TAMANIO_MAXIMO / 1024 / 1024} MB)`,
      );
    }
    return new ArchivoComprobante(nombre.trim(), mime.toLowerCase(), tamanio);
  }

  getNombre(): string { return this.nombre; }
  getMime(): string { return this.mime; }
  getTamanio(): number { return this.tamanio; }

  esImagen(): boolean {
    return this.mime.startsWith('image/');
  }

  esPdf(): boolean {
    return this.mime === 'application/pdf';
  }
}
