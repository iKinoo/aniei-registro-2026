import type { PrismaClient } from '@/generated/prisma/client';
import type { IRegistroQueryService } from '@/application/ports/IRegistroQueryService';
import type { DetalleUsuarioDTO, PerfilDTO, InstitucionReporteItem } from '@/application/dtos/ConsultaRegistroDTO';
import { mapUsuarioConsulta, mapDepositoHistorial } from '@/infrastructure/mappers/ConsultaRegistroMapper';

export class PrismaRegistroQueryService implements IRegistroQueryService {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerUsuario(folio: string) {
    const u = await this.prisma.usuarios.findUnique({ where: { folio_registro: folio } });
    return u ? mapUsuarioConsulta(u) : null;
  }

  async obtenerDetalle(folio: string): Promise<DetalleUsuarioDTO | null> {
    const u = await this.prisma.usuarios.findUnique({
      where: { folio_registro: folio }, include: { instituciones: true, titulos: true, estados: true },
    });
    if (!u) return null;
    const [depositos, f, inscripciones] = await Promise.all([
      this.prisma.depositos.findMany({ where: { folio_registro: folio }, orderBy: { fecha_registro: 'desc' } }),
      this.prisma.facturaciones.findFirst({ where: { folio_registro: folio } }),
      this.prisma.inscripcion_actividades.findMany({
        where: { folio_registro: folio },
        include: { actividades: { include: { tipo_actividad: true, instituciones: true } } },
        orderBy: { fecha_inscripcion: 'desc' },
      }),
    ]);
    return {
      usuario: {
        ...mapUsuarioConsulta(u),
        institucion: u.instituciones ? { idInstitucion: u.instituciones.id_institucion, nombre: u.instituciones.nombre, abreviatura: u.instituciones.abreviatura } : null,
        titulo: u.titulos ? { idTitulo: u.titulos.id_titulo, descripcion: u.titulos.descripcion } : null,
        estado: u.estados ? { idEntidadFederativa: u.estados.id_entidad_federativa, nombre: u.estados.nombre } : null,
      },
      depositos: depositos.map(mapDepositoHistorial),
      facturacion: f ? {
        razonSocial: f.razon_social, rfc: f.rfc, calle: f.calle, numExterior: f.num_exterior,
        numInterior: f.num_interior, colonia: f.colonia, municipio: f.municipio, codigoPostal: f.codigo_postal,
        constanciaUrl: f.constancia_url, constanciaNombre: f.constancia_nombre,
      } : null,
      inscripciones: inscripciones.map(i => ({
        idInscripcion: i.id_inscripcion, idActividad: i.id_actividad, fechaInscripcion: i.fecha_inscripcion ?? u.fecha_registro ?? new Date(),
        urlConstancia: i.url_constancia,
        actividad: i.actividades ? {
          nombre: i.actividades.nombre, costo: Number(i.actividades.costo ?? 0), fechaInicio: i.actividades.fecha_inicio,
          idSala: i.actividades.id_sala,
          tipoActividad: i.actividades.tipo_actividad ? { descripcion: i.actividades.tipo_actividad.descripcion } : null,
          institucion: i.actividades.instituciones ? {
            idInstitucion: i.actividades.instituciones.id_institucion, nombre: i.actividades.instituciones.nombre,
            abreviatura: i.actividades.instituciones.abreviatura,
          } : null,
        } : null,
      })),
    };
  }

  async obtenerPerfil(folio: string): Promise<PerfilDTO | null> {
    const acceso = await this.prisma.accesos.findFirst({ where: { folio_registro: folio } });
    if (!acceso) return null;
    const detalle = await this.obtenerDetalle(folio);
    if (!detalle) return null;
    const equipos = await this.prisma.equipo_integrantes.findMany({
      where: { folio_registro: folio }, include: { equipos: { include: { actividades: true } } },
    });
    return { ...detalle, equipos: equipos.map(e => ({
      esRepresentante: e.es_representante,
      equipo: { idEquipo: e.equipos.id_equipo, numeroEquipo: e.equipos.numero_equipo,
        nombreEquipo: e.equipos.nombre_equipo, actividad: { nombre: e.equipos.actividades.nombre } },
    })) };
  }

  async buscarUsuarios(query: string) {
    const q = query.trim();
    if (q.length < 2) return [];
    const rows = await this.prisma.usuarios.findMany({
      where: { OR: [{ nombre: { contains: q } }, { apellido: { contains: q } }, { correo: { contains: q } }] },
      select: { folio_registro: true, nombre: true, apellido: true, correo: true },
      take: 10, orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });
    return rows.map(r => ({ folioRegistro: r.folio_registro, nombre: r.nombre, apellido: r.apellido, correo: r.correo }));
  }

  async obtenerReporteInstituciones(): Promise<InstitucionReporteItem[]> {
    const resultados = await this.prisma.usuarios.groupBy({
      by: ['id_institucion'], _count: { folio_registro: true }, orderBy: { _count: { folio_registro: 'desc' } },
    });
    const instituciones = await this.prisma.instituciones.findMany({
      where: { id_institucion: { in: resultados.flatMap(r => r.id_institucion ? [r.id_institucion] : []) } },
    });
    const mapa = new Map(instituciones.map(i => [i.id_institucion, i]));
    return resultados.flatMap(r => {
      if (!r.id_institucion) return [];
      const inst = mapa.get(r.id_institucion);
      return [{ idInstitucion: r.id_institucion, nombre: inst?.nombre ?? 'Desconocida',
        abreviatura: inst?.abreviatura ?? null, totalParticipantes: r._count.folio_registro }];
    });
  }
}
