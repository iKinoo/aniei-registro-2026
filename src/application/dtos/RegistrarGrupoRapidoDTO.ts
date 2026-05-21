import { ArchivoDTO, DepositoDTO } from './RegistroUsuarioDTO';

export interface MiembroRapidoInputDTO {
  nombre: string;
  apellido: string;
}

export interface RegistrarGrupoRapidoDTO {
  responsableId: string; // ID of the logged in user creating the group
  miembros: MiembroRapidoInputDTO[];
  deposito: DepositoDTO;
  archivo: ArchivoDTO; // The single deposit slip
}
