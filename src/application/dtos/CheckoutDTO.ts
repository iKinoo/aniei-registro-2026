import type { ArchivoDTO, DepositoDTO, FacturacionDTO } from './RegistroUsuarioDTO';

export interface CheckoutDTO {
  idsActividades: number[];
  deposito?: DepositoDTO;
  archivo?: ArchivoDTO;
  facturacion?: FacturacionDTO;
}

export interface ConfirmacionInscripcionResult {
  success: true;
  nombre: string;
  folio: string;
  correo: string;
  actividades: Array<{ nombre: string; fecha: string; costo: string | null }>;
  totalCosto: string | null;
}
