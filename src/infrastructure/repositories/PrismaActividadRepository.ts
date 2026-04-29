import { PrismaClient } from '@/generated/prisma/client';
import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { ActividadDTO, CrearActividadDTO, ActualizarActividadDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad } from '@/shared/types/catalogos';

const include = {
  tipo_actividad: true,
  instituciones: true,
  actividad_costo: true,
  _count: { select: { inscripcion_actividades: true } },
  actividad_ponentes: {
    include: { usuarios: { select: { folio_registro: true, nombre: true, apellido: true, correo: true } } },
    orderBy: { rol: 'asc' as const },
  },
} as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapToDTO(row: any): ActividadDTO {
  return {
    idActividad: row.id_actividad,
    nombre: row.nombre,
    cupoMaximo: row.cupo_maximo ?? 0,
    fechaInicio: row.fecha_inicio.toISOString(),
    fechaFin: row.fecha_fin.toISOString(),
    idTipoActividad: row.id_tipo_actividad ?? null,
    idInstitucionSede: row.id_institucion_sede ?? null,
    idSala: row.id_sala ?? null,
    tipoActividad: row.tipo_actividad
      ? {
          idTipoActividad: row.tipo_actividad.id_tipo_actividad,
          descripcion: row.tipo_actividad.descripcion,
          clave: row.tipo_actividad.clave ?? null,
          manejaEquipos: row.tipo_actividad.maneja_equipos ?? false,
          generaConstanciaParticipante: row.tipo_actividad.genera_constancia_participante ?? false,
        }
      : null,
    institucionSede: row.instituciones
      ? {
          idInstitucion: row.instituciones.id_institucion,
          nombre: row.instituciones.nombre,
          abreviatura: row.instituciones.abreviatura ?? null,
        }
      : null,
    costo: row.actividad_costo
      ? {
          folioRegistro: row.actividad_costo.folio_registro ?? null,
          monto: row.actividad_costo.monto ? Number(row.actividad_costo.monto) : null,
        }
      : null,
    cupoOcupado: row._count?.inscripcion_actividades ?? 0,
    ponentes: (row.actividad_ponentes ?? []).map((p: { folio_registro_ponente: number; rol: string | null; usuarios: { folio_registro: string; nombre: string; apellido: string; correo: string } }) => ({
      folioRegistro: p.folio_registro_ponente,
      nombre: p.usuarios.nombre,
      apellido: p.usuarios.apellido,
      correo: p.usuarios.correo,
      rol: p.rol ?? null,
    })),
  };
}

export class PrismaActividadRepository implements IActividadRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async listar(): Promise<ActividadDTO[]> {
    const rows = await this.prisma.actividades.findMany({
      include,
      orderBy: { fecha_inicio: 'asc' },
    });
    return rows.map(mapToDTO);
  }

  async obtenerPorId(id: number): Promise<ActividadDTO | null> {
    const row = await this.prisma.actividades.findUnique({
      where: { id_actividad: id },
      include,
    });
    return row ? mapToDTO(row) : null;
  }

  async crear(data: CrearActividadDTO): Promise<ActividadDTO> {
    // Build nested costo only when monto is defined (required by schema)
    const costoCreate =
      data.costo?.monto != null
        ? {
            actividad_costo: {
              create: {
                folio_registro: data.costo.folioRegistro ?? null,
                monto: data.costo.monto,
              },
            },
          }
        : {};

    const tipoConnect =
      data.idTipoActividad != null
        ? { tipo_actividad: { connect: { id_tipo_actividad: data.idTipoActividad } } }
        : {};

    const institucionConnect =
      data.idInstitucionSede != null
        ? { instituciones: { connect: { id_institucion: data.idInstitucionSede } } }
        : {};

    const row = await this.prisma.actividades.create({
      data: {
        nombre: data.nombre,
        cupo_maximo: data.cupoMaximo ?? 0,
        fecha_inicio: new Date(data.fechaInicio),
        fecha_fin: new Date(data.fechaFin),
        id_sala: data.idSala ?? null,
        ...tipoConnect,
        ...institucionConnect,
        ...costoCreate,
      },
      include,
    });
    return mapToDTO(row);
  }

  async actualizar(id: number, data: ActualizarActividadDTO): Promise<ActividadDTO> {
    const tipoUpdate =
      data.idTipoActividad !== undefined
        ? {
            tipo_actividad:
              data.idTipoActividad != null
                ? { connect: { id_tipo_actividad: data.idTipoActividad } }
                : { disconnect: true },
          }
        : {};

    const institucionUpdate =
      data.idInstitucionSede !== undefined
        ? {
            instituciones:
              data.idInstitucionSede != null
                ? { connect: { id_institucion: data.idInstitucionSede } }
                : { disconnect: true },
          }
        : {};

    // Only upsert costo when monto is present
    const costoUpdate =
      data.costo?.monto != null
        ? {
            actividad_costo: {
              upsert: {
                create: {
                  folio_registro: data.costo.folioRegistro ?? null,
                  monto: data.costo.monto,
                },
                update: {
                  folio_registro: data.costo.folioRegistro ?? null,
                  monto: data.costo.monto,
                },
              },
            },
          }
        : {};

    const row = await this.prisma.actividades.update({
      where: { id_actividad: id },
      data: {
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.cupoMaximo !== undefined && { cupo_maximo: data.cupoMaximo }),
        ...(data.fechaInicio !== undefined && { fecha_inicio: new Date(data.fechaInicio) }),
        ...(data.fechaFin !== undefined && { fecha_fin: new Date(data.fechaFin) }),
        ...(data.idSala !== undefined && { id_sala: data.idSala }),
        ...tipoUpdate,
        ...institucionUpdate,
        ...costoUpdate,
      },
      include,
    });
    return mapToDTO(row);
  }

  async obtenerTiposActividad(): Promise<TipoActividad[]> {
    const rows = await this.prisma.tipo_actividad.findMany({ orderBy: { descripcion: 'asc' } });
    return rows.map((r) => ({
      idTipoActividad: r.id_tipo_actividad,
      clave: r.clave ?? null,
      descripcion: r.descripcion,
      manejaEquipos: r.maneja_equipos ?? false,
      generaConstanciaParticipante: r.genera_constancia_participante ?? false,
    }));
  }
}
