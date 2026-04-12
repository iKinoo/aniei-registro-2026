import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { IPdfService, ConstanciaData, ConstanciaPonenteData } from '@/application/ports/IPdfService';
import { ConstanciaTemplate } from './templates/ConstanciaTemplate';
import { ConstanciaPonenteTemplate } from './templates/ConstanciaPonenteTemplate';

export class ReactPdfService implements IPdfService {
  async generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer> {
    const element = React.createElement(ConstanciaTemplate, datos);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarConstanciaPonente(datos: ConstanciaPonenteData): Promise<Buffer> {
    const element = React.createElement(ConstanciaPonenteTemplate, datos);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }
}
