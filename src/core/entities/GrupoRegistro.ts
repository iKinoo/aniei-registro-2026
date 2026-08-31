import { Usuario } from './Usuario';
import { Genero } from '../enums/Genero';
import { Email } from '../value-objects/Email';
import { GrupoRegistroError } from '../errors/GrupoRegistroError';

export interface MiembroInput {
  nombre: string;
  apellido: string;
  correo: string;
  genero: Genero;
  carrera?: string | null;
}

export class GrupoRegistro {
  private readonly _responsable: Usuario;
  private readonly _miembros: Usuario[];
  readonly idInstitucionCompartida: number | null;
  readonly idEntidadFederativaCompartida: number;
  private readonly _responsableYaRegistrado: boolean;

  private constructor(
    responsable: Usuario,
    miembros: Usuario[],
    responsableYaRegistrado: boolean,
  ) {
    this._responsable = responsable;
    this._miembros = miembros;
    this.idInstitucionCompartida = responsable.idInstitucion;
    this.idEntidadFederativaCompartida = responsable.idEntidadFederativa;
    this._responsableYaRegistrado = responsableYaRegistrado;
  }

  static create(
    responsable: Usuario,
    miembrosInput: MiembroInput[],
    responsableYaRegistrado = false,
  ): GrupoRegistro {
    if (miembrosInput.length === 0) {
      throw GrupoRegistroError.GRUPO_VACIO();
    }

    const correos = new Set<string>();
    for (const m of miembrosInput) {
      const correoLower = m.correo.toLowerCase().trim();
      if (correos.has(correoLower)) {
        throw GrupoRegistroError.MIEMBRO_CORREO_DUPLICADO(m.correo);
      }
      correos.add(correoLower);
    }

    if (correos.has(responsable.correo.toString())) {
      throw GrupoRegistroError.MIEMBRO_CORREO_DUPLICADO(responsable.correo.toString());
    }

    const miembros = miembrosInput.map((m) =>
      Usuario.create({
        nombre: m.nombre,
        apellido: m.apellido,
        correo: Email.create(m.correo),
        genero: m.genero,
        carrera: m.carrera,
        idTitulo: responsable.idTitulo,
        idTipoParticipante: responsable.idTipoParticipante,
        idInstitucion: responsable.idInstitucion,
        idEntidadFederativa: responsable.idEntidadFederativa,
      }),
    );

    return new GrupoRegistro(responsable, miembros, responsableYaRegistrado);
  }

  get responsable(): Usuario { return this._responsable; }
  get miembros(): Usuario[] { return [...this._miembros]; }

  obtenerTodos(): Usuario[] {
    if (this._responsableYaRegistrado) {
      return [...this._miembros];
    }
    return [this._responsable, ...this._miembros];
  }

  obtenerNuevosRegistros(): Usuario[] {
    if (this._responsableYaRegistrado) {
      return [...this._miembros];
    }
    return [this._responsable, ...this._miembros];
  }

  totalIntegrantes(): number {
    return this._responsableYaRegistrado
      ? this._miembros.length
      : this._miembros.length + 1;
  }

  esResponsableExistente(): boolean {
    return this._responsableYaRegistrado;
  }
}
