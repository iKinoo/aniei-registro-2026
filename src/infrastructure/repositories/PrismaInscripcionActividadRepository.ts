import { RegistroError } from '@/core/errors/RegistroError';
import type { Prisma } from '@/generated/prisma/client';
import { IInscripcionActividadRepository } from '@/application/ports/IInscripcionActividadRepository';
import { InscritoDTO } from '@/application/dtos/ActividadDTO';

export class PrismaInscripcionActividadRepository implements IInscripcionActividadRepository {
  constructor(private readonly prisma: Prisma.TransactionClient) {}

  async obtenerPorActividad(idActividad: number): Promise<InscritoDTO[]> {
    const rows = await this.prisma.inscripcion_actividades.findMany({
      where: { id_actividad: idActividad },
      include: {
        usuarios: { select: { folio_registro: true, nombre: true, apellido: true, correo: true } },
      },
      orderBy: { fecha_inscripcion: 'asc' },
    });
    return rows.map((r) => ({
      folioRegistro: r.usuarios!.folio_registro,
      nombre: r.usuarios!.nombre,
      apellido: r.usuarios!.apellido,
      correo: r.usuarios!.correo,
      fechaInscripcion: r.fecha_inscripcion,
      urlConstancia: r.url_constancia,
    }));
  }

  async crearMuchas(folioRegistro: string, idsActividades: number[]): Promise<void> {
    if (idsActividades.length === 0) return;
    await this.prisma.inscripcion_actividades.createMany({
      data: idsActividades.map((idActividad) => ({
        folio_registro: folioRegistro,
        id_actividad: idActividad,
        fecha_inscripcion: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  async obtenerIdsPorUsuario(folioRegistro: string): Promise<number[]> {
    const rows = await this.prisma.inscripcion_actividades.findMany({
      where: { folio_registro: folioRegistro },
      select: { id_actividad: true },
    });
    return rows.map((r) => r.id_actividad!).filter((id): id is number => id !== null);
  }

  async crearMuchasConValidacion(
    folioRegistro: string,
    idsActividades: number[],
  ): Promise<{ ok: number[]; sinCupo: number[] }> {
    const ok: number[] = [];
    const sinCupo: number[] = [];
    for (const idActividad of [...new Set(idsActividades)].sort((a, b) => a - b)) {
      const [actividad] = await this.prisma.$queryRaw<Array<{ cupo_maximo: number | null }>>`
        SELECT cupo_maximo FROM actividades WHERE id_actividad = ${idActividad} FOR UPDATE
      `;
      if (!actividad) throw new Error('Actividad no encontrada');
      const existente = await this.prisma.inscripcion_actividades.findUnique({
        where: { folio_registro_id_actividad: { folio_registro: folioRegistro, id_actividad: idActividad } },
      });
      if (existente) {
        throw RegistroError.DATOS_INVALIDOS('Ya existe una inscripción en la actividad seleccionada');
      }
      const total = await this.prisma.inscripcion_actividades.count({ where: { id_actividad: idActividad } });
      if (actividad.cupo_maximo && total >= actividad.cupo_maximo) {
        sinCupo.push(idActividad);
        continue;
      }
      await this.prisma.inscripcion_actividades.create({
        data: { folio_registro: folioRegistro, id_actividad: idActividad, fecha_inscripcion: new Date() },
      });
      ok.push(idActividad);
    }
    return { ok, sinCupo };
  }

  async actualizarUrlConstancia(idActividad: number, folioRegistro: string, url: string): Promise<void> {
    await this.prisma.inscripcion_actividades.update({
      where: {
        folio_registro_id_actividad: {
          folio_registro: folioRegistro,
          id_actividad: idActividad,
        },
      },
      data: {
        url_constancia: url,
      },
    });
  }
}
