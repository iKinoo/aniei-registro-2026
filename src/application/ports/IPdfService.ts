export interface ConstanciaData {
  nombre: string;
  apellido: string;
  folio: string;
  institucion: string;
  tipoUsuario: string;
  fecha: string;
}

export interface ConstanciaPonenteData {
  nombre: string;
  apellido: string;
  tipoActividad: string;
  nombreActividad: string;
  fecha: string;
}

export interface HojaRegistroGrupoData {
  token: string;
  nombres: string[];
  responsableNombre: string;
}

export interface ConstanciaManualData {
  tipoConstancia: string;
  destinatarios: string[];
  descripcion: string;
  fecha: string;
}

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
  generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer>;
  generarConstanciaPonente(datos: ConstanciaPonenteData): Promise<Buffer>;
  generarConstanciaParticipante(datos: ConstanciaPonenteData): Promise<Buffer>;
  generarHojaRegistroGrupo(datos: HojaRegistroGrupoData): Promise<Buffer>;
  generarConstanciaManual(datos: ConstanciaManualData): Promise<Buffer>;
  generarListaParticipantes(datos: ListaParticipantesPdfData): Promise<Buffer>;
  generarReporteInstituciones(datos: ReporteInstitucionesPdfData): Promise<Buffer>;
}
