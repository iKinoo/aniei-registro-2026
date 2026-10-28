import type { PrecioInscripcion } from './CatalogosDTO';

export interface CamposFaltantesPerfilDTO {
  telefono: boolean;
  lada: boolean;
  extension: boolean;
  genero: boolean;
  carrera: boolean;
  idTitulo: boolean;
  dependencia: boolean;
  institucion: boolean;
  idEntidadFederativa: boolean;
  idTipoParticipante: boolean;
}

export interface EstadoRegistroPerfilDTO {
  datosCompletados: boolean;
  camposFaltantes: CamposFaltantesPerfilDTO;
  esMiembroGrupo: boolean;
  pagoCubiertoPorGrupo: boolean;
  tienePagoPrincipal: boolean;
  requierePago: boolean;
  precioVigente: PrecioInscripcion | null;
}
