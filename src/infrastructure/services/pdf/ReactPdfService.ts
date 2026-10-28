import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { PDFDocument } from 'pdf-lib';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IPdfService, ListaParticipantesPdfData, ReporteInstitucionesPdfData, ReporteTalleristasPdfData } from '@/application/ports/IPdfService';
import { ContenidoConstancia } from '@/application/dtos/ConstanciaDTO';
import {
  ConstanciaEventoTemplate,
  CONSTANCIA_PAGE_HEIGHT,
  CONSTANCIA_PAGE_WIDTH,
} from './templates/ConstanciaEventoTemplate';
import { construirListaAsistencia } from './ListaAsistencia';
import { ReporteInstitucionesTemplate } from './templates/ReporteInstitucionesTemplate';
import { ReporteTalleristasTemplate } from './templates/ReporteTalleristasTemplate';

let _plantillaCache: Buffer | null = null;

function getPlantillaConstancia(): Buffer {
  if (_plantillaCache) return _plantillaCache;
  const plantillaPath = join(process.cwd(), 'public', 'congreso_Reconocimiento2026_oficial_plantilla.pdf');
  _plantillaCache = readFileSync(plantillaPath);
  return _plantillaCache;
}

export class ReactPdfService implements IPdfService {
  async generarConstancia(datos: ContenidoConstancia): Promise<Buffer> {
    const element = React.createElement(ConstanciaEventoTemplate, { contenido: datos });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const capaTexto = await renderToBuffer(element as any);

    const doc = await PDFDocument.create();
    const plantilla = await PDFDocument.load(getPlantillaConstancia());
    const [paginaFondo] = await doc.copyPages(plantilla, [0]);
    const page = doc.addPage(paginaFondo);
    const [capa] = await doc.embedPdf(Buffer.from(capaTexto));
    page.drawPage(capa, { x: 0, y: 0, width: CONSTANCIA_PAGE_WIDTH, height: CONSTANCIA_PAGE_HEIGHT });
    return Buffer.from(await doc.save());
  }

  async generarListaParticipantes(datos: ListaParticipantesPdfData): Promise<Buffer> {
    return Buffer.from(await construirListaAsistencia(datos));
  }

  async generarReporteInstituciones(datos: ReporteInstitucionesPdfData): Promise<Buffer> {
    const element = React.createElement(ReporteInstitucionesTemplate, { data: datos });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarReporteTalleristas(datos: ReporteTalleristasPdfData): Promise<Buffer> {
    const element = React.createElement(ReporteTalleristasTemplate, { data: datos });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }
}
