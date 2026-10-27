export class ArchivoAccesoError extends Error {
  constructor(public readonly motivo: 'ENLACE_INVALIDO' | 'SIN_SESION' | 'PROHIBIDO' | 'NO_ENCONTRADO') {
    const mensajes = { ENLACE_INVALIDO: 'No autorizado',
      SIN_SESION: 'Sesión inválida', PROHIBIDO: 'No autorizado', NO_ENCONTRADO: 'Archivo no encontrado' };
    super(mensajes[motivo]);
    this.name = 'ArchivoAccesoError';
  }
}
