import { PrecioInscripcion } from '@/shared/types/catalogos';

export interface CrearPrecioDTO {
  idTipoParticipante: number;
  esAfiliada: boolean;
  fechaLimite: Date;
  costo: number;
  orden: number;
  activo: boolean;
}

export interface ActualizarPrecioDTO {
  idTipoParticipante?: number;
  esAfiliada?: boolean;
  fechaLimite?: Date;
  costo?: number;
  orden?: number;
  activo?: boolean;
}

export interface IPrecioInscripcionRepository {
  obtenerTodos(): Promise<PrecioInscripcion[]>;
  obtenerVigente(idTipoParticipante: number, esAfiliada: boolean): Promise<PrecioInscripcion | null>;
  obtenerPorId(id: number): Promise<PrecioInscripcion | null>;
  crear(data: CrearPrecioDTO): Promise<PrecioInscripcion>;
  actualizar(id: number, data: ActualizarPrecioDTO): Promise<PrecioInscripcion>;
  eliminar(id: number): Promise<void>;
}
