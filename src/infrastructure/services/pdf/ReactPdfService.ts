import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { IPdfService, ConstanciaData, ConstanciaPonenteData, HojaRegistroGrupoData } from '@/application/ports/IPdfService';
import { ConstanciaTemplate } from './templates/ConstanciaTemplate';
import { ConstanciaPonenteTemplate } from './templates/ConstanciaPonenteTemplate';
import { ConstanciaParticipanteTemplate } from './templates/ConstanciaParticipanteTemplate';
import { HojaRegistroGrupoTemplate } from './templates/HojaRegistroGrupoTemplate';

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

  async generarConstanciaParticipante(datos: ConstanciaPonenteData): Promise<Buffer> {
    const element = React.createElement(ConstanciaParticipanteTemplate, datos);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarHojaRegistroGrupo(datos: HojaRegistroGrupoData): Promise<Buffer> {
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://registro.aniei.org'}/grupo-completar/${datos.token}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);
    
    const element = React.createElement(HojaRegistroGrupoTemplate, { ...datos, qrDataUrl });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }
}
