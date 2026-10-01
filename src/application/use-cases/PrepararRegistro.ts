import type { ICatalogoRepository } from '../ports/ICatalogoRepository';
import type { IPrecioInscripcionRepository } from '../ports/IPrecioInscripcionRepository';
import type { ITipoParticipanteRepository } from '../ports/ITipoParticipanteRepository';

export class PrepararRegistro {
  constructor(private readonly catalogos: ICatalogoRepository, private readonly precios: IPrecioInscripcionRepository,
    private readonly tipos: ITipoParticipanteRepository) {}

  async execute() {
    const [titulos, estados, instituciones, precios, tiposParticipante] = await Promise.all([
      this.catalogos.obtenerTitulos(), this.catalogos.obtenerEstados(), this.catalogos.obtenerInstituciones(),
      this.precios.obtenerTodos(), this.tipos.obtenerTodos(),
    ]);
    return { catalogos: { titulos, estados, instituciones }, precios, tiposParticipante };
  }
}
