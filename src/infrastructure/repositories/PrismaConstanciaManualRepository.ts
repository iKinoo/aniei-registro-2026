import { PrismaClient } from '@/generated/prisma/client';
import { IConstanciaManualRepository, ConstanciaManualEntity } from '@/application/ports/IConstanciaManualRepository';
import { TipoConstanciaManual } from '@/application/dtos/ConstanciaManualDTO';

export class PrismaConstanciaManualRepository implements IConstanciaManualRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async guardar(data: Omit<ConstanciaManualEntity, 'idConstancia' | 'fechaGeneracion'>): Promise<ConstanciaManualEntity> {
    const record = await this.prisma.constancias_manuales.create({
      data: {
        tipo_constancia: data.tipoConstancia,
        destinatarios: JSON.stringify(data.destinatarios),
        descripcion: data.descripcion,
        url_pdf: data.urlPdf,
      },
    });

    return {
      idConstancia: record.id_constancia,
      tipoConstancia: record.tipo_constancia as TipoConstanciaManual,
      destinatarios: JSON.parse(record.destinatarios),
      descripcion: record.descripcion,
      urlPdf: record.url_pdf,
      fechaGeneracion: record.fecha_generacion,
    };
  }

  async obtenerTodas(): Promise<ConstanciaManualEntity[]> {
    const records = await this.prisma.constancias_manuales.findMany({
      orderBy: { fecha_generacion: 'desc' },
    });

    return records.map((r) => ({
      idConstancia: r.id_constancia,
      tipoConstancia: r.tipo_constancia as TipoConstanciaManual,
      destinatarios: JSON.parse(r.destinatarios),
      descripcion: r.descripcion,
      urlPdf: r.url_pdf,
      fechaGeneracion: r.fecha_generacion,
    }));
  }

  async obtenerPorId(id: number): Promise<ConstanciaManualEntity | null> {
    const record = await this.prisma.constancias_manuales.findUnique({
      where: { id_constancia: id },
    });

    if (!record) return null;

    return {
      idConstancia: record.id_constancia,
      tipoConstancia: record.tipo_constancia as TipoConstanciaManual,
      destinatarios: JSON.parse(record.destinatarios),
      descripcion: record.descripcion,
      urlPdf: record.url_pdf,
      fechaGeneracion: record.fecha_generacion,
    };
  }
}
