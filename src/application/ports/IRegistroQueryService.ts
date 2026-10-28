import type { UsuarioConsultaDTO, DetalleUsuarioDTO, PerfilDTO, InstitucionReporteItem, TalleristaReporteItem } from '../dtos/ConsultaRegistroDTO';
import type { GrupoForAdminDTO } from '../dtos/GrupoForAdminDTO';

export interface IRegistroQueryService {
  obtenerUsuario(folio: string): Promise<UsuarioConsultaDTO | null>;
  obtenerDetalle(folio: string): Promise<DetalleUsuarioDTO | null>;
  obtenerPerfil(folio: string): Promise<PerfilDTO | null>;
  obtenerGruposRegistrados(folioResponsable: string): Promise<GrupoForAdminDTO[]>;
  buscarUsuarios(query: string): Promise<Array<Pick<UsuarioConsultaDTO, 'folioRegistro' | 'nombre' | 'apellido' | 'correo'>>>;
  obtenerReporteInstituciones(): Promise<InstitucionReporteItem[]>;
  obtenerReporteTalleristas(): Promise<TalleristaReporteItem[]>;
}
