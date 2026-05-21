import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import QRCode from 'qrcode';
import { IPdfService, ConstanciaData, ConstanciaPonenteData, HojaRegistroGrupoData } from '@/application/ports/IPdfService';
import { GenericConstanciaTemplate } from './templates/GenericConstanciaTemplate';
import { HojaRegistroGrupoTemplate } from './templates/HojaRegistroGrupoTemplate';

export class ReactPdfService implements IPdfService {
  async generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer> {
    const element = React.createElement(GenericConstanciaTemplate, {
      documentTitle: 'RECONOCIMIENTO',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description:
        `Se hace constar que ${datos.nombre} ${datos.apellido} se encuentra ` +
        `debidamente inscrito(a) al Congreso Nacional ANIEI 2026, con el folio de ` +
        `registro ${datos.folio}.\n` +
        `Institución: ${datos.institucion}. Título: ${datos.tipoUsuario}.`,
      location: `Fecha de registro: ${datos.fecha}`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarConstanciaPonente(datos: ConstanciaPonenteData): Promise<Buffer> {
    const element = React.createElement(GenericConstanciaTemplate, {
      documentTitle: 'Constancia de Participación',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description:
        `El Comité Organizador otorga la presente constancia a ${datos.nombre} ${datos.apellido} ` +
        `por su destacada participación en la impartición de la ${datos.tipoActividad.toLowerCase()} titulada:\n` +
        `"${datos.nombreActividad}"`,
      location: `Emitida el ${datos.fecha}`,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    return Buffer.from(buffer);
  }

  async generarConstanciaParticipante(datos: ConstanciaPonenteData): Promise<Buffer> {
    const element = React.createElement(GenericConstanciaTemplate, {
      documentTitle: 'RECONOCIMIENTO',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description:
        `El Comité Organizador otorga la presente constancia a ${datos.nombre} ${datos.apellido} ` +
        `por su participación en la ${datos.tipoActividad.toLowerCase()} titulada:\n` +
        `"${datos.nombreActividad}"`,
      location: `Emitida el ${datos.fecha}`,
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
}
