import type { ActualizarUsuarioDTO } from '../dtos/ActualizarUsuarioDTO';
import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';

export interface IUsuarioRepository {
  actualizar(folio: string, data: ActualizarUsuarioDTO): Promise<void>;
  eliminar(folio: string): Promise<string[]>;
  crear(usuario: Usuario): Promise<Usuario>;
  crearMuchos(usuarios: Usuario[]): Promise<Usuario[]>;
  buscarPorCorreo(correo: Email): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  buscarPorFolio(folio: FolioRegistro): Promise<Usuario | null>;
  verificar(id: string): Promise<void>;

  crearGrupo(data: {
    token: string;
    responsableId: string;
    institucionId: number | null;
    dependenciaId: string;
    estadoId: number;
    miembros: Array<{
      nombre: string;
      apellido: string;
      correo: string;
      passwordHash: string;
      idTipoParticipante: number;
    }>;
  }): Promise<{ usuariosIds: string[], folios: string[] }>;
}
