export interface FacturacionDTO {
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
