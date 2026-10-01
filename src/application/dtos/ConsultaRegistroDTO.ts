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
    idSala: number | null;
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
