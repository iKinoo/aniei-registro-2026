export interface UsuarioForAdminDTO {
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
    archivo: {
      ruta: string;
    };
  } | null;
}
