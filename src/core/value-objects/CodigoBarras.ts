export class CodigoBarras {
  private constructor(private readonly valor: string) {}

  static create(codigo: string): CodigoBarras {
    const trimmed = codigo.trim();
    if (!trimmed) {
      throw new Error('El código de barras es requerido');
    }
    if (trimmed.length > 50) {
      throw new Error('El código de barras no puede exceder 50 caracteres');
    }
    return new CodigoBarras(trimmed);
  }

  toString(): string {
    return this.valor;
  }

  equals(other: CodigoBarras): boolean {
    return this.valor === other.valor;
  }
}
