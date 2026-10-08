import type { ContenidoConstancia, LineaConstancia, SegmentoConstancia } from '@/application/dtos/ConstanciaDTO';
import type { ConstanciaManualDTO } from '@/application/dtos/ConstanciaManualDTO';

const NOMBRE_EVENTO = 'XXXIX Congreso Nacional y XXV Congreso Internacional de Informática y Computación, ANIEI 2026';
const SEDE_EVENTO = 'realizado en Puerto Vallarta, Jalisco, del 28 al 30 de octubre de 2026';
const MARCO_EVENTO = `en el marco del ${NOMBRE_EVENTO}, ${SEDE_EVENTO}.`;

function t(texto: string): SegmentoConstancia {
  return { texto };
}

function b(texto: string): SegmentoConstancia {
  return { texto, negrita: true };
}

function centrada(...segmentos: SegmentoConstancia[]): LineaConstancia {
  return { segmentos, alineacion: 'centro' };
}

function justificada(...segmentos: SegmentoConstancia[]): LineaConstancia {
  return { segmentos, alineacion: 'justificada' };
}

const ARTICULO_POR_CLAVE: Record<string, string> = {
  TALLER: 'el',
  SEMINARIO: 'el',
  CONF_MAGISTRAL: 'la',
  CONF_SIMULTANEA: 'la',
  VIDEOCONF: 'la',
  MESA_TRABAJO: 'la',
  CONCURSO: 'el',
  PONENCIA: 'la',
  TESIS: 'la',
  CONF_INVITADA: 'la',
  HACKATON: 'el',
  CERTIFICACION: 'la',
  INAUGURACION: 'la',
};

export function unirNombres(nombres: string[]): string {
  const limpios = nombres.map((n) => n.trim()).filter((n) => n.length > 0);
  if (limpios.length <= 1) return limpios[0] ?? '';
  return `${limpios.slice(0, -1).join(', ')} y ${limpios[limpios.length - 1]}`;
}

export function contenidoParticipacionGeneral(destinatario: string): ContenidoConstancia {
  return {
    destinatario,
    cuerpo: [justificada(t(`por su valiosa participación en el ${NOMBRE_EVENTO}, ${SEDE_EVENTO}.`))],
  };
}

export function contenidoPorTipoActividad(args: {
  destinatario: string;
  claveTipo?: string | null;
  descripcionTipo: string;
  nombreActividad: string;
  esPonente: boolean;
}): ContenidoConstancia {
  const clave = (args.claveTipo ?? '').toUpperCase();
  const articulo = ARTICULO_POR_CLAVE[clave] ?? 'la';
  let pre: string;
  if (args.esPonente) {
    if (clave === 'TALLER') pre = 'por haber impartido el Taller';
    else if (clave === 'CONF_MAGISTRAL') pre = 'por haber impartido la Conferencia Magistral';
    else if (clave === 'PONENCIA') pre = 'por haber participado como expositor de la ponencia';
    else pre = `por haber impartido ${articulo} ${args.descripcionTipo}`;
  } else if (clave === 'TALLER') {
    pre = 'por haber participado en el Taller';
  } else {
    pre = `por haber participado en ${articulo} ${args.descripcionTipo}`;
  }
  return {
    destinatario: args.destinatario,
    cuerpo: [centrada(t(pre)), centrada(b(args.nombreActividad)), justificada(t(MARCO_EVENTO))],
  };
}

export function contenidoParaManual(dto: ConstanciaManualDTO, destinatario: string): ContenidoConstancia {
  const titulo = centrada(b((dto.nombreActividad ?? dto.nombrePonencia ?? dto.nombreTesis ?? dto.nombreEquipo ?? '').trim()));
  const lugar = dto.lugar?.trim();

  switch (dto.tipoConstancia) {
    case 'PARTICIPANTE':
      return contenidoParticipacionGeneral(destinatario);

    case 'TALLER':
      return {
        destinatario,
        cuerpo: [
          centrada(t(dto.rol === 'IMPARTE' ? 'por haber impartido el Taller' : 'por haber participado en el Taller')),
          titulo,
          justificada(t(MARCO_EVENTO)),
        ],
      };

    case 'CONFERENCIA_MAGISTRAL':
      return {
        destinatario,
        cuerpo: [centrada(t('por haber impartido la Conferencia Magistral')), titulo, justificada(t(MARCO_EVENTO))],
      };

    case 'PONENTE':
      return {
        destinatario,
        cuerpo: [
          centrada(t(dto.rol === 'AUTORES' ? 'por haber participado como autores del artículo' : 'por haber participado como expositor de la ponencia')),
          titulo,
          justificada(t(MARCO_EVENTO)),
        ],
      };

    case 'TESIS':
      return {
        destinatario,
        cuerpo: [
          centrada(
            t('por haber obtenido el '), b(lugar ?? 'lugar obtenido'), t(' en el Certamen Nacional de Tesis, con el trabajo titulado:'),
          ),
          centrada(b((dto.nombreTesis ?? '').trim())),
          justificada(t(MARCO_EVENTO)),
        ],
      };

    case 'HACKATHON':
      return {
        destinatario,
        cuerpo: [
          centrada(t('por haber obtenido el '), b(lugar ?? 'lugar obtenido'), t(' en el Concurso Nacional de Hackatón, con el proyecto')),
          centrada(b((dto.nombreEquipo ?? '').trim())),
          justificada(t(MARCO_EVENTO)),
        ],
      };

    case 'CONCURSO_PROGRAMACION':
      return {
        destinatario,
        cuerpo: [
          justificada(
            t('por haber obtenido el '),
            b(lugar ?? 'lugar obtenido'),
            t(` en el Concurso Nacional de programación, ${MARCO_EVENTO}`),
          ),
        ],
      };

    default:
      return contenidoParticipacionGeneral(destinatario);
  }
}

export function textoPlanoContenido(contenido: ContenidoConstancia): string {
  const lineas = contenido.cuerpo
    .map((linea) => linea.segmentos.map((s) => (s.negrita ? `"${s.texto}"` : s.texto)).join(''))
    .join(' ');
  return `${contenido.destinatario}: ${lineas}`.replace(/\s+/g, ' ').trim();
}
