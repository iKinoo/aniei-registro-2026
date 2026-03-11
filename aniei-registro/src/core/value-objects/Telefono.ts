export class Telefono {
  private constructor(
    private readonly numero: string,
    private readonly lada: string | null,
    private readonly extension: string | null,
  ) {}

  static create(numero: string, lada?: string | null, extension?: string | null): Telefono {
    const trimmed = numero.trim();
    if (!trimmed) {
      throw new Error('El número de teléfono es requerido');
    }
    if (!/^\d[\d\s\-]{5,19}$/.test(trimmed)) {
      throw new Error(`Formato de teléfono inválido: ${trimmed}`);
    }
    return new Telefono(trimmed, lada?.trim() || null, extension?.trim() || null);
  }

  completo(): string {
    let resultado = '';
    if (this.lada) resultado += `(${this.lada}) `;
    resultado += this.numero;
    if (this.extension) resultado += ` ext. ${this.extension}`;
    return resultado;
  }

  getNumero(): string { return this.numero; }
  getLada(): string | null { return this.lada; }
  getExtension(): string | null { return this.extension; }
}
