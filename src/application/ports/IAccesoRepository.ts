import { Acceso } from '@/core/entities/Acceso';

export interface IAccesoRepository {
  buscarPorFolioRegistro(folioRegistro: string): Promise<Acceso | null>;
  obtenerCredenciales(folio: string): Promise<{ acceso: Acceso; passwordHash: string } | null>;
  actualizarCredenciales(folio: string, correo: string, passwordHash: string): Promise<void>;
  crear(passwordHash: string, rol: string, folioRegistro: string, nombre?: string, email?: string): Promise<Acceso>;
}
