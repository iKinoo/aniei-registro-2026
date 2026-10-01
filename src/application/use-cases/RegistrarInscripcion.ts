import type { RegistrarUsuario } from './RegistrarUsuario';
import type { RegistrarGrupoRapido } from './RegistrarGrupoRapido';
import type { RegistroUsuarioDTO } from '../dtos/RegistroUsuarioDTO';

export class RegistrarInscripcion {
  constructor(private readonly individual: RegistrarUsuario, private readonly grupal: RegistrarGrupoRapido) {}

  async execute(dto: RegistroUsuarioDTO, miembros: Array<{ nombre: string; apellido: string; correo: string }>) {
    const resultado = await this.individual.execute(dto);
    if (miembros.length) {
      try {
        await this.grupal.execute({ responsableId: resultado.folio, miembros, deposito: dto.deposito, archivo: dto.archivo });
      } catch (error) {
        console.error('Error en registro grupal, el responsable quedó registrado:', error);
      }
    }
    return resultado;
  }
}
