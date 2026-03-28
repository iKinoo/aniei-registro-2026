import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { IPdfService, ConstanciaData } from '@/application/ports/IPdfService';
import { ConstanciaTemplate } from './templates/ConstanciaTemplate';

export class ReactPdfService implements IPdfService {
  async generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer> {
    const element = React.createElement(ConstanciaTemplate, datos);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }
}
