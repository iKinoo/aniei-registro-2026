import { Genero } from '@/core/enums/Genero';

export interface ArchivoDTO {
  nombre: string;
  mime: string;
  tamanio: number;
  buffer: Buffer;
}

export interface DepositoDTO {
  bancoSucursal?: string | null;
  ciudad?: string | null;
  referencia: string;
  monto: number;
  fechaDeposito: Date;
}

export interface FacturacionDTO {
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

export interface RegistroUsuarioDTO {
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string | null;
  lada?: string | null;
  extension?: string | null;
  genero: Genero;
  carrera?: string | null;
  dependencia?: string | null;
  idTitulo: number;
  idInstitucion: number;
  idEntidadFederativa: number;
  deposito: DepositoDTO;
  archivo: ArchivoDTO;
  facturacion?: FacturacionDTO | null;
  /** IDs de actividades a inscribir al usuario principal (opcional) */
  actividadesIds?: number[];
}
