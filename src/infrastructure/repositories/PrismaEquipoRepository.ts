import { PrismaClient } from '@/generated/prisma/client';
import { IEquipoRepository } from '@/application/ports/IEquipoRepository';
import { EquipoDTO, CrearEquipoDTO, ActualizarEquipoDTO, UsuarioBusquedaDTO } from '@/application/dtos/EquipoDTO';

const include = {
  equipo_integrantes: {
    include: {
      usuarios: {
        select: {
          folio_registro: true,
          nombre: true,
          apellido: true,
          correo: true,
        },
      },
    },
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDTO(row: any): EquipoDTO {
  return {
    idEquipo: row.id_equipo,
    numeroEquipo: row.numero_equipo,
    nombreEquipo: row.nombre_equipo,
    idActividad: row.id_actividad,
    idInstitucion: row.id_institucion ?? null,
    fechaRegistro: row.fecha_registro ?? null,
    integrantes: (row.equipo_integrantes ?? []).map((ei: { folio_registro: string; es_representante: boolean; usuarios: { folio_registro: string; nombre: string; apellido: string; correo: string } }) => ({
      folioRegistro: ei.usuarios.folio_registro,
      nombre: ei.usuarios.nombre,
      apellido: ei.usuarios.apellido,
      correo: ei.usuarios.correo,
      esRepresentante: ei.es_representante,
    })),
  };
}

export class PrismaEquipoRepository implements IEquipoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listarPorActividad(idActividad: number): Promise<EquipoDTO[]> {
    const rows = await this.prisma.equipos.findMany({
      where: { id_actividad: idActividad },
      include,
      orderBy: { numero_equipo: 'asc' },
    });
    return rows.map(mapToDTO);
  }

  async obtenerPorId(idEquipo: number): Promise<EquipoDTO | null> {
    const row = await this.prisma.equipos.findUnique({
      where: { id_equipo: idEquipo },
      include,
    });
    return row ? mapToDTO(row) : null;
  }

  async obtenerSiguienteNumero(idActividad: number): Promise<number> {
    const maxEquipo = await this.prisma.equipos.findFirst({
      where: { id_actividad: idActividad },
      orderBy: { numero_equipo: 'desc' },
      select: { numero_equipo: true },
    });
    return (maxEquipo?.numero_equipo ?? 0) + 1;
  }

  async crear(data: CrearEquipoDTO, numeroEquipo: number): Promise<EquipoDTO> {
    const row = await this.prisma.equipos.create({
      data: {
        numero_equipo: numeroEquipo,
        nombre_equipo: data.nombreEquipo,
        id_actividad: data.idActividad,
        equipo_integrantes: {
          create: data.integrantes.map((i) => ({
            folio_registro: i.folioRegistro,
            es_representante: i.esRepresentante,
          })),
        },
      },
      include,
    });
    return mapToDTO(row);
  }

  async actualizar(idEquipo: number, data: ActualizarEquipoDTO): Promise<EquipoDTO> {
    if (data.integrantes) {
      await this.prisma.equipo_integrantes.deleteMany({
        where: { id_equipo: idEquipo },
      });

      if (data.integrantes.length > 0) {
        await this.prisma.equipo_integrantes.createMany({
          data: data.integrantes.map((i) => ({
            id_equipo: idEquipo,
            folio_registro: i.folioRegistro,
            es_representante: i.esRepresentante,
          })),
        });
      }
    }

    const row = await this.prisma.equipos.update({
      where: { id_equipo: idEquipo },
      data: {
        ...(data.nombreEquipo !== undefined && { nombre_equipo: data.nombreEquipo }),
      },
      include,
    });
    return mapToDTO(row);
  }

  async eliminar(idEquipo: number): Promise<void> {
    await this.prisma.equipos.delete({
      where: { id_equipo: idEquipo },
    });
  }

  async buscarUsuarios(query: string): Promise<UsuarioBusquedaDTO[]> {
    const q = query.trim();
    if (q.length < 2) return [];

    const rows = await this.prisma.usuarios.findMany({
      where: {
        OR: [
          { folio_registro: { contains: q, mode: 'insensitive' } },
          { nombre: { contains: q, mode: 'insensitive' } },
          { apellido: { contains: q, mode: 'insensitive' } },
          { correo: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: {
        folio_registro: true,
        nombre: true,
        apellido: true,
        correo: true,
      },
      take: 10,
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    return rows.map((r) => ({
      folioRegistro: r.folio_registro,
      nombre: r.nombre,
      apellido: r.apellido,
      correo: r.correo,
    }));
  }
}
