import { ArchivoComprobante } from '../value-objects/ArchivoComprobante';
import { Monto } from '../value-objects/Monto';

export interface ComprobantePagoProps {
  idComprobante?: number | null;
  idUsuario: number;
  archivoUrl: string;
  archivoNombre: string;
  archivoMime: string;
  archivoTamanio: number;
  monto?: Monto | null;
  esGrupal?: boolean;
  fechaRegistro?: Date;
}

export class ComprobantePago {
  readonly idComprobante: number | null;
  readonly idUsuario: number;
  readonly archivoUrl: string;
  readonly archivo: ArchivoComprobante;
  readonly monto: Monto | null;
  readonly esGrupal: boolean;
  readonly fechaRegistro: Date;

  private constructor(props: ComprobantePagoProps, archivo: ArchivoComprobante) {
    this.idComprobante = props.idComprobante ?? null;
    this.idUsuario = props.idUsuario;
    this.archivoUrl = props.archivoUrl;
    this.archivo = archivo;
    this.monto = props.monto ?? null;
    this.esGrupal = props.esGrupal ?? false;
    this.fechaRegistro = props.fechaRegistro ?? new Date();
  }

  static create(props: ComprobantePagoProps): ComprobantePago {
    const archivo = ArchivoComprobante.create(
      props.archivoNombre,
      props.archivoMime,
      props.archivoTamanio,
    );
    return new ComprobantePago(props, archivo);
  }
}
