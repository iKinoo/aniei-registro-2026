import { Cargo, Estado, Institucion, TipoUsuario } from '@/shared/types/catalogos';

export interface ICatalogoRepository {
  obtenerCargos(): Promise<Cargo[]>;
  obtenerEstados(): Promise<Estado[]>;
  obtenerInstituciones(): Promise<Institucion[]>;
  obtenerTiposUsuario(): Promise<TipoUsuario[]>;
}
