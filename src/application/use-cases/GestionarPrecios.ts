import { IPrecioInscripcionRepository, CrearPrecioDTO, ActualizarPrecioDTO } from '@/application/ports/IPrecioInscripcionRepository';
import { PrecioInscripcion } from '@/shared/types/catalogos';

export class GestionarPrecios {
  constructor(private readonly precioRepo: IPrecioInscripcionRepository) {}

  async obtenerPrecios(): Promise<PrecioInscripcion[]> {
    return this.precioRepo.obtenerTodos();
  }

  async obtenerPrecioVigente(): Promise<PrecioInscripcion | null> {
    return this.precioRepo.obtenerVigente();
  }

  async guardarPrecio(id: number, data: ActualizarPrecioDTO): Promise<PrecioInscripcion> {
    if (data.costo !== undefined && data.costo <= 0) {
      throw new Error('El costo debe ser mayor a 0.');
    }
    if (data.costoMiembro !== undefined && data.costoMiembro < 0) {
      throw new Error('El costo por miembro no puede ser negativo.');
    }
    return this.precioRepo.actualizar(id, data);
  }

  async crearPrecio(data: CrearPrecioDTO): Promise<PrecioInscripcion> {
    if (data.costo <= 0) {
      throw new Error('El costo debe ser mayor a 0.');
    }
    if (data.costoMiembro !== undefined && data.costoMiembro < 0) {
      throw new Error('El costo por miembro no puede ser negativo.');
    }
    const actuales = await this.precioRepo.obtenerTodos();
    if (actuales.length >= 3) {
      throw new Error('Solo se permiten 3 niveles de precio.');
    }
    return this.precioRepo.crear(data);
  }

  async eliminarPrecio(id: number): Promise<void> {
    await this.precioRepo.eliminar(id);
  }
}
