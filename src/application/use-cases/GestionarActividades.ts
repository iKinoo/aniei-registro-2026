import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { ActividadDTO, CrearActividadDTO, ActualizarActividadDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad } from '@/application/dtos/CatalogosDTO';

export class GestionarActividades {
  constructor(private readonly actividadRepo: IActividadRepository) {}

  async listar(): Promise<ActividadDTO[]> {
    return this.actividadRepo.listar();
  }

  async listarConEquipos(): Promise<ActividadDTO[]> {
    return (await this.actividadRepo.listar()).filter(a => a.tipoActividad?.manejaEquipos);
  }

  async obtenerPorIds(ids: number[]): Promise<ActividadDTO[]> {
    const rows = await Promise.all([...new Set(ids)].map(id => this.actividadRepo.obtenerPorId(id)));
    return rows.filter(a => a !== null);
  }

  async listarPorCategoria(categoria: string): Promise<ActividadDTO[]> {
    const todas = await this.actividadRepo.listar();
    if (categoria !== 'disponibles') return todas.filter(a => a.tipoActividad?.clave?.toLowerCase() === categoria);
    return todas.filter(a => {
      const clave = a.tipoActividad?.clave?.toLowerCase() ?? '';
      const descripcion = a.tipoActividad?.descripcion.toLowerCase() ?? '';
      return ![clave, descripcion].some(texto => texto.includes('hackaton') || texto.includes('concurso'));
    });
  }

  async obtenerPorId(id: number): Promise<ActividadDTO | null> {
    return this.actividadRepo.obtenerPorId(id);
  }

  async crear(data: CrearActividadDTO): Promise<ActividadDTO> {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre de la actividad es requerido.');
    }
    if (!data.fechaInicio || !data.fechaFin) {
      throw new Error('La fecha de inicio y fecha de fin son requeridas.');
    }
    if (new Date(data.fechaFin) < new Date(data.fechaInicio)) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
    }
    return this.actividadRepo.crear(data);
  }

  async actualizar(id: number, data: ActualizarActividadDTO): Promise<ActividadDTO> {
    if (data.fechaInicio && data.fechaFin && new Date(data.fechaFin) < new Date(data.fechaInicio)) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
    }
    return this.actividadRepo.actualizar(id, data);
  }

  async obtenerTiposActividad(): Promise<TipoActividad[]> {
    return this.actividadRepo.obtenerTiposActividad();
  }
}
