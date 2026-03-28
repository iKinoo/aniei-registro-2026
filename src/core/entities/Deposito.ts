import { ArchivoComprobante } from '../value-objects/ArchivoComprobante';
import { Monto } from '../value-objects/Monto';

export interface DepositoProps {
  idDeposito?: number | null;
  idUsuario: number;
  bancoSucursal?: string | null;
  ciudad?: string | null;
  referencia: string;
  monto: Monto;
  fechaDeposito: Date;
  archivoUrl: string;
  archivoNombre: string;
  archivoMime: string;
  archivoTamanio: number;
  fechaRegistro?: Date;
}

export class Deposito {
  readonly idDeposito: number | null;
  readonly idUsuario: number;
  readonly bancoSucursal: string | null;
  readonly ciudad: string | null;
  readonly referencia: string;
  readonly monto: Monto;
  readonly fechaDeposito: Date;
  readonly archivoUrl: string;
  readonly archivo: ArchivoComprobante;
  readonly fechaRegistro: Date;

  private constructor(props: DepositoProps, archivo: ArchivoComprobante) {
    this.idDeposito = props.idDeposito ?? null;
    this.idUsuario = props.idUsuario;
    this.bancoSucursal = props.bancoSucursal ?? null;
    this.ciudad = props.ciudad ?? null;
    this.referencia = props.referencia;
    this.monto = props.monto;
    this.fechaDeposito = props.fechaDeposito;
    this.archivoUrl = props.archivoUrl;
    this.archivo = archivo;
    this.fechaRegistro = props.fechaRegistro ?? new Date();
  }

  static create(props: DepositoProps): Deposito {
    const archivo = ArchivoComprobante.create(
      props.archivoNombre,
      props.archivoMime,
      props.archivoTamanio,
    );
    return new Deposito(props, archivo);
  }
}
