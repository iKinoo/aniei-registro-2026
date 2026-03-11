export class Monto {
  private constructor(private readonly valor: number) {}

  static create(monto: number): Monto {
    if (monto < 0) {
      throw new Error('El monto no puede ser negativo');
    }
    const redondeado = Math.round(monto * 100) / 100;
    return new Monto(redondeado);
  }

  toNumber(): number {
    return this.valor;
  }

  esMayorQue(otro: Monto): boolean {
    return this.valor > otro.valor;
  }

  sumar(otro: Monto): Monto {
    return Monto.create(this.valor + otro.valor);
  }

  equals(other: Monto): boolean {
    return this.valor === other.valor;
  }
}
