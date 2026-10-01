import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { IPdfService, ConstanciaData, ConstanciaPonenteData, ConstanciaManualData, ListaParticipantesPdfData, ReporteInstitucionesPdfData } from '@/application/ports/IPdfService';
import { GenericConstanciaTemplate } from './templates/GenericConstanciaTemplate';
import { ManualConstanciaTemplate } from './templates/ManualConstanciaTemplate';
import { ListaParticipantesTemplate } from './templates/ListaParticipantesTemplate';
import { ReporteInstitucionesTemplate } from './templates/ReporteInstitucionesTemplate';

export class ReactPdfService implements IPdfService {
  async generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer> {
    const element = React.createElement(GenericConstanciaTemplate, {
      documentTitle: 'RECONOCIMIENTO',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description: '',
      location: '',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarConstanciaPonente(datos: ConstanciaPonenteData): Promise<Buffer> {
    const element = React.createElement(GenericConstanciaTemplate, {
      documentTitle: 'Constancia de Participación',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description: '',
      location: '',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarConstanciaParticipante(datos: ConstanciaPonenteData): Promise<Buffer> {
    const element = React.createElement(GenericConstanciaTemplate, {
      documentTitle: 'RECONOCIMIENTO',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description: '',
      location: '',
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarConstanciaManual(datos: ConstanciaManualData): Promise<Buffer> {
    const element = React.createElement(ManualConstanciaTemplate, {
      tipoConstancia: datos.tipoConstancia,
      destinatarios: datos.destinatarios,
      descripcion: datos.descripcion,
      fecha: datos.fecha,
    });
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
