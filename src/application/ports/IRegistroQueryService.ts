import type { UsuarioConsultaDTO, DetalleUsuarioDTO, PerfilDTO, InstitucionReporteItem } from '../dtos/ConsultaRegistroDTO';

export interface IRegistroQueryService {
  obtenerUsuario(folio: string): Promise<UsuarioConsultaDTO | null>;
  obtenerDetalle(folio: string): Promise<DetalleUsuarioDTO | null>;
  obtenerPerfil(folio: string): Promise<PerfilDTO | null>;
  buscarUsuarios(query: string): Promise<Array<Pick<UsuarioConsultaDTO, 'folioRegistro' | 'nombre' | 'apellido' | 'correo'>>>;
  obtenerReporteInstituciones(): Promise<InstitucionReporteItem[]>;
}
