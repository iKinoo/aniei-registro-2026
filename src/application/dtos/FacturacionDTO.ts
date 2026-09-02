import { ArchivoDTO } from './RegistroUsuarioDTO';

export interface FacturacionDTO {
  folioRegistro: string;
  razonSocial: string;
  rfc: string;
  calle?: string | null;
  numExterior?: string | null;
  numInterior?: string | null;
  colonia?: string | null;
  municipio?: string | null;
  codigoPostal?: string | null;
  idEntidadFederativaRfc?: number | null;
  archivoConstancia?: ArchivoDTO;
}
