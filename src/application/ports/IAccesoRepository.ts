import { Acceso } from '@/core/entities/Acceso';

export interface IAccesoRepository {
  buscarPorFolioRegistro(folioRegistro: string): Promise<Acceso | null>;
  crear(passwordHash: string, rol: string, folioRegistro: string, nombre?: string, email?: string): Promise<Acceso>;
}
