import { ITipoParticipanteRepository, CrearTipoParticipanteDTO, ActualizarTipoParticipanteDTO } from '@/application/ports/ITipoParticipanteRepository';
import { TipoParticipante } from '@/shared/types/catalogos';

export class GestionarTiposParticipante {
  constructor(private readonly repo: ITipoParticipanteRepository) {}

  async obtenerTodos(): Promise<TipoParticipante[]> {
    return this.repo.obtenerTodos();
  }

  async obtenerPorId(id: number): Promise<TipoParticipante | null> {
    return this.repo.obtenerPorId(id);
  }

  async crear(data: CrearTipoParticipanteDTO): Promise<TipoParticipante> {
    if (!data.descripcion.trim()) {
      throw new Error('La descripción es requerida.');
    }
    return this.repo.crear(data);
  }

  async actualizar(id: number, data: ActualizarTipoParticipanteDTO): Promise<TipoParticipante> {
    if (data.descripcion !== undefined && !data.descripcion.trim()) {
      throw new Error('La descripción es requerida.');
    }
    return this.repo.actualizar(id, data);
  }

  async eliminar(id: number): Promise<void> {
    await this.repo.eliminar(id);
  }
}
