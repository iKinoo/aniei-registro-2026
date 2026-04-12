import { PrismaClient } from '@/generated/prisma/client';
import { IPonentesRepository } from '@/application/ports/IPonentesRepository';
import { PonenteDTO } from '@/application/dtos/ActividadDTO';

export class PrismaPonentesRepository implements IPonentesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async vincular(idActividad: number, idUsuario: number, rol?: string): Promise<void> {
    await this.prisma.actividad_ponentes.upsert({
      where: { id_actividad_id_usuario_ponente: { id_actividad: idActividad, id_usuario_ponente: idUsuario } },
      create: { id_actividad: idActividad, id_usuario_ponente: idUsuario, rol: rol ?? 'Ponente' },
      update: { rol: rol ?? 'Ponente' },
    });
  }

  async desvincular(idActividad: number, idUsuario: number): Promise<void> {
    await this.prisma.actividad_ponentes.delete({
      where: { id_actividad_id_usuario_ponente: { id_actividad: idActividad, id_usuario_ponente: idUsuario } },
    });
  }

  async obtenerPorActividad(idActividad: number): Promise<PonenteDTO[]> {
    const rows = await this.prisma.actividad_ponentes.findMany({
      where: { id_actividad: idActividad },
      include: { usuarios: { select: { id_usuario: true, nombre: true, apellido: true, correo: true } } },
      orderBy: { rol: 'asc' },
    });
    return rows.map((r) => ({
      idUsuario: r.id_usuario_ponente,
      nombre: r.usuarios.nombre,
      apellido: r.usuarios.apellido,
      correo: r.usuarios.correo,
      rol: r.rol ?? null,
    }));
  }
}
