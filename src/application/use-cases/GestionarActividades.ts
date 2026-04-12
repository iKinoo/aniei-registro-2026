import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { ActividadDTO, CrearActividadDTO, ActualizarActividadDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad } from '@/shared/types/catalogos';

export class GestionarActividades {
  constructor(private readonly actividadRepo: IActividadRepository) {}

  async listar(): Promise<ActividadDTO[]> {
    return this.actividadRepo.listar();
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
