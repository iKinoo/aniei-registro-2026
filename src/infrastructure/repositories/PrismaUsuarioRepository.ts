import { PrismaClient } from '@/generated/prisma/client';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';
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
    institucionId: number;
    dependenciaId: string; // Es string 128
    estadoId: number;      // id_entidad_federativa
    miembros: Array<{
      nombre: string;
      apellido: string;
      correoDummy: string;
      passwordHash: string;
    }>;
  }): Promise<{ usuariosIds: string[], folios: string[] }> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el grupo
      const grupo = await tx.grupos_registro.create({
        data: {
          token: data.token,
          responsable: { connect: { folio_registro: data.responsableId } },
        },
      });

      const usuariosIds: string[] = [];
      const folios: string[] = [];

      // 2. Insertar cada miembro (sin id_titulo, lo completarán individualmente)
      for (let i = 0; i < data.miembros.length; i++) {
        const m = data.miembros[i];

        const newAcceso = await tx.accesos.create({
          data: {
            email: m.correoDummy,
            nombre: `${m.nombre} ${m.apellido}`,
            password: m.passwordHash,
            rol: 'USER',
          },
        });

        const newUsuario = await tx.usuarios.create({
          data: {
            nombre: m.nombre,
            apellido: m.apellido,
            correo: m.correoDummy,
            id_grupo_registro: grupo.id,
            id_institucion: data.institucionId,
            dependencia: data.dependenciaId,
            id_entidad_federativa: data.estadoId,
          },
        });

        // Relacionar acceso con usuario
        await tx.accesos.update({
          where: { id_acceso: newAcceso.id_acceso },
          data: { folio_registro: newUsuario.folio_registro },
        });

        usuariosIds.push(newUsuario.folio_registro);
        folios.push(newUsuario.folio_registro);
      }

      return { usuariosIds, folios };
    });
  }
}
