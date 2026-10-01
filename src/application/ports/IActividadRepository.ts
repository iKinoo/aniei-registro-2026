import { TipoActividad } from '@/application/dtos/CatalogosDTO';
import { ActividadDTO, CrearActividadDTO, ActualizarActividadDTO } from '@/application/dtos/ActividadDTO';

export interface IActividadRepository {
  listar(): Promise<ActividadDTO[]>;
  obtenerPorId(id: number): Promise<ActividadDTO | null>;
  crear(data: CrearActividadDTO): Promise<ActividadDTO>;
  actualizar(id: number, data: ActualizarActividadDTO): Promise<ActividadDTO>;
  obtenerTiposActividad(): Promise<TipoActividad[]>;
}
