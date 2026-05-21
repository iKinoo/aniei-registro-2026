import { Email } from '../value-objects/Email';
import { Telefono } from '../value-objects/Telefono';
import { CodigoBarras } from '../value-objects/CodigoBarras';
import { Genero } from '../enums/Genero';
import { RegistroError } from '../errors/RegistroError';

export interface UsuarioProps {
  folioRegistro?: string | null;
  codigoBarras?: CodigoBarras | null;
  nombre: string;
  apellido: string;
  correo: Email;
  telefono?: Telefono | null;
  genero: Genero;
  carrera?: string | null;
  dependencia?: string | null;
  idTitulo: number;
  idInstitucion: number;
  idEntidadFederativa: number;
  verificado?: boolean;
  fechaRegistro?: Date;
}

export class Usuario {
  readonly folioRegistro: string | null;
  private _codigoBarras: CodigoBarras | null;
  readonly nombre: string;
  readonly apellido: string;
  readonly correo: Email;
  readonly telefono: Telefono | null;
  readonly genero: Genero;
  readonly carrera: string | null;
  readonly dependencia: string | null;
  readonly idTitulo: number;
  readonly idInstitucion: number;
  readonly idEntidadFederativa: number;
  private _verificado: boolean;
  readonly fechaRegistro: Date;

  private constructor(props: UsuarioProps) {
    this.folioRegistro = props.folioRegistro ?? null;
    this._codigoBarras = props.codigoBarras ?? null;
    this.nombre = props.nombre;
    this.apellido = props.apellido;
    this.correo = props.correo;
    this.telefono = props.telefono ?? null;
    this.genero = props.genero;
    this.carrera = props.carrera ?? null;
    this.dependencia = props.dependencia ?? null;
    this.idTitulo = props.idTitulo;
    this.idInstitucion = props.idInstitucion;
    this.idEntidadFederativa = props.idEntidadFederativa;
    this._verificado = props.verificado ?? false;
    this.fechaRegistro = props.fechaRegistro ?? new Date();
  }

  static create(props: UsuarioProps): Usuario {
    if (!props.nombre.trim()) {
      throw RegistroError.DATOS_INVALIDOS('El nombre es requerido');
    }
    if (!props.apellido.trim()) {
      throw RegistroError.DATOS_INVALIDOS('El apellido es requerido');
    }
    return new Usuario({
      ...props,
      nombre: props.nombre.trim(),
      apellido: props.apellido.trim(),
      carrera: props.carrera?.trim() || null,
      dependencia: props.dependencia?.trim() || null,
    });
  }

  get codigoBarras(): CodigoBarras | null { return this._codigoBarras; }
  get verificado(): boolean { return this._verificado; }

  verificar(): void {
    this._verificado = true;
  }

  asignarCodigoBarras(codigo: CodigoBarras): void {
    this._codigoBarras = codigo;
  }

  nombreCompleto(): string {
    return `${this.nombre} ${this.apellido}`;
  }
}
