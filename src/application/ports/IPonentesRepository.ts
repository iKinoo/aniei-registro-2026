import { PonenteDTO } from '@/application/dtos/ActividadDTO';

export interface IPonentesRepository {
  vincular(idActividad: number, folioRegistro: string, rol?: string): Promise<void>;
  desvincular(idActividad: number, folioRegistro: string): Promise<void>;
  obtenerPorActividad(idActividad: number): Promise<PonenteDTO[]>;
  actualizarUrlConstancia(idActividad: number, folioRegistro: string, url: string): Promise<void>;
}
