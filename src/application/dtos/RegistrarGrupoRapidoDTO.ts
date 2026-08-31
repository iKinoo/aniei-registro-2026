import { ArchivoDTO, DepositoDTO } from './RegistroUsuarioDTO';

export interface MiembroRapidoInputDTO {
  nombre: string;
  apellido: string;
  correo: string;
}

export interface RegistrarGrupoRapidoDTO {
  responsableId: string;
  miembros: MiembroRapidoInputDTO[];
  deposito: DepositoDTO;
  archivo: ArchivoDTO;
}
