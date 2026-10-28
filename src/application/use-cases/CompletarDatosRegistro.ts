import type { IRegistroQueryService } from '../ports/IRegistroQueryService';
import type { IUsuarioRepository } from '../ports/IUsuarioRepository';
import type { ActualizarUsuarioDTO } from '../dtos/ActualizarUsuarioDTO';
import type { CompletarDatosRegistroDTO } from '../dtos/CompletarDatosRegistroDTO';
import { Genero } from '@/core/enums/Genero';
import { RegistroError } from '@/core/errors/RegistroError';
import { Telefono } from '@/core/value-objects/Telefono';
import { datosRegistroCompletos, obtenerCamposFaltantes } from '../services/EstadoRegistroPerfil';

function enteroPositivo(valor: number | null | undefined): boolean {
  return typeof valor === 'number' && Number.isSafeInteger(valor) && valor > 0;
}

export class CompletarDatosRegistro {
  constructor(
    private readonly registros: IRegistroQueryService,
    private readonly usuarios: IUsuarioRepository,
  ) {}

  async execute(folio: string, dto: CompletarDatosRegistroDTO): Promise<void> {
    const actual = await this.registros.obtenerUsuario(folio);
    if (!actual) {
      throw RegistroError.INSCRIPCION_INEXISTENTE();
    }
    if (datosRegistroCompletos(actual)) {
      throw new RegistroError(
        'Los datos de registro ya fueron completados y no pueden modificarse',
        'DATOS_COMPLETADOS',
      );
    }

    const faltantes = obtenerCamposFaltantes(actual);

    if (faltantes.genero && (!dto.genero || !Object.values(Genero).includes(dto.genero))) {
      throw RegistroError.DATOS_INVALIDOS('seleccione un género');
    }
    if (faltantes.idTitulo && !enteroPositivo(dto.idTitulo)) {
      throw RegistroError.DATOS_INVALIDOS('seleccione un título');
    }
    if (faltantes.idEntidadFederativa && !enteroPositivo(dto.idEntidadFederativa)) {
      throw RegistroError.DATOS_INVALIDOS('seleccione un estado');
    }
    if (faltantes.idTipoParticipante && !enteroPositivo(dto.idTipoParticipante)) {
      throw RegistroError.DATOS_INVALIDOS('seleccione un tipo de participante');
    }

    let idInstitucion = actual.idInstitucion;
    let institucionExterna = actual.institucionExterna;
    if (faltantes.institucion) {
      if (dto.noAfiliada) {
        const externa = dto.institucionExterna?.trim() ?? '';
        if (!externa) {
          throw RegistroError.DATOS_INVALIDOS('indique el nombre de su institución');
        }
        idInstitucion = null;
        institucionExterna = externa;
      } else {
        if (!enteroPositivo(dto.idInstitucion)) {
          throw RegistroError.DATOS_INVALIDOS('seleccione una institución o marque que no está afiliada');
        }
        idInstitucion = dto.idInstitucion ?? null;
        institucionExterna = null;
      }
    }

    const telefono = faltantes.telefono ? (dto.telefono?.trim() || null) : actual.telefono;
    const lada = faltantes.lada ? (dto.lada?.trim() || null) : actual.lada;
    const extension = faltantes.extension ? (dto.extension?.trim() || null) : actual.extension;

    if (telefono) {
      try {
        Telefono.create(telefono, lada, extension);
      } catch {
        throw RegistroError.DATOS_INVALIDOS('el teléfono no tiene un formato válido');
      }
    }

    const actualizado: ActualizarUsuarioDTO = {
      nombre: actual.nombre,
      apellido: actual.apellido,
      correo: actual.correo,
      telefono,
      lada,
      extension,
      genero: faltantes.genero ? dto.genero! : actual.genero,
      carrera: faltantes.carrera ? (dto.carrera?.trim() || null) : actual.carrera,
      dependencia: faltantes.dependencia ? (dto.dependencia?.trim() || null) : actual.dependencia,
      idTitulo: faltantes.idTitulo ? dto.idTitulo! : actual.idTitulo,
      idTipoParticipante: faltantes.idTipoParticipante ? dto.idTipoParticipante! : actual.idTipoParticipante,
      idInstitucion,
      institucionExterna,
      idEntidadFederativa: faltantes.idEntidadFederativa ? dto.idEntidadFederativa! : actual.idEntidadFederativa,
    };

    await this.usuarios.actualizar(folio, actualizado);
  }
}
