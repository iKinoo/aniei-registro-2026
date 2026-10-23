export interface MiembroGrupoForAdminDTO {
  folioRegistro: string;
  nombreCompleto: string;
  correo: string;
  carrera: string | null;
}

export interface GrupoForAdminDTO {
  id: number;
  fechaRegistro: Date;
  responsable: {
    folioRegistro: string;
    nombreCompleto: string;
    correo: string;
  };
  miembros: MiembroGrupoForAdminDTO[];
  deposito: {
    monto: number;
    fecha: Date;
    referencia: string;
    archivoNombre: string;
    archivoRuta: string;
  } | null;
}
