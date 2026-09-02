import { IEquipoRepository } from '@/application/ports/IEquipoRepository';
import { EquipoDTO, CrearEquipoDTO, ActualizarEquipoDTO, UsuarioBusquedaDTO } from '@/application/dtos/EquipoDTO';

export class GestionarEquipos {
  constructor(private readonly equipoRepo: IEquipoRepository) {}

  async listarPorActividad(idActividad: number): Promise<EquipoDTO[]> {
    return this.equipoRepo.listarPorActividad(idActividad);
  }

  async obtenerPorId(idEquipo: number): Promise<EquipoDTO | null> {
    return this.equipoRepo.obtenerPorId(idEquipo);
  }

  async crearEquipo(data: CrearEquipoDTO): Promise<EquipoDTO> {
    if (!data.nombreEquipo || data.nombreEquipo.trim().length === 0) {
      throw new Error('El nombre del equipo es obligatorio');
    }
    if (!data.integrantes || data.integrantes.length === 0) {
      throw new Error('El equipo debe tener al menos un integrante');
    }

    const folios = data.integrantes.map((i) => i.folioRegistro);
    const foliosUnicos = new Set(folios);
    if (foliosUnicos.size !== folios.length) {
      throw new Error('No se pueden repetir integrantes en el mismo equipo');
    }

    const representantes = data.integrantes.filter((i) => i.esRepresentante);
    if (representantes.length === 0) {
      data.integrantes[0].esRepresentante = true;
    } else if (representantes.length > 1) {
      throw new Error('Solo puede haber un representante por equipo');
    }

    const numeroEquipo = await this.equipoRepo.obtenerSiguienteNumero(data.idActividad);
    return this.equipoRepo.crear(data, numeroEquipo);
  }

  async actualizarEquipo(idEquipo: number, data: ActualizarEquipoDTO): Promise<EquipoDTO> {
    const existente = await this.equipoRepo.obtenerPorId(idEquipo);
    if (!existente) {
      throw new Error('Equipo no encontrado');
    }

    if (data.integrantes) {
      if (data.integrantes.length === 0) {
        throw new Error('El equipo debe tener al menos un integrante');
      }
      const folios = data.integrantes.map((i) => i.folioRegistro);
      const foliosUnicos = new Set(folios);
      if (foliosUnicos.size !== folios.length) {
        throw new Error('No se pueden repetir integrantes en el mismo equipo');
      }
      const representantes = data.integrantes.filter((i) => i.esRepresentante);
      if (representantes.length === 0) {
        data.integrantes[0].esRepresentante = true;
      } else if (representantes.length > 1) {
        throw new Error('Solo puede haber un representante por equipo');
      }
    }

    return this.equipoRepo.actualizar(idEquipo, data);
  }

  async eliminarEquipo(idEquipo: number): Promise<void> {
    const existente = await this.equipoRepo.obtenerPorId(idEquipo);
    if (!existente) {
      throw new Error('Equipo no encontrado');
    }
    return this.equipoRepo.eliminar(idEquipo);
  }

  async buscarUsuarios(query: string): Promise<UsuarioBusquedaDTO[]> {
    return this.equipoRepo.buscarUsuarios(query);
  }
}
