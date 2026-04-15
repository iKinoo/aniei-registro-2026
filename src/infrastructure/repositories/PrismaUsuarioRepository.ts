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

  async actualizarFolio(id: number, folio: FolioRecibo): Promise<void> {
    await this.prisma.usuarios.update({
      where: { id_usuario: id },
      data: { folio_recibo: folio.toString() },
    });
  }

  async verificar(id: number): Promise<void> {
    await this.prisma.usuarios.update({
      where: { id_usuario: id },
      data: { verificado: true },
    });
  }

  async crearGrupoTransaccional(data: {
    token: string;
    responsableId: number;
    institucionId: number;
    dependenciaId: string; // Es string 128
    estadoId: number;      // id_entidad_federativa
    tipoUsuarioAlumnoId: number;
    cargoAlumnoId: number;
    miembros: Array<{
      nombre: string;
      apellido: string;
      correoDummy: string;
      passwordHash: string;
    }>;
  }): Promise<{ usuariosIds: number[], folios: string[] }> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el grupo
      const grupo = await tx.grupos_registro.create({
        data: {
          token: data.token,
          id_responsable: data.responsableId,
        },
      });

      const usuariosIds: number[] = [];
      const folios: string[] = [];

      // 2. Insertar cada miembro
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
            id_tipo_usuario: data.tipoUsuarioAlumnoId,
            id_cargo: data.cargoAlumnoId,
            id_grupo_registro: grupo.id,
            id_institucion: data.institucionId,
            dependencia: data.dependenciaId,
            id_entidad_federativa: data.estadoId,
          },
        });

        // Relacionar acceso con usuario
        await tx.accesos.update({
          where: { id_acceso: newAcceso.id_acceso },
          data: { id_usuario: newUsuario.id_usuario },
        });

        // Generar y asignar folio (el caso de uso lo asume así)
        const folio = `ANIEI-GRP-${String(newUsuario.id_usuario).padStart(4, '0')}`;
        await tx.usuarios.update({
          where: { id_usuario: newUsuario.id_usuario },
          data: { folio_recibo: folio }
        });

        usuariosIds.push(newUsuario.id_usuario);
        folios.push(folio);
      }

      return { usuariosIds, folios };
    });
  }
}
