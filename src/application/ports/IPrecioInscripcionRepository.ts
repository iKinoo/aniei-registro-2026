import { PrecioInscripcion } from '@/shared/types/catalogos';

export interface CrearPrecioDTO {
  fechaLimite: Date;
  costo: number;
  costoMiembro?: number;
  orden: number;
  activo: boolean;
}

export interface ActualizarPrecioDTO {
  fechaLimite?: Date;
  costo?: number;
  costoMiembro?: number;
  orden?: number;
  activo?: boolean;
}

export interface IPrecioInscripcionRepository {
  obtenerTodos(): Promise<PrecioInscripcion[]>;
  obtenerVigente(): Promise<PrecioInscripcion | null>;
  obtenerPorId(id: number): Promise<PrecioInscripcion | null>;
  crear(data: CrearPrecioDTO): Promise<PrecioInscripcion>;
  actualizar(id: number, data: ActualizarPrecioDTO): Promise<PrecioInscripcion>;
  eliminar(id: number): Promise<void>;
}
