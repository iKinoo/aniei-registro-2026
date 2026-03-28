export interface FacturacionProps {
  idFacturacion?: number | null;
  idUsuario: number;
  razonSocial: string;
  rfc: string;
  calle?: string | null;
  numExterior?: string | null;
  numInterior?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  codigoPostal?: string | null;
  idEntidadFederativaRfc?: number | null;
}

export class Facturacion {
  readonly idFacturacion: number | null;
  readonly idUsuario: number;
  readonly razonSocial: string;
  readonly rfc: string;
  readonly calle: string | null;
  readonly numExterior: string | null;
  readonly numInterior: string | null;
  readonly colonia: string | null;
  readonly municipio: string | null;
  readonly codigoPostal: string | null;
  readonly idEntidadFederativaRfc: number | null;

  private constructor(props: FacturacionProps) {
    this.idFacturacion = props.idFacturacion ?? null;
    this.idUsuario = props.idUsuario;
    this.razonSocial = props.razonSocial;
    this.rfc = props.rfc;
    this.calle = props.calle ?? null;
    this.numExterior = props.numExterior ?? null;
    this.numInterior = props.numInterior ?? null;
    this.colonia = props.colonia ?? null;
    this.municipio = props.municipio ?? null;
    this.codigoPostal = props.codigoPostal ?? null;
    this.idEntidadFederativaRfc = props.idEntidadFederativaRfc ?? null;
  }

  static create(props: FacturacionProps): Facturacion {
    if (!props.razonSocial.trim()) {
      throw new Error('La razón social es requerida');
    }
    if (!props.rfc.trim()) {
      throw new Error('El RFC es requerido');
    }
    const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
    if (!rfcRegex.test(props.rfc.trim().toUpperCase())) {
      throw new Error('Formato de RFC inválido');
    }
    return new Facturacion({
      ...props,
      razonSocial: props.razonSocial.trim(),
      rfc: props.rfc.trim().toUpperCase(),
    });
  }
}
