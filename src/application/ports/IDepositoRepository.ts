import { Deposito } from '@/core/entities/Deposito';

export interface IDepositoRepository {
  crear(deposito: Deposito): Promise<Deposito>;
  buscarPorUsuario(folioRegistro: string): Promise<Deposito | null>;
  buscarTodosPorUsuario(folioRegistro: string): Promise<Deposito[]>;
}
