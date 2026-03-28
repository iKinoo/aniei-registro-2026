export interface ConstanciaData {
  nombre: string;
  apellido: string;
  folio: string;
  institucion: string;
  tipoUsuario: string;
  fecha: string;
}

export interface IPdfService {
  generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer>;
}
