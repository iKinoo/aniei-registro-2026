import { PonenteDTO } from '@/application/dtos/ActividadDTO';

export interface IPonentesRepository {
  vincular(idActividad: number, idUsuario: number, rol?: string): Promise<void>;
  desvincular(idActividad: number, idUsuario: number): Promise<void>;
  obtenerPorActividad(idActividad: number): Promise<PonenteDTO[]>;
}
