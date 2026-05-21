import { PrismaClient } from '@/generated/prisma/client';
import { IPrecioInscripcionRepository, CrearPrecioDTO, ActualizarPrecioDTO } from '@/application/ports/IPrecioInscripcionRepository';
import { PrecioInscripcion } from '@/shared/types/catalogos';

const toPrecioInscripcion = (row: {
  id: number;
  fecha_limite: Date;
  costo: unknown;
  costo_miembro: unknown;
  orden: number;
  activo: boolean;
}): PrecioInscripcion => ({
  id: row.id,
  fechaLimite: row.fecha_limite,
  costo: Number(row.costo),
  costoMiembro: Number(row.costo_miembro),
  orden: row.orden,
  activo: row.activo,
});

export class PrismaPrecioInscripcionRepository implements IPrecioInscripcionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerTodos(): Promise<PrecioInscripcion[]> {
    const rows = await this.prisma.precios_inscripcion.findMany({
      orderBy: { orden: 'asc' },
    });
    return rows.map(toPrecioInscripcion);
  }

  async obtenerVigente(): Promise<PrecioInscripcion | null> {
    const ahora = new Date();
    const rows = await this.prisma.precios_inscripcion.findMany({
      where: {
        activo: true,
        fecha_limite: { lte: ahora },
      },
      orderBy: { fecha_limite: 'desc' },
      take: 1,
    });
    return rows.length > 0 ? toPrecioInscripcion(rows[0]) : null;
  }

  async obtenerPorId(id: number): Promise<PrecioInscripcion | null> {
    const row = await this.prisma.precios_inscripcion.findUnique({ where: { id } });
    return row ? toPrecioInscripcion(row) : null;
  }

  async crear(data: CrearPrecioDTO): Promise<PrecioInscripcion> {
    const row = await this.prisma.precios_inscripcion.create({
      data: {
        fecha_limite: data.fechaLimite,
        costo: data.costo,
        costo_miembro: data.costoMiembro ?? 0,
        orden: data.orden,
        activo: data.activo,
      },
    });
    return toPrecioInscripcion(row);
  }

  async actualizar(id: number, data: ActualizarPrecioDTO): Promise<PrecioInscripcion> {
    const row = await this.prisma.precios_inscripcion.update({
      where: { id },
      data: {
        ...(data.fechaLimite !== undefined && { fecha_limite: data.fechaLimite }),
        ...(data.costo !== undefined && { costo: data.costo }),
        ...(data.costoMiembro !== undefined && { costo_miembro: data.costoMiembro }),
        ...(data.orden !== undefined && { orden: data.orden }),
        ...(data.activo !== undefined && { activo: data.activo }),
      },
    });
    return toPrecioInscripcion(row);
  }

  async eliminar(id: number): Promise<void> {
    await this.prisma.precios_inscripcion.delete({ where: { id } });
  }
}
