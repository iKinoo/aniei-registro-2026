import type { Genero } from '@/core/enums/Genero';

export interface CompletarDatosRegistroDTO {
  telefono?: string | null;
  lada?: string | null;
  extension?: string | null;
  genero?: Genero;
  carrera?: string | null;
  dependencia?: string | null;
  idTitulo?: number | null;
  idInstitucion?: number | null;
  institucionExterna?: string | null;
  idEntidadFederativa?: number | null;
  idTipoParticipante?: number | null;
  noAfiliada: boolean;
}
