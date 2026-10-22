import { PonenteDTO, VinculoPonenteDTO } from '@/application/dtos/ActividadDTO';

export interface IPonentesRepository {
  vincular(idActividad: number, folioRegistro: string, rol?: string): Promise<void>;
  desvincular(idActividad: number, folioRegistro: string): Promise<void>;
  obtenerPorActividad(idActividad: number): Promise<PonenteDTO[]>;
  actualizarUrlConstancia(idActividad: number, folioRegistro: string, url: string): Promise<void>;
  /** Todos los vínculos ponente-actividad del congreso, con datos del usuario y de la actividad */
  obtenerTodos(): Promise<VinculoPonenteDTO[]>;
}
