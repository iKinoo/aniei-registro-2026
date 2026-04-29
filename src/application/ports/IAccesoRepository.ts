import { Acceso } from '@/core/entities/Acceso';

export interface IAccesoRepository {
  buscarPorEmail(email: string): Promise<Acceso | null>;
  crear(email: string, passwordHash: string, rol: string, folioRegistro?: string, nombre?: string): Promise<Acceso>;
}
