import type { ContenidoConstancia } from '@/application/dtos/ConstanciaDTO';

export interface ListaParticipantesPdfData {
  nombreActividad: string;
  tipoActividad: string;
  fecha: string;
  participantes: {
    numero: number;
    nombre: string;
    correo: string;
    fechaInscripcion: string;
  }[];
}

export interface ReporteInstitucionesPdfData {
  totalInstituciones: number;
  totalParticipantes: number;
  instituciones: {
    numero: number;
    nombre: string;
    totalParticipantes: number;
  }[];
}

export interface IPdfService {
  generarConstancia(datos: ContenidoConstancia): Promise<Uint8Array>;
  generarListaParticipantes(datos: ListaParticipantesPdfData): Promise<Uint8Array>;
  generarReporteInstituciones(datos: ReporteInstitucionesPdfData): Promise<Uint8Array>;
}
