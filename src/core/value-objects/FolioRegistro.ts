export class FolioRegistro {
  private constructor(private readonly valor: string) {}

  static create(folio: string): FolioRegistro {
    const trimmed = folio.trim();
    if (!trimmed) {
      throw new Error('El folio de recibo es requerido');
    }
    if (trimmed.length > 15) {
      throw new Error('El folio de recibo no puede exceder 15 caracteres');
    }
    if (!/^[A-Za-z0-9\-]+$/.test(trimmed)) {
      throw new Error('El folio de recibo solo puede contener letras, números y guiones');
    }
    return new FolioRegistro(trimmed);
  }

  toString(): string {
    return this.valor;
  }

  equals(other: FolioRegistro): boolean {
    return this.valor === other.valor;
  }
}
