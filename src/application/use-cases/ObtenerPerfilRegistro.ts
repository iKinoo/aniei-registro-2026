import type { IRegistroQueryService } from '../ports/IRegistroQueryService';
import type { IPrecioInscripcionRepository } from '../ports/IPrecioInscripcionRepository';
import type { PerfilDTO } from '../dtos/ConsultaRegistroDTO';
import type { EstadoRegistroPerfilDTO } from '../dtos/PerfilRegistroDTO';
import { datosRegistroCompletos, obtenerCamposFaltantes } from '../services/EstadoRegistroPerfil';

export interface PerfilConEstado {
  perfil: PerfilDTO;
  estado: EstadoRegistroPerfilDTO;
}

export class ObtenerPerfilRegistro {
  constructor(
    private readonly registros: IRegistroQueryService,
    private readonly precios: IPrecioInscripcionRepository,
  ) {}

  async execute(folio: string): Promise<PerfilConEstado | null> {
    const perfil = await this.registros.obtenerPerfil(folio);
    if (!perfil) return null;

    const { usuario, depositos } = perfil;
    const camposFaltantes = obtenerCamposFaltantes(usuario);
    const datosCompletados = datosRegistroCompletos(usuario);
    const esMiembroGrupo = usuario.idGrupoRegistro !== null;
    const tienePagoPrincipal = depositos.some((deposito) => deposito.proposito === 'EVENTO_PRINCIPAL');
    const requierePago = !esMiembroGrupo && !tienePagoPrincipal;

    const precioVigente = requierePago && datosCompletados && usuario.idTipoParticipante
      ? await this.precios.obtenerVigente(usuario.idTipoParticipante, usuario.idInstitucion !== null)
      : null;

    return {
      perfil,
      estado: {
        datosCompletados,
        camposFaltantes,
        esMiembroGrupo,
        pagoCubiertoPorGrupo: esMiembroGrupo,
        tienePagoPrincipal,
        requierePago,
        precioVigente,
      },
    };
  }
}
