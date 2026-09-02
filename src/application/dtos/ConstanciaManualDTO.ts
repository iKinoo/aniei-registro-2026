export type TipoConstanciaManual =
  | 'PARTICIPANTE'
  | 'TALLER'
  | 'CONFERENCIA_MAGISTRAL'
  | 'PONENTE'
  | 'CONCURSO_PROGRAMACION'
  | 'HACKATHON'
  | 'TESIS';

export interface ConstanciaManualDTO {
  tipoConstancia: TipoConstanciaManual;
  destinatarios: string[];
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
