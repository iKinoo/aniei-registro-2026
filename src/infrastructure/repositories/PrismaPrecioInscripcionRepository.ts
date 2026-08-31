import { PrismaClient } from '@/generated/prisma/client';
import { IPrecioInscripcionRepository, CrearPrecioDTO, ActualizarPrecioDTO } from '@/application/ports/IPrecioInscripcionRepository';
import { PrecioInscripcion } from '@/shared/types/catalogos';

const toPrecioInscripcion = (row: {
  id: number;
  id_tipo_participante: number;
  es_afiliada: boolean;
  fecha_limite: Date;
  costo: unknown;
  orden: number;
  activo: boolean;
}): PrecioInscripcion => ({
  id: row.id,
  idTipoParticipante: row.id_tipo_participante,
  esAfiliada: row.es_afiliada,
  fechaLimite: row.fecha_limite,
  costo: Number(row.costo),
  orden: row.orden,
  activo: row.activo,
});

export class PrismaPrecioInscripcionRepository implements IPrecioInscripcionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerTodos(): Promise<PrecioInscripcion[]> {
    const rows = await this.prisma.precios_inscripcion.findMany({
      orderBy: [{ id_tipo_participante: 'asc' }, { orden: 'asc' }],
    });
    return rows.map(toPrecioInscripcion);
  }

  async obtenerVigente(idTipoParticipante: number, esAfiliada: boolean): Promise<PrecioInscripcion | null> {
    const ahora = new Date();
    const rows = await this.prisma.precios_inscripcion.findMany({
      where: {
        id_tipo_participante: idTipoParticipante,
        es_afiliada: esAfiliada,
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
        id_tipo_participante: data.idTipoParticipante,
        es_afiliada: data.esAfiliada,
        fecha_limite: data.fechaLimite,
        costo: data.costo,
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
        ...(data.idTipoParticipante !== undefined && { id_tipo_participante: data.idTipoParticipante }),
        ...(data.esAfiliada !== undefined && { es_afiliada: data.esAfiliada }),
        ...(data.fechaLimite !== undefined && { fecha_limite: data.fechaLimite }),
        ...(data.costo !== undefined && { costo: data.costo }),
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
