import { Acceso } from '@/core/entities/Acceso';

export interface IAccesoRepository {
  buscarPorEmail(email: string): Promise<Acceso | null>;
}
