export class ArchivoAccesoError extends Error {
  constructor(public readonly motivo: 'ENLACE_INVALIDO' | 'ENLACE_EXPIRADO' | 'SIN_SESION' | 'PROHIBIDO' | 'NO_ENCONTRADO') {
    const mensajes = { ENLACE_INVALIDO: 'No autorizado', ENLACE_EXPIRADO: 'Enlace expirado',
      SIN_SESION: 'Sesión inválida', PROHIBIDO: 'No autorizado', NO_ENCONTRADO: 'Archivo no encontrado' };
    super(mensajes[motivo]);
    this.name = 'ArchivoAccesoError';
  }
}
