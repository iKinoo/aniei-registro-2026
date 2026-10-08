import { PrismaClient } from '@/generated/prisma/client';
import { IConstanciaManualRepository, ConstanciaManualEntity } from '@/application/ports/IConstanciaManualRepository';
import { ConstanciaManualArchivo, TipoConstanciaManual } from '@/application/dtos/ConstanciaManualDTO';

function parsearArchivos(valor: string): ConstanciaManualArchivo[] {
  if (valor.trim().startsWith('[')) {
    try {
      const listado = JSON.parse(valor) as ConstanciaManualArchivo[];
      if (Array.isArray(listado)) return listado;
    } catch { /* valor heredado: se trata como ruta única */ }
  }
  return [{ destinatario: null, ruta: valor }];
}

export class PrismaConstanciaManualRepository implements IConstanciaManualRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapear(record: {
    id_constancia: number;
    tipo_constancia: string;
    destinatarios: string;
    descripcion: string;
    url_pdf: string;
    fecha_generacion: Date;
  }): ConstanciaManualEntity {
    return {
      idConstancia: record.id_constancia,
      tipoConstancia: record.tipo_constancia as TipoConstanciaManual,
      destinatarios: JSON.parse(record.destinatarios),
      descripcion: record.descripcion,
      archivos: parsearArchivos(record.url_pdf),
      fechaGeneracion: record.fecha_generacion,
    };
  }

  async guardar(data: Omit<ConstanciaManualEntity, 'idConstancia' | 'fechaGeneracion'>): Promise<ConstanciaManualEntity> {
    const record = await this.prisma.constancias_manuales.create({
      data: {
        tipo_constancia: data.tipoConstancia,
        destinatarios: JSON.stringify(data.destinatarios),
        descripcion: data.descripcion,
        url_pdf: JSON.stringify(data.archivos),
      },
    });

    return this.mapear(record);
  }

  async obtenerTodas(): Promise<ConstanciaManualEntity[]> {
    const records = await this.prisma.constancias_manuales.findMany({
      orderBy: { fecha_generacion: 'desc' },
    });

    return records.map((r) => this.mapear(r));
  }

  async obtenerPorId(id: number): Promise<ConstanciaManualEntity | null> {
    const record = await this.prisma.constancias_manuales.findUnique({
      where: { id_constancia: id },
    });

    if (!record) return null;

    return this.mapear(record);
  }
}
