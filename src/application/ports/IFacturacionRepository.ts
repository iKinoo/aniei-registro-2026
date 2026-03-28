import { Facturacion } from '@/core/entities/Facturacion';

export interface IFacturacionRepository {
  crear(facturacion: Facturacion): Promise<Facturacion>;
  buscarPorUsuario(idUsuario: number): Promise<Facturacion | null>;
}
