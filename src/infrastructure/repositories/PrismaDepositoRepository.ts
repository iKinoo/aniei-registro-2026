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

  async buscarPorUsuario(idUsuario: number): Promise<Deposito | null> {
    const found = await this.prisma.depositos.findFirst({
      where: { id_usuario: idUsuario },
      orderBy: { fecha_registro: 'desc' },
    });
    return found ? DepositoMapper.toDomain(found) : null;
  }
}
