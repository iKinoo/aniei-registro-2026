import { Acceso } from '@/core/entities/Acceso';

export interface IAccesoRepository {
  buscarPorEmail(email: string): Promise<Acceso | null>;
  crear(email: string, passwordHash: string, rol: string, idUsuario?: number, nombre?: string): Promise<Acceso>;
}
