import { ArchivoComprobante } from '../value-objects/ArchivoComprobante';
import { Monto } from '../value-objects/Monto';

export interface DepositoProps {
  idDeposito?: number | null;
  folioRegistro: string;
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
  proposito?: string;
  notas?: string | null;
}

export class Deposito {
  readonly idDeposito: number | null;
  readonly folioRegistro: string;
  readonly bancoSucursal: string | null;
  readonly ciudad: string | null;
  readonly referencia: string;
  readonly monto: Monto;
  readonly fechaDeposito: Date;
  readonly archivoUrl: string;
  readonly archivo: ArchivoComprobante;
  readonly fechaRegistro: Date;
  readonly proposito: string;
  readonly notas: string | null;

  private constructor(props: DepositoProps, archivo: ArchivoComprobante) {
    this.idDeposito = props.idDeposito ?? null;
    this.folioRegistro = props.folioRegistro;
    this.bancoSucursal = props.bancoSucursal ?? null;
    this.ciudad = props.ciudad ?? null;
    this.referencia = props.referencia;
    this.monto = props.monto;
    this.fechaDeposito = props.fechaDeposito;
    this.archivoUrl = props.archivoUrl;
    this.archivo = archivo;
    this.fechaRegistro = props.fechaRegistro ?? new Date();
    this.proposito = props.proposito ?? 'EVENTO_PRINCIPAL';
    this.notas = props.notas ?? null;
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
