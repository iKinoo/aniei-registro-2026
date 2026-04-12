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

export interface IPdfService {
  generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer>;
  generarConstanciaPonente(datos: ConstanciaPonenteData): Promise<Buffer>;
  generarHojaRegistroGrupo(datos: HojaRegistroGrupoData): Promise<Buffer>;
}
