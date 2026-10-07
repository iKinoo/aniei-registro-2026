import type { RegistrarUsuario } from './RegistrarUsuario';
import type { RegistrarGrupoRapido } from './RegistrarGrupoRapido';
import type { RegistroUsuarioDTO } from '../dtos/RegistroUsuarioDTO';
import type { ResultadoInscripcion } from '../dtos/ResultadoInscripcion';

export class RegistrarInscripcion {
  constructor(private readonly individual: RegistrarUsuario, private readonly grupal: RegistrarGrupoRapido) {}

  async execute(dto: RegistroUsuarioDTO, miembros: Array<{ nombre: string; apellido: string; correo: string }>): Promise<ResultadoInscripcion> {
    const responsable = await this.individual.execute(dto);
    let grupo: ResultadoInscripcion['grupo'];
    if (miembros.length) {
      try {
        grupo = await this.grupal.execute({ responsableId: responsable.folio, miembros, deposito: dto.deposito, archivo: dto.archivo });
      } catch (error) {
        console.error('Error en registro grupal, el responsable quedó registrado:', error);
      }
    }
    return { responsable, grupo };
  }

  async notificar(resultado: ResultadoInscripcion): Promise<void> {
    const errores: string[] = [];

    try {
      await this.individual.notificar(resultado.responsable.notificacion);
    } catch (error) {
      errores.push(`Individual: ${error instanceof Error ? error.message : String(error)}`);
    }

    if (resultado.grupo) {
      try {
        await this.grupal.notificar(resultado.grupo.notificacion);
      } catch (error) {
        errores.push(`Grupal: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    if (errores.length > 0) {
      throw new Error(errores.join(' | '));
    }
  }
}
