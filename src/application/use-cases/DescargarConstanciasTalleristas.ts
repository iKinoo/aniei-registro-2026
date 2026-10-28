import type { IActividadRepository } from '../ports/IActividadRepository';
import type { IPdfService } from '../ports/IPdfService';
import type { ArchivoZip, IZipService } from '../ports/IZipService';
import type { ConstanciasTalleristasZipDTO } from '../dtos/ConstanciasTalleristasZipDTO';
import { contenidoPorTipoActividad } from '../services/RedactorConstancia';

function limpiarNombre(valor: string, maximo = 60): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, maximo);
}

function nombreCarpeta(indice: number, nombreActividad: string): string {
  return `${String(indice).padStart(2, '0')}_${limpiarNombre(nombreActividad) || 'taller'}`;
}

function nombreConstancia(nombre: string, apellido: string, folioRegistro: string): string {
  const nombreCompleto = limpiarNombre(`${nombre}_${apellido}`) || 'tallerista';
  const folioSeguro = limpiarNombre(folioRegistro, 20) || 'sin_folio';
  return `${nombreCompleto}_${folioSeguro}.pdf`;
}

export class DescargarConstanciasTalleristas {
  constructor(
    private readonly actividades: IActividadRepository,
    private readonly pdf: IPdfService,
    private readonly zip: IZipService,
  ) {}

  async ejecutar(): Promise<ConstanciasTalleristasZipDTO | null> {
    const talleres = (await this.actividades.listar()).filter(
      (actividad) =>
        actividad.activo &&
        actividad.tipoActividad?.clave?.toUpperCase() === 'TALLER' &&
        actividad.ponentes.length > 0,
    );

    if (talleres.length === 0) return null;

    const archivos: ArchivoZip[] = [];
    for (const [indice, taller] of talleres.entries()) {
      const carpeta = nombreCarpeta(indice + 1, taller.nombre);
      for (const ponente of taller.ponentes) {
        const contenido = await this.pdf.generarConstancia(
          contenidoPorTipoActividad({
            destinatario: `${ponente.nombre} ${ponente.apellido}`.trim(),
            claveTipo: taller.tipoActividad?.clave ?? 'TALLER',
            descripcionTipo: taller.tipoActividad?.descripcion ?? 'Taller',
            nombreActividad: taller.nombre,
            esPonente: true,
          }),
        );

        archivos.push({
          nombre: `${carpeta}/${nombreConstancia(ponente.nombre, ponente.apellido, ponente.folioRegistro)}`,
          contenido,
        });
      }
    }

    return {
      nombreArchivo: 'constancias_talleristas_ANIEI_2026.zip',
      contenido: await this.zip.comprimir(archivos),
      totalTalleres: talleres.length,
      totalConstancias: archivos.length,
    };
  }
}
