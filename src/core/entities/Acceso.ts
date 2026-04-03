export class Acceso {
  constructor(
    public readonly idAcceso: number,
    public readonly email: string,
    public readonly rol: string,
    public readonly nombre: string | null = null,
    public readonly authId: string | null = null,
  ) {}

  static create(props: {
    idAcceso: number;
    email: string;
    rol: string;
    nombre?: string | null;
    authId?: string | null;
  }): Acceso {
    return new Acceso(
      props.idAcceso,
      props.email,
      props.rol,
      props.nombre || null,
      props.authId || null
    );
  }

  isAdmin(): boolean {
    return this.rol.toLowerCase() === 'admin';
  }
}
