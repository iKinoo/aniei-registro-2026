import type { IActividadRepository } from '../ports/IActividadRepository';
import type { IInscripcionActividadRepository } from '../ports/IInscripcionActividadRepository';
import type { IPdfService } from '../ports/IPdfService';
import type { ArchivoZip, IZipService } from '../ports/IZipService';
import type { ListasAsistenciaZipDTO } from '../dtos/ListasAsistenciaZipDTO';

function nombreArchivoLista(indice: number, nombreActividad: string): string {
  const nombre = nombreActividad
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);

  return `lista_asistencia_${String(indice + 1).padStart(2, '0')}_${nombre || 'actividad'}.pdf`;
}

export class DescargarListasAsistencia {
  constructor(
    private readonly actividades: IActividadRepository,
    private readonly inscripciones: IInscripcionActividadRepository,
    private readonly pdf: IPdfService,
    private readonly zip: IZipService,
  ) {}

  async ejecutar(): Promise<ListasAsistenciaZipDTO | null> {
    const actividades = await this.actividades.listar();
    if (actividades.length === 0) return null;

    const archivos: ArchivoZip[] = [];
    let totalParticipantes = 0;

    for (const [indice, actividad] of actividades.entries()) {
      const inscritos = await this.inscripciones.obtenerPorActividad(actividad.idActividad);
      totalParticipantes += inscritos.length;

      const contenido = await this.pdf.generarListaParticipantes({
        nombreActividad: actividad.nombre,
        tipoActividad: actividad.tipoActividad?.descripcion ?? 'Actividad',
        fecha: new Date(actividad.fechaInicio).toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        participantes: inscritos.map((inscrito, posicion) => ({
          numero: posicion + 1,
          folio: inscrito.folioRegistro,
          nombre: `${inscrito.nombre} ${inscrito.apellido}`.trim(),
        })),
      });

      archivos.push({
        nombre: nombreArchivoLista(indice, actividad.nombre),
        contenido,
      });
    }

    const contenido = await this.zip.comprimir(archivos);

    return {
      nombreArchivo: 'listas_asistencia_ANIEI_2026.zip',
      contenido,
      totalActividades: actividades.length,
      totalParticipantes,
    };
  }
}
