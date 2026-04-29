export interface UsuarioForAdminDTO {
  folioRegistro: string;
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
