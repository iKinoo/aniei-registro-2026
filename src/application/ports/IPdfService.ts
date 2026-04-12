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

export interface IPdfService {
  generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer>;
  generarConstanciaPonente(datos: ConstanciaPonenteData): Promise<Buffer>;
}
