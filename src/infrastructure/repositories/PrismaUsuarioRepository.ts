import { PrismaClient } from '@/generated/prisma/client';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { FolioRecibo } from '@/core/value-objects/FolioRecibo';
import { UsuarioMapper } from '../mappers/UsuarioMapper';

export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async crear(usuario: Usuario): Promise<Usuario> {
    const data = UsuarioMapper.toPersistence(usuario);
    const created = await this.prisma.usuarios.create({ data });
    return UsuarioMapper.toDomain(created);
  }

  async crearMuchos(usuarios: Usuario[]): Promise<Usuario[]> {
    const results: Usuario[] = [];
    for (const usuario of usuarios) {
      const created = await this.crear(usuario);
      results.push(created);
    }
    return results;
  }

  async buscarPorCorreo(correo: Email): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({
      where: { correo: correo.toString() },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async buscarPorId(id: number): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({
      where: { id_usuario: id },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async buscarPorFolio(folio: FolioRecibo): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({
      where: { folio_recibo: folio.toString() },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async verificar(id: number): Promise<void> {
    await this.prisma.usuarios.update({
      where: { id_usuario: id },
      data: { verificado: true },
    });
  }
}
