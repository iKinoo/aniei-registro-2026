import { PrismaClient } from '@/generated/prisma/client';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import { Acceso } from '@/core/entities/Acceso';

export class PrismaAccesoRepository implements IAccesoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorFolioRegistro(folioRegistro: string): Promise<Acceso | null> {
    const rawAcceso = await this.prisma.accesos.findFirst({
      where: { folio_registro: folioRegistro },
    });
    if (!rawAcceso) return null;
    return Acceso.create({
      idAcceso: rawAcceso.id_acceso,
      folioRegistro: rawAcceso.folio_registro,
      email: rawAcceso.email,
      rol: rawAcceso.rol || 'USER',
      nombre: rawAcceso.nombre,
      authId: rawAcceso.auth_id,
    });
  }

  async crear(
    passwordHash: string,
    rol: string,
    folioRegistro: string,
    nombre?: string,
    email?: string,
  ): Promise<Acceso> {
    const rawAcceso = await this.prisma.accesos.create({
      data: {
        folio_registro: folioRegistro,
        email: email ?? null,
        password: passwordHash,
        rol: rol as any,
        nombre: nombre ?? null,
      },
    });
    return Acceso.create({
      idAcceso: rawAcceso.id_acceso,
      folioRegistro: rawAcceso.folio_registro,
      email: rawAcceso.email,
      rol: rawAcceso.rol || 'USER',
      nombre: rawAcceso.nombre,
      authId: rawAcceso.auth_id,
    });
  }
}
