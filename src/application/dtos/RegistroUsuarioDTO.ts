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
  idCargo: number;
  idTipoUsuario: number;
  idInstitucion: number;
  idEntidadFederativa: number;
  deposito: DepositoDTO;
  archivo: ArchivoDTO;
}
