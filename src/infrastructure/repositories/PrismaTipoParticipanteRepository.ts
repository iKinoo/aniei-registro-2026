import { PrismaClient } from '@/generated/prisma/client';
import { ITipoParticipanteRepository, CrearTipoParticipanteDTO, ActualizarTipoParticipanteDTO } from '@/application/ports/ITipoParticipanteRepository';
import { TipoParticipante } from '@/shared/types/catalogos';

const toTipoParticipante = (row: {
  id_tipo_participante: number;
  descripcion: string;
  clave: string | null;
  orden: number;
}): TipoParticipante => ({
  idTipoParticipante: row.id_tipo_participante,
  descripcion: row.descripcion,
  clave: row.clave,
  orden: row.orden,
});

export class PrismaTipoParticipanteRepository implements ITipoParticipanteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerTodos(): Promise<TipoParticipante[]> {
    const rows = await this.prisma.tipo_participante.findMany({
      orderBy: { orden: 'asc' },
    });
    return rows.map(toTipoParticipante);
  }

  async obtenerPorId(id: number): Promise<TipoParticipante | null> {
    const row = await this.prisma.tipo_participante.findUnique({
      where: { id_tipo_participante: id },
    });
    return row ? toTipoParticipante(row) : null;
  }

  async crear(data: CrearTipoParticipanteDTO): Promise<TipoParticipante> {
    const row = await this.prisma.tipo_participante.create({
      data: {
        descripcion: data.descripcion,
        clave: data.clave ?? null,
        orden: data.orden,
      },
    });
    return toTipoParticipante(row);
  }

  async actualizar(id: number, data: ActualizarTipoParticipanteDTO): Promise<TipoParticipante> {
    const row = await this.prisma.tipo_participante.update({
      where: { id_tipo_participante: id },
      data: {
        ...(data.descripcion !== undefined && { descripcion: data.descripcion }),
        ...(data.clave !== undefined && { clave: data.clave }),
        ...(data.orden !== undefined && { orden: data.orden }),
      },
    });
    return toTipoParticipante(row);
  }

  async eliminar(id: number): Promise<void> {
    await this.prisma.tipo_participante.delete({
      where: { id_tipo_participante: id },
    });
  }
}
