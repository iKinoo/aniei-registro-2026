import type { NotificacionGrupoData } from './NotificacionRegistro';

export interface ResultadoRegistroGrupo {
  success: boolean;
  totalRegistrados: number;
  costoTotal?: number;
  folios: string[];
  notificacion: NotificacionGrupoData;
}
