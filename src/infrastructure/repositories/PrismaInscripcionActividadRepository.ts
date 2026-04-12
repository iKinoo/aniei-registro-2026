import { PrismaClient } from '@/generated/prisma/client';
import { IInscripcionActividadRepository } from '@/application/ports/IInscripcionActividadRepository';

export class PrismaInscripcionActividadRepository implements IInscripcionActividadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crearMuchas(idUsuario: number, idsActividades: number[]): Promise<void> {
    if (idsActividades.length === 0) return;
    await this.prisma.inscripcion_actividades.createMany({
      data: idsActividades.map((idActividad) => ({
        id_usuario: idUsuario,
        id_actividad: idActividad,
        fecha_inscripcion: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  async obtenerIdsPorUsuario(idUsuario: number): Promise<number[]> {
    const rows = await this.prisma.inscripcion_actividades.findMany({
      where: { id_usuario: idUsuario },
      select: { id_actividad: true },
    });
    return rows.map((r) => r.id_actividad!).filter((id): id is number => id !== null);
  }
}
