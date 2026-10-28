import type { ArchivoDTO } from './RegistroUsuarioDTO';

export interface RegistrarPagoRegistroDTO {
  bancoSucursal?: string | null;
  ciudad?: string | null;
  referencia: string;
  fechaDeposito: Date;
  notas?: string | null;
  archivo: ArchivoDTO;
}
