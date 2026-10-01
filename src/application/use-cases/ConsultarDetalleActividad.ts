import type { IActividadRepository } from '../ports/IActividadRepository';
import type { IPonentesRepository } from '../ports/IPonentesRepository';
import type { IInscripcionActividadRepository } from '../ports/IInscripcionActividadRepository';
import type { ICatalogoRepository } from '../ports/ICatalogoRepository';
import type { IPdfService } from '../ports/IPdfService';

export class ConsultarDetalleActividad {
  constructor(private readonly actividades: IActividadRepository, private readonly ponentes: IPonentesRepository,
    private readonly inscripciones: IInscripcionActividadRepository, private readonly catalogos: ICatalogoRepository,
    private readonly pdf: IPdfService) {}

  async obtener(id: number) {
    const actividad = await this.actividades.obtenerPorId(id);
    if (!actividad) throw new Error('Actividad no encontrada');
    const [tipos, ponentes, inscritos, instituciones] = await Promise.all([
      this.actividades.obtenerTiposActividad(), this.ponentes.obtenerPorActividad(id),
      this.inscripciones.obtenerPorActividad(id), this.catalogos.obtenerInstituciones(),
    ]);
    return { actividad, nombreTipo: tipos.find(t => t.idTipoActividad === actividad.idTipoActividad)?.descripcion ?? 'Actividad',
      ponentes, inscritos, tiposActividad: tipos, instituciones };
  }

  async generarLista(id: number) {
    const { actividad, nombreTipo, inscritos } = await this.obtener(id);
    const buffer = await this.pdf.generarListaParticipantes({ nombreActividad: actividad.nombre, tipoActividad: nombreTipo,
      fecha: new Date(actividad.fechaInicio).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
      participantes: inscritos.map((i, index) => ({ numero: index + 1, nombre: `${i.nombre} ${i.apellido}`, correo: i.correo,
        fechaInscripcion: i.fechaInscripcion ? new Date(i.fechaInscripcion).toLocaleDateString('es-MX') : '-' })),
    });
    return { buffer, nombreArchivo: `lista_participantes_${actividad.nombre.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.pdf` };
  }
}
