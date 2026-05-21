import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import QRCode from 'qrcode';
import { IPdfService, ConstanciaData, ConstanciaPonenteData, HojaRegistroGrupoData } from '@/application/ports/IPdfService';
import { buildConstanciaHtml } from './templates/constanciaBase.html';
import { buildHojaRegistroGrupoHtml } from './templates/hojaRegistroGrupo.html';

async function getBrowser() {
  const customPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  const isVercel = process.env.VERCEL === '1';

  if (customPath) {
    return puppeteer.launch({
      executablePath: customPath,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
  }

  if (isVercel) {
    return puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    });
  }

  // Intento con @sparticuz/chromium en local (útil si se instaló el binario localmente)
  try {
    const execPath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      executablePath: execPath,
      headless: true,
    });
  } catch {
    // Fallback: buscar Chromium/Google Chrome en el sistema
    const possiblePaths = [
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    ];

    for (const path of possiblePaths) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const fs = require('fs');
        if (fs.existsSync(path)) {
          return puppeteer.launch({
            executablePath: path,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
          });
        }
      } catch {
        // ignore
      }
    }

    throw new Error(
      'No se encontró un ejecutable de Chromium. ' +
      'Por favor define la variable de entorno PUPPETEER_EXECUTABLE_PATH ' +
      'con la ruta a tu instalación de Chrome/Chromium. '
    );
  }
}

async function htmlToPdfBuffer(
  html: string,
  options: { landscape?: boolean; format?: string } = {}
): Promise<Buffer> {
  const browser = await getBrowser();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({
      format: (options.format as 'A4' | 'Letter' | undefined) ?? 'A4',
      landscape: options.landscape ?? false,
      printBackground: true,
      preferCSSPageSize: true,
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

export class PuppeteerPdfService implements IPdfService {
  async generarConstanciaInscripcion(datos: ConstanciaData): Promise<Buffer> {
    const html = buildConstanciaHtml({
      documentTitle: 'RECONOCIMIENTO',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description:
        `Se hace constar que ${datos.nombre} ${datos.apellido} se encuentra ` +
        `debidamente inscrito(a) al Congreso Nacional ANIEI 2026, con el folio de ` +
        `registro ${datos.folio}.\n` +
        `Institución: ${datos.institucion}. Título: ${datos.tipoUsuario}.`,
      location: `Fecha de registro: ${datos.fecha}`,
    });
    return htmlToPdfBuffer(html, { landscape: true, format: 'A4' });
  }

  async generarConstanciaPonente(datos: ConstanciaPonenteData): Promise<Buffer> {
    const html = buildConstanciaHtml({
      documentTitle: 'Constancia de Participación',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description:
        `El Comité Organizador otorga la presente constancia a ${datos.nombre} ${datos.apellido} ` +
        `por su destacada participación en la impartición de la ${datos.tipoActividad.toLowerCase()} titulada:\n` +
        `"${datos.nombreActividad}"`,
      location: `Emitida el ${datos.fecha}`,
    });
    return htmlToPdfBuffer(html, { landscape: true, format: 'A4' });
  }

  async generarConstanciaParticipante(datos: ConstanciaPonenteData): Promise<Buffer> {
    const html = buildConstanciaHtml({
      documentTitle: 'RECONOCIMIENTO',
      recipientName: `${datos.nombre} ${datos.apellido}`,
      description:
        `El Comité Organizador otorga la presente constancia a ${datos.nombre} ${datos.apellido} ` +
        `por su participación en la ${datos.tipoActividad.toLowerCase()} titulada:\n` +
        `"${datos.nombreActividad}"`,
      location: `Emitida el ${datos.fecha}`,
    });
    return htmlToPdfBuffer(html, { landscape: true, format: 'A4' });
  }

  async generarHojaRegistroGrupo(datos: HojaRegistroGrupoData): Promise<Buffer> {
    const qrUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aniei-registro-2026.vercel.app/'}/grupo-completar/${datos.token}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl);

    const html = buildHojaRegistroGrupoHtml({
      ...datos,
      qrDataUrl,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'https://aniei-registro-2026.vercel.app/',
    });
    return htmlToPdfBuffer(html, { landscape: false, format: 'A4' });
  }
}
