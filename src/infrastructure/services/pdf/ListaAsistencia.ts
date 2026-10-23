import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import type { ListaParticipantesPdfData } from '@/application/ports/IPdfService';

const ANCHO = 595.28;
const ALTO = 841.89;
const MARGEN = 40;
const ANCHO_TABLA = ANCHO - MARGEN * 2;
const COL_NUM = 30;
const COL_FOLIO = 100;
const COL_ASIST = 95;
const COL_NOMBRE = ANCHO_TABLA - COL_NUM - COL_FOLIO - COL_ASIST;
const ALTO_CABECERA_TABLA = 20;
const ALTO_FILA = 24;
const TAM_CAJA = 15;
const LIMITE_INFERIOR = 70;

const NOMBRE_INSTITUCION = 'Asociación Nacional de Instituciones de Educación en Tecnologías de Información';

const AZUL_OSCURO = rgb(0.102, 0.227, 0.361);
const AZUL_CLARO = rgb(0.231, 0.51, 0.965);
const BLANCO = rgb(1, 1, 1);
const GRIS_CLARO = rgb(0.973, 0.98, 0.988);
const GRIS_BORDE = rgb(0.886, 0.91, 0.941);
const GRIS_TEXTO = rgb(0.392, 0.455, 0.545);
const COLOR_CELDA = rgb(0.2, 0.255, 0.333);

interface Fuentes {
  normal: PDFFont;
  bold: PDFFont;
  italica: PDFFont;
}

