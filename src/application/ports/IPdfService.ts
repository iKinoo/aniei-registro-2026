import type { ContenidoConstancia } from '@/application/dtos/ConstanciaDTO';

/** Lista de asistencia editable: cada fila lleva folio y nombre, con casilla marcable. */
export interface ListaParticipantesPdfData {
  nombreActividad: string;
  tipoActividad: string;
  fecha: string;
  participantes: {
    numero: number;
    folio: string;
    nombre: string;
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

export interface ReporteTalleristasPdfData {
  totalTalleres: number;
  totalTalleristas: number;
  talleristas: {
    numero: number;
    folio: string;
    nombre: string;
    taller: string;
    modalidad: 'PRESENCIAL' | 'VIRTUAL';
    correo: string;
    ligaOLugar: string;
  }[];
}

export interface IPdfService {
  generarConstancia(datos: ContenidoConstancia): Promise<Uint8Array>;
  generarListaParticipantes(datos: ListaParticipantesPdfData): Promise<Uint8Array>;
  generarReporteInstituciones(datos: ReporteInstitucionesPdfData): Promise<Uint8Array>;
  generarReporteTalleristas(datos: ReporteTalleristasPdfData): Promise<Uint8Array>;
}
