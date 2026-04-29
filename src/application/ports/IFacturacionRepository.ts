import { Facturacion } from '@/core/entities/Facturacion';

export interface IFacturacionRepository {
  crear(facturacion: Facturacion): Promise<Facturacion>;
  buscarPorUsuario(folioRegistro: string): Promise<Facturacion | null>;
}
