import { PrismaClient } from '@/generated/prisma/client';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';

export class PrismaCatalogoRepository implements ICatalogoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerCargos(): Promise<Cargo[]> {
    const rows = await this.prisma.cargos.findMany({ orderBy: { descripcion: 'asc' } });
    return rows.map((r) => ({ idCargo: r.id_cargo, descripcion: r.descripcion }));
  }

  async obtenerEstados(): Promise<Estado[]> {
    const rows = await this.prisma.estados.findMany({ orderBy: { nombre: 'asc' } });
    return rows.map((r) => ({ idEntidadFederativa: r.id_entidad_federativa, nombre: r.nombre }));
  }

  async obtenerInstituciones(): Promise<Institucion[]> {
    const rows = await this.prisma.instituciones.findMany({ orderBy: { nombre: 'asc' } });
    return rows.map((r) => ({
      idInstitucion: r.id_institucion,
      nombre: r.nombre,
      abreviatura: r.abreviatura,
    }));
  }

  async obtenerTiposUsuario(): Promise<TipoUsuario[]> {
    const rows = await this.prisma.tipo_usuario.findMany({ orderBy: { descripcion: 'asc' } });
    return rows.map((r) => ({ idTipoUsuario: r.id_tipo_usuario, descripcion: r.descripcion }));
  }
}
