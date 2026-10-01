import { Titulo, Estado, Institucion, TipoUsuario } from '@/application/dtos/CatalogosDTO';

export interface ICatalogoRepository {
  obtenerTitulos(): Promise<Titulo[]>;
  obtenerEstados(): Promise<Estado[]>;
  obtenerInstituciones(): Promise<Institucion[]>;
  obtenerTiposUsuario(): Promise<TipoUsuario[]>;
}
