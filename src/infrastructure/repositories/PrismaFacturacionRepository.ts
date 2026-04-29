import { PrismaClient } from '@/generated/prisma/client';
import { IFacturacionRepository } from '@/application/ports/IFacturacionRepository';
import { Facturacion } from '@/core/entities/Facturacion';
import { FacturacionMapper } from '../mappers/FacturacionMapper';

export class PrismaFacturacionRepository implements IFacturacionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(facturacion: Facturacion): Promise<Facturacion> {
    const data = FacturacionMapper.toPersistence(facturacion);
    const created = await this.prisma.facturaciones.create({ data });
    return FacturacionMapper.toDomain(created);
  }

  async buscarPorUsuario(folioRegistro: string): Promise<Facturacion | null> {
    const found = await this.prisma.facturaciones.findFirst({
      where: { folio_registro: folioRegistro },
    });
    return found ? FacturacionMapper.toDomain(found) : null;
  }
}
