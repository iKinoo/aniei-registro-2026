import { ComprobantePago } from '@/core/entities/ComprobantePago';

export interface IComprobantePagoRepository {
  crear(comprobante: ComprobantePago): Promise<ComprobantePago>;
  buscarPorUsuario(idUsuario: number): Promise<ComprobantePago | null>;
}
