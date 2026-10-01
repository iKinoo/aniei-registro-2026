import type { Prisma } from '@/generated/prisma/client';
import type { IGrupoRepository } from '@/application/ports/IGrupoRepository';
import { UsuarioMapper } from '@/infrastructure/mappers/UsuarioMapper';

export class PrismaGrupoRepository implements IGrupoRepository {
  constructor(private readonly prisma: Prisma.TransactionClient) {}

  async bloquearMiembro(token: string, folio: string) {
    const rows = await this.prisma.$queryRaw<Array<{ folio_registro: string }>>`
      SELECT u.folio_registro FROM usuarios u
      JOIN grupos_registro g ON g.id = u.id_grupo_registro
      WHERE g.token = ${token} AND u.folio_registro = ${folio} FOR UPDATE
    `;
    if (!rows.length) return null;
    const usuario = await this.prisma.usuarios.findUnique({ where: { folio_registro: folio } });
    return usuario ? UsuarioMapper.toDomain(usuario) : null;
  }
}
