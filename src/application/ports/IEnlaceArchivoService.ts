export interface IEnlaceArchivoService {
  validar(ruta: string, exp: string, sig: string): 'VALIDO' | 'INVALIDO' | 'EXPIRADO';
}
