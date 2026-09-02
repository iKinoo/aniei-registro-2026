import { EquipoDTO, CrearEquipoDTO, ActualizarEquipoDTO, UsuarioBusquedaDTO } from '@/application/dtos/EquipoDTO';

export interface IEquipoRepository {
  listarPorActividad(idActividad: number): Promise<EquipoDTO[]>;
  obtenerPorId(idEquipo: number): Promise<EquipoDTO | null>;
  obtenerSiguienteNumero(idActividad: number): Promise<number>;
  crear(data: CrearEquipoDTO, numeroEquipo: number): Promise<EquipoDTO>;
  actualizar(idEquipo: number, data: ActualizarEquipoDTO): Promise<EquipoDTO>;
  eliminar(idEquipo: number): Promise<void>;
  buscarUsuarios(query: string): Promise<UsuarioBusquedaDTO[]>;
}
