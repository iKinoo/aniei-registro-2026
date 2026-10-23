import { PrismaClient, Prisma } from '@/generated/prisma/client';
import { IAdminQueryService } from '@/application/ports/IAdminQueryService';
import { UsuarioForAdminDTO } from '@/application/dtos/UsuarioForAdminDTO';
import { PaginatedResult } from '@/application/dtos/PaginatedResult';

const USUARIO_INCLUDE = {
  instituciones: true,
  titulos: true,
  depositos: {
    where: { proposito: 'EVENTO_PRINCIPAL' },
    orderBy: { fecha_registro: 'desc' },
    take: 1, // Get only the most recent deposit
  },
} satisfies Prisma.usuariosInclude;

type UsuarioConRelaciones = Prisma.usuariosGetPayload<{ include: typeof USUARIO_INCLUDE }>;

export class PrismaAdminQueryService implements IAdminQueryService {
  constructor(private readonly prisma: PrismaClient) { }

  async obtenerUsuariosForAdmin(
    page: number,
    limit: number,
    search?: string,
    idInstitucion?: number
  ): Promise<PaginatedResult<UsuarioForAdminDTO>> {
    const skip = (page - 1) * limit;

    const conditions: Prisma.usuariosWhereInput[] = [];

    if (search) {
      conditions.push({
        OR: [
          { nombre: { contains: search } },
          { apellido: { contains: search } },
          { correo: { contains: search } },
        ],
      });
    }

    if (idInstitucion != null) {
      conditions.push({ id_institucion: idInstitucion });
    }

    const whereClause: Prisma.usuariosWhereInput = conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : { AND: conditions }
      : {};

    const [total, usuarios] = await Promise.all([
      this.prisma.usuarios.count({ where: whereClause }),
      this.prisma.usuarios.findMany({
        where: whereClause,
        include: USUARIO_INCLUDE,
        orderBy: { fecha_registro: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data: usuarios.map((user) => this.mapearUsuario(user)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async listarTodosUsuariosForAdmin(): Promise<UsuarioForAdminDTO[]> {
    const usuarios = await this.prisma.usuarios.findMany({
      include: USUARIO_INCLUDE,
      orderBy: { fecha_registro: 'desc' },
    });

    return usuarios.map((user) => this.mapearUsuario(user));
  }

  private mapearUsuario(user: UsuarioConRelaciones): UsuarioForAdminDTO {
    const dep = user.depositos.length > 0 ? user.depositos[0] : null;

    return {
      folioRegistro: user.folio_registro,
      nombreCompleto: `${user.nombre} ${user.apellido}`,
      correo: user.correo,
      telefono: user.telefono || null,
      institucion: user.instituciones?.nombre || 'Desconocida',
      tipoUsuario: user.titulos?.descripcion || 'Desconocido',
      fechaRegistro: user.fecha_registro || new Date(),
      deposito: dep
        ? {
          monto: Number(dep.monto), // Decimal is returned as Decimal type from Prisma usually, map to Number
          fecha: dep.fecha_deposito,
          referencia: dep.referencia,
          archivo: {
            ruta: dep.archivo_url,
          },
        }
        : null,
    };
  }
}
