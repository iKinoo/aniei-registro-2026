import { PrismaClient } from '@/generated/prisma/client';
import { IDepositoRepository } from '@/application/ports/IDepositoRepository';
import { Deposito } from '@/core/entities/Deposito';
import { DepositoMapper } from '../mappers/DepositoMapper';

export class PrismaDepositoRepository implements IDepositoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(deposito: Deposito): Promise<Deposito> {
    const data = DepositoMapper.toPersistence(deposito);
    const created = await this.prisma.depositos.create({ data });
    return DepositoMapper.toDomain(created);
  }

  async buscarPorUsuario(folioRegistro: string): Promise<Deposito | null> {
    const found = await this.prisma.depositos.findFirst({
      where: { folio_registro: folioRegistro },
      orderBy: { fecha_registro: 'desc' },
    });
    return found ? DepositoMapper.toDomain(found) : null;
  }

  async buscarTodosPorUsuario(folioRegistro: string): Promise<Deposito[]> {
    const rows = await this.prisma.depositos.findMany({
      where: { folio_registro: folioRegistro },
      orderBy: { fecha_registro: 'desc' },
    });
    return rows.map((r) => DepositoMapper.toDomain(r));
  }
}
