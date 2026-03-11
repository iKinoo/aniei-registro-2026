export class FolioRecibo {
  private constructor(private readonly valor: string) {}

  static create(folio: string): FolioRecibo {
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
    return new FolioRecibo(trimmed);
  }

  toString(): string {
    return this.valor;
  }

  equals(other: FolioRecibo): boolean {
    return this.valor === other.valor;
  }
}