function envolverTexto(texto: string, fuente: PDFFont, tamano: number, anchoMax: number): string[] {
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of texto.split(/\s+/).filter(Boolean)) {
    const candidata = actual ? `${actual} ${palabra}` : palabra;
    if (!actual || fuente.widthOfTextAtSize(candidata, tamano) <= anchoMax) actual = candidata;
    else {
      lineas.push(actual);
      actual = palabra;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

function truncar(texto: string, fuente: PDFFont, tamano: number, anchoMax: number): string {
  if (fuente.widthOfTextAtSize(texto, tamano) <= anchoMax) return texto;
  let recortado = texto;
  while (recortado.length > 1 && fuente.widthOfTextAtSize(`${recortado}…`, tamano) > anchoMax) {
    recortado = recortado.slice(0, -1);
  }
  return `${recortado.trimEnd()}…`;
}

function centrado(pagina: PDFPage, texto: string, fuente: PDFFont, y: number, tamano: number, color: ReturnType<typeof rgb>) {
  pagina.drawText(texto, {
    x: ANCHO / 2 - fuente.widthOfTextAtSize(texto, tamano) / 2,
    y,
    size: tamano,
    font: fuente,
    color,
  });
}

function dibujarEncabezado(pagina: PDFPage, fuentes: Fuentes): number {
  const { normal, bold } = fuentes;
  let cursor = ALTO - MARGEN - 12;

  for (const linea of envolverTexto(NOMBRE_INSTITUCION, bold, 10.5, ANCHO_TABLA)) {
    centrado(pagina, linea, bold, cursor, 10.5, AZUL_OSCURO);
    cursor -= 13;
  }

  pagina.drawRectangle({ x: MARGEN, y: cursor - 4, width: ANCHO_TABLA, height: 2.5, color: AZUL_CLARO });
  cursor -= 32;

  centrado(pagina, 'Lista de Asistencia', bold, cursor, 20, AZUL_OSCURO);
  cursor -= 22;

  centrado(pagina, 'Congreso ANIEI 2026', normal, cursor, 10, GRIS_TEXTO);
  cursor -= 24;

  return cursor;
}

function dibujarCabeceraTabla(pagina: PDFPage, arriba: number, fuentes: Fuentes): number {
  const { bold } = fuentes;
  const izquierda = MARGEN;
  pagina.drawRectangle({ x: izquierda, y: arriba - ALTO_CABECERA_TABLA, width: ANCHO_TABLA, height: ALTO_CABECERA_TABLA, color: AZUL_OSCURO });
  const base = arriba - 14;
  pagina.drawText('#', { x: izquierda + (COL_NUM - bold.widthOfTextAtSize('#', 9.5)) / 2, y: base, size: 9.5, font: bold, color: BLANCO });
  pagina.drawText('Folio', { x: izquierda + COL_NUM + 8, y: base, size: 9.5, font: bold, color: BLANCO });
  pagina.drawText('Nombre', { x: izquierda + COL_NUM + COL_FOLIO + 8, y: base, size: 9.5, font: bold, color: BLANCO });
  const etiquetaAsistencia = 'Asistencia';
  pagina.drawText(etiquetaAsistencia, {
    x: izquierda + COL_NUM + COL_FOLIO + COL_NOMBRE + (COL_ASIST - bold.widthOfTextAtSize(etiquetaAsistencia, 9.5)) / 2,
    y: base,
    size: 9.5,
    font: bold,
    color: BLANCO,
  });
  return arriba - ALTO_CABECERA_TABLA;
}

function dibujarPie(pagina: PDFPage, numeroPagina: number, totalPaginas: number, fechaGeneracion: string, fuentes: Fuentes) {
  const { normal } = fuentes;
  pagina.drawLine({
    start: { x: MARGEN, y: 52 },
    end: { x: ANCHO - MARGEN, y: 52 },
    thickness: 0.5,
    color: GRIS_BORDE,
  });
  centrado(pagina, `Congreso ANIEI 2026 · Documento generado el ${fechaGeneracion}`, normal, 40, 8, GRIS_TEXTO);
  const etiqueta = `Página ${numeroPagina} de ${totalPaginas}`;
  pagina.drawText(etiqueta, { x: ANCHO - MARGEN - normal.widthOfTextAtSize(etiqueta, 8), y: 40, size: 8, font: normal, color: GRIS_TEXTO });
}

export async function construirListaAsistencia(datos: ListaParticipantesPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`Lista de Asistencia — ${datos.nombreActividad}`);
  doc.setAuthor(NOMBRE_INSTITUCION);
  doc.setProducer('Sistema de Registro ANIEI 2026');

  const fuentes: Fuentes = {
    normal: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    italica: await doc.embedFont(StandardFonts.HelveticaOblique),
  };
  const form = doc.getForm();
  const fechaGeneracion = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  let pagina = doc.addPage([ANCHO, ALTO]);
  let arriba = dibujarEncabezado(pagina, fuentes);

  arriba -= 6;
  for (const linea of envolverTexto(datos.nombreActividad, fuentes.bold, 13, ANCHO_TABLA - 60)) {
    centrado(pagina, linea, fuentes.bold, arriba, 13, AZUL_OSCURO);
    arriba -= 16;
  }
  const meta = `${datos.tipoActividad} · ${datos.fecha} · ${datos.participantes.length} participante(s) inscrito(s)`;
  for (const linea of envolverTexto(meta, fuentes.normal, 9.5, ANCHO_TABLA - 60)) {
    centrado(pagina, linea, fuentes.normal, arriba, 9.5, GRIS_TEXTO);
    arriba -= 12;
  }
  centrado(
    pagina,
    'Marque la casilla de la columna «Asistencia» para registrar la presencia de cada participante.',
    fuentes.italica,
    arriba - 6,
    9,
    GRIS_TEXTO,
  );
  arriba -= 26;

  arriba = dibujarCabeceraTabla(pagina, arriba, fuentes);

  if (datos.participantes.length === 0) {
    centrado(pagina, 'Sin participantes inscritos en esta actividad.', fuentes.italica, arriba - 16, 10, GRIS_TEXTO);
  }

  for (const [indice, participante] of datos.participantes.entries()) {
    if (arriba - ALTO_FILA < LIMITE_INFERIOR) {
      pagina = doc.addPage([ANCHO, ALTO]);
      arriba = ALTO - MARGEN;
      arriba = dibujarCabeceraTabla(pagina, arriba, fuentes);
    }

    if (indice % 2 === 1) {
      pagina.drawRectangle({ x: MARGEN, y: arriba - ALTO_FILA, width: ANCHO_TABLA, height: ALTO_FILA, color: GRIS_CLARO });
    }

    const base = arriba - ALTO_FILA / 2 - 3;
    const numero = String(participante.numero);
    pagina.drawText(numero, {
      x: MARGEN + (COL_NUM - fuentes.normal.widthOfTextAtSize(numero, 9)) / 2,
      y: base,
      size: 9,
      font: fuentes.normal,
      color: COLOR_CELDA,
    });
    pagina.drawText(truncar(participante.folio, fuentes.normal, 9, COL_FOLIO - 14), {
      x: MARGEN + COL_NUM + 8,
      y: base,
      size: 9,
      font: fuentes.normal,
      color: COLOR_CELDA,
    });
    pagina.drawText(truncar(participante.nombre, fuentes.normal, 9, COL_NOMBRE - 14), {
      x: MARGEN + COL_NUM + COL_FOLIO + 8,
      y: base,
      size: 9,
      font: fuentes.normal,
      color: COLOR_CELDA,
    });
    pagina.drawLine({
      start: { x: MARGEN, y: arriba - ALTO_FILA },
      end: { x: ANCHO - MARGEN, y: arriba - ALTO_FILA },
      thickness: 0.5,
      color: GRIS_BORDE,
    });

    const casilla = form.createCheckBox(`asistencia_${participante.folio}`);
    casilla.addToPage(pagina, {
      x: MARGEN + COL_NUM + COL_FOLIO + COL_NOMBRE + (COL_ASIST - TAM_CAJA) / 2,
      y: arriba - ALTO_FILA / 2 - TAM_CAJA / 2,
      width: TAM_CAJA,
      height: TAM_CAJA,
      backgroundColor: BLANCO,
      borderColor: GRIS_TEXTO,
      borderWidth: 1,
    });

    arriba -= ALTO_FILA;
  }

  const paginas = doc.getPages();
  paginas.forEach((p, i) => dibujarPie(p, i + 1, paginas.length, fechaGeneracion, fuentes));

  return doc.save();
}
