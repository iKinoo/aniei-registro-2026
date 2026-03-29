export interface AuthSessionDTO {
  idAcceso: number;
  nombre: string | null;
  email: string;
  authId: string | null;
  rol: string;
}
