import type { Estado, Institucion, Titulo } from './CatalogosDTO';

export interface UsuarioConsultaDTO {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string | null;
  lada: string | null;
  extension: string | null;
  genero: string | null;
  carrera: string | null;
  dependencia: string | null;
  idTitulo: number | null;
  idTipoParticipante: number | null;
  idInstitucion: number | null;
  idEntidadFederativa: number | null;
  institucionExterna: string | null;
  idGrupoRegistro: number | null;
  fechaRegistro: Date | null;
}

export interface DepositoHistorialDTO {
  idDeposito: number | null;
  proposito: string;
  monto: number;
  referencia: string;
  bancoSucursal: string | null;
  ciudad: string | null;
  fechaDeposito: Date;
  fechaRegistro: Date;
  notas: string | null;
  archivoUrl: string;
  archivoNombre: string;
}

export interface InscripcionConsultaDTO {
  idInscripcion: number;
  idActividad: number | null;
  fechaInscripcion: Date;
  urlConstancia: string | null;
  actividad: {
    nombre: string;
    costo: number;
    fechaInicio: Date;
    fechaFin: Date;
    sala: string | null;
    modalidad: 'PRESENCIAL' | 'VIRTUAL';
    enlaceSesion: string | null;
    horarios: { fechaInicio: Date; fechaFin: Date }[];
    tipoActividad: { descripcion: string } | null;
    institucion: Institucion | null;
  } | null;
}

export interface DetalleUsuarioDTO {
  usuario: UsuarioConsultaDTO & { institucion: Institucion | null; titulo: Titulo | null; estado: Estado | null };
  depositos: DepositoHistorialDTO[];
  facturacion: {
    razonSocial: string;
    rfc: string;
    calle: string | null;
    numExterior: string | null;
    numInterior: string | null;
    colonia: string | null;
    municipio: string | null;
    codigoPostal: string | null;
    constanciaUrl: string | null;
    constanciaNombre: string | null;
  } | null;
  inscripciones: InscripcionConsultaDTO[];
  registradoPor: {
    folioRegistro: string;
    nombreCompleto: string;
    correo: string;
  } | null;
}

export interface PerfilDTO extends DetalleUsuarioDTO {
  equipos: Array<{
    esRepresentante: boolean;
    equipo: { idEquipo: number; numeroEquipo: number; nombreEquipo: string; actividad: { nombre: string } };
  }>;
}

export interface InstitucionReporteItem {
  idInstitucion: number;
  nombre: string;
  abreviatura: string | null;
  totalParticipantes: number;
}

export interface TalleristaReporteItem {
  idActividad: number;
  nombreTaller: string;
  folioRegistro: string;
  nombreTallerista: string;
  correo: string;
  modalidad: 'PRESENCIAL' | 'VIRTUAL';
  enlaceSesion: string | null;
  sede: string | null;
  sala: string | null;
}

export interface ParticipanteTallerReporteItem {
  idActividad: number;
  nombreTaller: string;
  folioRegistro: string;
  nombreParticipante: string;
  correo: string;
}
