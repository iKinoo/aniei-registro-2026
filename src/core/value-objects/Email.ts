export class Email {
  private constructor(private readonly valor: string) {}

  static create(email: string): Email {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      throw new Error('El correo electrónico es requerido');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      throw new Error(`Formato de correo inválido: ${trimmed}`);
    }
    return new Email(trimmed);
  }

  toString(): string {
    return this.valor;
  }

  equals(other: Email): boolean {
    return this.valor === other.valor;
  }
}
