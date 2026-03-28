import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { FolioRecibo } from '@/core/value-objects/FolioRecibo';

export interface IUsuarioRepository {
  crear(usuario: Usuario): Promise<Usuario>;
  crearMuchos(usuarios: Usuario[]): Promise<Usuario[]>;
  buscarPorCorreo(correo: Email): Promise<Usuario | null>;
  buscarPorId(id: number): Promise<Usuario | null>;
  buscarPorFolio(folio: FolioRecibo): Promise<Usuario | null>;
  actualizarFolio(id: number, folio: FolioRecibo): Promise<void>;
  verificar(id: number): Promise<void>;
}
