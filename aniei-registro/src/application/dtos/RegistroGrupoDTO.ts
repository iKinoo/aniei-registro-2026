import { Genero } from '@/core/enums/Genero';
import { ArchivoDTO } from './RegistroUsuarioDTO';

export interface MiembroInputDTO {
  nombre: string;
  apellido: string;
  correo: string;
  genero: Genero;
  carrera?: string | null;
  idTipoUsuario: number;
}

export interface RegistroGrupoDTO {
  responsable: {
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
  };
  miembros: MiembroInputDTO[];
  archivo: ArchivoDTO;
}
