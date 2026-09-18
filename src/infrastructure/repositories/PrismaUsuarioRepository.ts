import { PrismaClient } from '@/generated/prisma/client';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IFolioGenerator } from '@/application/ports/IFolioGenerator';
import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';
import { UsuarioMapper } from '../mappers/UsuarioMapper';

export class PrismaUsuarioRepository implements IUsuarioRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly folioGenerator: IFolioGenerator,
  ) {}

  async crear(usuario: Usuario): Promise<Usuario> {
    const folio = usuario.folioRegistro ?? (await this.folioGenerator.siguiente());
    const data = { ...UsuarioMapper.toPersistence(usuario), folio_registro: folio };
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
    const found = await this.prisma.usuarios.findFirst({
      where: { correo: correo.toString() },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const found = await this.prisma.usuarios.findUnique({
      where: { folio_registro: id },
    });
    return found ? UsuarioMapper.toDomain(found) : null;
  }

  async verificar(id: string): Promise<void> {
    await this.prisma.usuarios.update({
      where: { folio_registro: id },
      data: { verificado: true },
    });
  }

  async buscarPorFolio(folio: FolioRegistro): Promise<Usuario | null> {
    const model = await this.prisma.usuarios.findUnique({
      where: { folio_registro: folio.toString() },
      include: {
        accesos: true,
      },
    });
    if (!model) return null;
    return UsuarioMapper.toDomain(model);
  }

  async crearGrupoTransaccional(data: {
    token: string;
    responsableId: string;
    institucionId: number | null;
    dependenciaId: string;
    estadoId: number;
    miembros: Array<{
      nombre: string;
      apellido: string;
      correo: string;
      passwordHash: string;
      idTipoParticipante: number;
    }>;
  }): Promise<{ usuariosIds: string[], folios: string[] }> {
    return this.prisma.$transaction(async (tx) => {
      const grupo = await tx.grupos_registro.create({
        data: {
          token: data.token,
          responsable: { connect: { folio_registro: data.responsableId } },
        },
      });

      const usuariosIds: string[] = [];
      const folios: string[] = [];

      for (const m of data.miembros) {
        const { id } = await tx.folios_contador.create({ data: {} });
        const folio = `ANI26-${String(id).padStart(4, '0')}`;
        const newUsuario = await tx.usuarios.create({
          data: {
            folio_registro: folio,
            nombre: m.nombre,
            apellido: m.apellido,
            correo: m.correo,
            id_grupo_registro: grupo.id,
            id_institucion: data.institucionId,
            dependencia: data.dependenciaId,
            id_entidad_federativa: data.estadoId,
            id_tipo_participante: m.idTipoParticipante,
            verificado: true,
          },
        });

        await tx.accesos.create({
          data: {
            email: m.correo,
            nombre: `${m.nombre} ${m.apellido}`,
            password: m.passwordHash,
            rol: 'USER',
            folio_registro: newUsuario.folio_registro,
          },
        });

        usuariosIds.push(newUsuario.folio_registro);
        folios.push(newUsuario.folio_registro);
      }

      return { usuariosIds, folios };
    });
  }
}
