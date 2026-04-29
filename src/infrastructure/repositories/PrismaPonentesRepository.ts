import { PrismaClient } from '@/generated/prisma/client';
import { IPonentesRepository } from '@/application/ports/IPonentesRepository';
import { PonenteDTO } from '@/application/dtos/ActividadDTO';

export class PrismaPonentesRepository implements IPonentesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async vincular(idActividad: number, folioRegistro: string, rol?: string): Promise<void> {
    await this.prisma.actividad_ponentes.upsert({
      where: { id_actividad_folio_registro_ponente: { id_actividad: idActividad, folio_registro_ponente: folioRegistro } },
      create: { id_actividad: idActividad, folio_registro_ponente: folioRegistro, rol: rol ?? 'Ponente' },
      update: { rol: rol ?? 'Ponente' },
    });
  }

  async desvincular(idActividad: number, folioRegistro: string): Promise<void> {
    await this.prisma.actividad_ponentes.delete({
      where: { id_actividad_folio_registro_ponente: { id_actividad: idActividad, folio_registro_ponente: folioRegistro } },
    });
  }

  async obtenerPorActividad(idActividad: number): Promise<PonenteDTO[]> {
    const rows = await this.prisma.actividad_ponentes.findMany({
      where: { id_actividad: idActividad },
      include: { usuarios: { select: { folio_registro: true, nombre: true, apellido: true, correo: true } } },
      orderBy: { rol: 'asc' },
    });
    return rows.map((r) => ({
      folioRegistro: r.folio_registro_ponente,
      nombre: r.usuarios.nombre,
      apellido: r.usuarios.apellido,
      correo: r.usuarios.correo,
      rol: r.rol ?? null,
      urlConstancia: r.url_constancia ?? null,
    }));
  }

  async actualizarUrlConstancia(idActividad: number, folioRegistro: string, url: string): Promise<void> {
    await this.prisma.actividad_ponentes.update({
      where: {
        id_actividad_folio_registro_ponente: { id_actividad: idActividad, folio_registro_ponente: folioRegistro }
      },
      data: {
        url_constancia: url
      }
    });
  }
}
