import { TipoParticipante } from '@/shared/types/catalogos';

export interface CrearTipoParticipanteDTO {
  descripcion: string;
  clave?: string;
  orden: number;
}

export interface ActualizarTipoParticipanteDTO {
  descripcion?: string;
  clave?: string;
  orden?: number;
}

export interface ITipoParticipanteRepository {
  obtenerTodos(): Promise<TipoParticipante[]>;
  obtenerPorId(id: number): Promise<TipoParticipante | null>;
  crear(data: CrearTipoParticipanteDTO): Promise<TipoParticipante>;
  actualizar(id: number, data: ActualizarTipoParticipanteDTO): Promise<TipoParticipante>;
  eliminar(id: number): Promise<void>;
}
