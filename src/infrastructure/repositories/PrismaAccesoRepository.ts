import type { Prisma } from '@/generated/prisma/client';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import { Acceso } from '@/core/entities/Acceso';

export class PrismaAccesoRepository implements IAccesoRepository {
  constructor(private readonly prisma: Prisma.TransactionClient) {}

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

  async obtenerCredenciales(folio: string) {
    const row = await this.prisma.accesos.findFirst({ where: { folio_registro: folio } });
    if (!row?.password) return null;
    const acceso = Acceso.create({ idAcceso: row.id_acceso, folioRegistro: row.folio_registro,
      rol: row.rol, nombre: row.nombre, email: row.email, authId: row.auth_id });
    return { acceso, passwordHash: row.password };
  }

  async actualizarCredenciales(folio: string, correo: string, passwordHash: string): Promise<void> {
    const acceso = await this.prisma.accesos.findFirst({ where: { folio_registro: folio }, select: { id_acceso: true } });
    if (!acceso) throw new Error('Acceso no encontrado');
    await this.prisma.accesos.update({ where: { id_acceso: acceso.id_acceso }, data: { email: correo, password: passwordHash } });
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
        rol: rol === 'ADMIN' ? 'ADMIN' : 'USER',
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
