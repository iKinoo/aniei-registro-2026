import type { ResultadoRegistro } from './ResultadoRegistro';
import type { ResultadoRegistroGrupo } from './ResultadoRegistroGrupo';

export interface ResultadoInscripcion {
  responsable: ResultadoRegistro;
  grupo?: ResultadoRegistroGrupo;
}
