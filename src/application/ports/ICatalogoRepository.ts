import { Titulo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';

export interface ICatalogoRepository {
  obtenerTitulos(): Promise<Titulo[]>;
  obtenerEstados(): Promise<Estado[]>;
  obtenerInstituciones(): Promise<Institucion[]>;
  obtenerTiposUsuario(): Promise<TipoUsuario[]>;
}
