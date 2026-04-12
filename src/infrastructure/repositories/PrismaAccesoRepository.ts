import { PrismaClient } from '@/generated/prisma/client';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import { Acceso } from '@/core/entities/Acceso';

export class PrismaAccesoRepository implements IAccesoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarPorEmail(email: string): Promise<Acceso | null> {
    const rawAcceso = await this.prisma.accesos.findUnique({
      where: { email },
    });

    if (!rawAcceso) return null;

    return Acceso.create({
      idAcceso: rawAcceso.id_acceso,
      email: rawAcceso.email,
      rol: rawAcceso.rol || 'USER',
      nombre: rawAcceso.nombre,
      authId: rawAcceso.auth_id,
    });
  }

  async crear(email: string, passwordHash: string, rol: string, idUsuario?: number, nombre?: string): Promise<Acceso> {
    const rawAcceso = await this.prisma.accesos.create({
      data: {
        email,
        password: passwordHash,
        rol,
        id_usuario: idUsuario ?? null,
        nombre: nombre ?? null,
      },
    });

    return Acceso.create({
      idAcceso: rawAcceso.id_acceso,
      email: rawAcceso.email,
      rol: rawAcceso.rol || 'USER',
      nombre: rawAcceso.nombre,
      authId: rawAcceso.auth_id,
    });
  }
}
