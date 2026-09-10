import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { IPdfService, ConstanciaData, ConstanciaPonenteData, HojaRegistroGrupoData, ConstanciaManualData, ListaParticipantesPdfData, ReporteInstitucionesPdfData } from '@/application/ports/IPdfService';
import { GenericConstanciaTemplate } from './templates/GenericConstanciaTemplate';
import { HojaRegistroGrupoTemplate } from './templates/HojaRegistroGrupoTemplate';
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

  async generarHojaRegistroGrupo(datos: HojaRegistroGrupoData): Promise<Buffer> {
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aniei-registro-2026.vercel.app/'}/grupo-completar/${datos.token}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);

    const element = React.createElement(HojaRegistroGrupoTemplate, { ...datos, qrDataUrl });
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
