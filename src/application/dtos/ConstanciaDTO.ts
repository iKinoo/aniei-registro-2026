export interface SegmentoConstancia {
  texto: string;
  negrita?: boolean;
}

export type AlineacionConstancia = 'centro' | 'justificada';

export interface LineaConstancia {
  segmentos: SegmentoConstancia[];
  alineacion: AlineacionConstancia;
}

export interface ContenidoConstancia {
  destinatario: string;
  cuerpo: LineaConstancia[];
}

export interface ConstanciaData {
  nombre: string;
  apellido: string;
  folio: string;
  institucion: string;
  tipoUsuario: string;
  fecha: string;
}
