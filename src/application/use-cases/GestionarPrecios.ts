import { IPrecioInscripcionRepository, CrearPrecioDTO, ActualizarPrecioDTO } from '@/application/ports/IPrecioInscripcionRepository';
import { PrecioInscripcion } from '@/shared/types/catalogos';

export class GestionarPrecios {
  constructor(private readonly precioRepo: IPrecioInscripcionRepository) {}

  async obtenerPrecios(): Promise<PrecioInscripcion[]> {
    return this.precioRepo.obtenerTodos();
  }

  async obtenerPrecioVigente(idTipoParticipante: number, esAfiliada: boolean): Promise<PrecioInscripcion | null> {
    return this.precioRepo.obtenerVigente(idTipoParticipante, esAfiliada);
  }

  async guardarPrecio(id: number, data: ActualizarPrecioDTO): Promise<PrecioInscripcion> {
    if (data.costo !== undefined && data.costo <= 0) {
      throw new Error('El costo debe ser mayor a 0.');
    }
    return this.precioRepo.actualizar(id, data);
  }

  async crearPrecio(data: CrearPrecioDTO): Promise<PrecioInscripcion> {
    if (data.costo <= 0) {
      throw new Error('El costo debe ser mayor a 0.');
    }
    return this.precioRepo.crear(data);
  }

  async eliminarPrecio(id: number): Promise<void> {
    await this.precioRepo.eliminar(id);
  }
}
