export type TipoConstanciaManual =
  | 'PARTICIPANTE'
  | 'TALLER'
  | 'CONFERENCIA_MAGISTRAL'
  | 'PONENTE'
  | 'CONCURSO_PROGRAMACION'
  | 'HACKATHON'
  | 'TESIS';

export type RolConstanciaManual = 'IMPARTE' | 'PARTICIPA' | 'EXPONENTE' | 'AUTORES';

export interface ConstanciaManualArchivo {
  destinatario: string | null;
  ruta: string;
}

export interface ConstanciaManualDTO {
  tipoConstancia: TipoConstanciaManual;
  destinatarios: string[];
  rol?: RolConstanciaManual;
  nombreActividad?: string;
  nombrePonencia?: string;
  nombreEquipo?: string;
  nombreTesis?: string;
  lugar?: string;
}

export interface ConstanciaManualGeneradaDTO {
  id: string;
  tipoConstancia: TipoConstanciaManual;
  destinatarios: string[];
  descripcion: string;
  urlPdf: string;
  fechaGeneracion: string;
}

export const TIPOS_CONSTANCIA: { value: TipoConstanciaManual; label: string }[] = [
  { value: 'PARTICIPANTE', label: 'Participante' },
  { value: 'TALLER', label: 'Taller' },
  { value: 'CONFERENCIA_MAGISTRAL', label: 'Conferencia Magistral' },
  { value: 'PONENTE', label: 'Ponente' },
  { value: 'CONCURSO_PROGRAMACION', label: 'Concurso de Programación' },
  { value: 'HACKATHON', label: 'Hackathon' },
  { value: 'TESIS', label: 'Tesis' },
];
