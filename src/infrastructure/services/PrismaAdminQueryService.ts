import { PrismaClient } from '@/generated/prisma/client';
import { IAdminQueryService } from '@/application/ports/IAdminQueryService';
import { UsuarioAdminDTO } from '@/application/dtos/UsuarioAdminDTO';
import { PaginatedResult } from '@/application/dtos/PaginatedResult';

export class PrismaAdminQueryService implements IAdminQueryService {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerUsuariosAdmin(
    page: number,
    limit: number,
    search?: string
  ): Promise<PaginatedResult<UsuarioAdminDTO>> {
    const skip = (page - 1) * limit;

    const whereClause: any = search
      ? {
          OR: [
            { nombre: { contains: search, mode: 'insensitive' } },
            { apellido: { contains: search, mode: 'insensitive' } },
            { correo: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, usuarios] = await Promise.all([
      this.prisma.usuarios.count({ where: whereClause }),
      this.prisma.usuarios.findMany({
        where: whereClause,
        include: {
          instituciones: true,
          tipo_usuario: true,
          depositos: {
            orderBy: { fecha_registro: 'desc' },
            take: 1, // Get only the most recent deposit
          },
        },
        orderBy: { fecha_registro: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const data: UsuarioAdminDTO[] = usuarios.map((user) => {
      const dep = user.depositos.length > 0 ? user.depositos[0] : null;

      return {
        idUsuario: user.id_usuario,
        nombreCompleto: `${user.nombre} ${user.apellido}`,
        correo: user.correo,
        telefono: user.telefono || null,
        institucion: user.instituciones?.nombre || 'Desconocida',
        tipoUsuario: user.tipo_usuario?.descripcion || 'Desconocido',
        fechaRegistro: user.fecha_registro || new Date(),
        deposito: dep
          ? {
              monto: Number(dep.monto), // Decimal is returned as Decimal type from Prisma usually, map to Number
              fecha: dep.fecha_deposito,
              referencia: dep.referencia,
              archivoUrl: dep.archivo_url,
            }
          : null,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
