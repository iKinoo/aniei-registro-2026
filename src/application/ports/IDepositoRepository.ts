import { Deposito } from '@/core/entities/Deposito';

export interface IDepositoRepository {
  crear(deposito: Deposito): Promise<Deposito>;
  buscarPorUsuario(idUsuario: number): Promise<Deposito | null>;
}
