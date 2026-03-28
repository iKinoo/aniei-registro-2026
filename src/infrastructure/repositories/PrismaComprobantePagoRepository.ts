import { PrismaClient } from '@/generated/prisma/client';
import { IComprobantePagoRepository } from '@/application/ports/IComprobantePagoRepository';
import { ComprobantePago } from '@/core/entities/ComprobantePago';
import { ComprobantePagoMapper } from '../mappers/ComprobantePagoMapper';

export class PrismaComprobantePagoRepository implements IComprobantePagoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(comprobante: ComprobantePago): Promise<ComprobantePago> {
    const data = ComprobantePagoMapper.toPersistence(comprobante);
    const created = await this.prisma.comprobantes_pago.create({ data });
    return ComprobantePagoMapper.toDomain(created);
  }

  async buscarPorUsuario(idUsuario: number): Promise<ComprobantePago | null> {
    const found = await this.prisma.comprobantes_pago.findFirst({
      where: { id_usuario: idUsuario },
      orderBy: { fecha_registro: 'desc' },
    });
    return found ? ComprobantePagoMapper.toDomain(found) : null;
  }
}
