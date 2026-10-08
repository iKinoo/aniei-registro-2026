import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { IPdfService, ListaParticipantesPdfData, ReporteInstitucionesPdfData } from '@/application/ports/IPdfService';
import { ContenidoConstancia } from '@/application/dtos/ConstanciaDTO';
import { ConstanciaEventoTemplate } from './templates/ConstanciaEventoTemplate';
import { ListaParticipantesTemplate } from './templates/ListaParticipantesTemplate';
import { ReporteInstitucionesTemplate } from './templates/ReporteInstitucionesTemplate';

export class ReactPdfService implements IPdfService {
  async generarConstancia(datos: ContenidoConstancia): Promise<Buffer> {
    const element = React.createElement(ConstanciaEventoTemplate, { contenido: datos });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarListaParticipantes(datos: ListaParticipantesPdfData): Promise<Buffer> {
    const element = React.createElement(ListaParticipantesTemplate, { data: datos });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarReporteInstituciones(datos: ReporteInstitucionesPdfData): Promise<Buffer> {
    const element = React.createElement(ReporteInstitucionesTemplate, { data: datos });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }
}
