export interface UsuarioAdminDTO {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  telefono: string | null;
  institucion: string;
  tipoUsuario: string;
  fechaRegistro: Date;
  deposito: {
    monto: number;
    fecha: Date;
    referencia: string;
    archivoUrl: string;
  } | null;
}
