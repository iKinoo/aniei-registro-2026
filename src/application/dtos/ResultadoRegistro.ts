export interface ResultadoRegistro {
  success: boolean;
  folio: string;
  urlConstancia: string;
  correo: string;
  /** Contraseña en texto plano, solo para auto-login inmediato. No exponer al cliente. */
  passwordPlana: string;
}

