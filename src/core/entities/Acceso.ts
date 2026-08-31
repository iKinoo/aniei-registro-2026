export class Acceso {
  constructor(
    public readonly idAcceso: number,
    public readonly folioRegistro: string,
    public readonly rol: string,
    public readonly email: string | null = null,
    public readonly nombre: string | null = null,
    public readonly authId: string | null = null,
  ) {}

  static create(props: {
    idAcceso: number;
    folioRegistro: string;
    rol: string;
    email?: string | null;
    nombre?: string | null;
    authId?: string | null;
  }): Acceso {
    return new Acceso(
      props.idAcceso,
      props.folioRegistro,
      props.rol,
      props.email || null,
      props.nombre || null,
      props.authId || null,
    );
  }

  isAdmin(): boolean {
    return this.rol.toLowerCase() === 'admin';
  }
}
