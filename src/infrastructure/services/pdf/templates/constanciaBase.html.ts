export interface ConstanciaHtmlProps {
  documentTitle: string;
  recipientName: string;
  description: string;
  location: string;
  signers?: { name: string; cargo: string }[];
}

const BLUE_DARK = "#1a3a5c";
const BLUE_MID = "#1e6fa8";
const BLUE_LIGHT = "#e8f1f8";
const GRAY_TEXT = "#4a4a4a";

export function buildConstanciaHtml(props: ConstanciaHtmlProps): string {
  const {
    documentTitle = "RECONOCIMIENTO",
    recipientName = "Fulano de tal",
    description = "",
    location = "Cabo San Lucas, BCS. 10 al 12 de Junio del 2026",
    signers = [
      { name: "Ing. Juan Gutierrez", cargo: "Cargo" },
      { name: "Ing. Juan Gutierrez", cargo: "Cargo" },
    ],
  } = props;

  const signersHtml = signers
    .map(
      (s) => `
      <div class="signature-block">
        <div class="signature-line"></div>
        <div class="signature-name">${escapeHtml(s.name)}</div>
        <div class="signature-cargo">${escapeHtml(s.cargo)}</div>
      </div>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 297mm;
      height: 210mm;
      font-family: 'DejaVu Sans', 'Liberation Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #fff;
      position: relative;
      overflow: hidden;
      color: ${BLUE_DARK};
    }

    /* ── Decoraciones ───────────────────────────────────────── */
    .deco-tl {
      position: absolute;
      top: 0;
      left: 0;
      width: 120px;
      height: 110px;
      z-index: 0;
    }

    .deco-br {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 130px;
      height: 140px;
      z-index: 0;
    }

    /* ── Contenido ────────────────────────────────────────── */
    .content {
      position: relative;
      z-index: 1;
      width: 100%;
      height: 100%;
      padding: 30px 60px 40px;
      display: flex;
      flex-direction: column;
    }

    /* ── Header ───────────────────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
    }

    .header-left {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .xxxv {
      font-size: 36px;
      font-weight: 700;
      color: ${BLUE_DARK};
      line-height: 1;
    }

    .header-divider {
      width: 2px;
      height: 56px;
      background: ${BLUE_MID};
      flex-shrink: 0;
    }

    .header-text {
      max-width: 340px;
    }

    .header-title {
      font-size: 11px;
      color: ${BLUE_DARK};
      line-height: 1.4;
    }

    .header-title b {
      font-weight: 700;
    }

    .header-logos {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-box {
      width: 65px;
      height: 42px;
      border: 1px solid #cccccc;
      border-radius: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      font-size: 6px;
      color: #888;
      text-align: center;
      line-height: 1.2;
    }

    /* ── Cuerpo ───────────────────────────────────────────── */
    .body {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 10px;
    }

    .org-line1 {
      font-size: 9px;
      color: ${BLUE_DARK};
      text-align: center;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }

    .org-line2 {
      font-size: 9px;
      font-weight: 700;
      color: ${BLUE_DARK};
      text-align: center;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }

    .org-line2 span {
      font-weight: 400;
    }

    .otorga-text {
      font-size: 9px;
      color: ${GRAY_TEXT};
      text-align: center;
      letter-spacing: 1.5px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .reconocimiento-text {
      font-size: 48px;
      line-height: 1;
      color: ${BLUE_DARK};
      text-align: center;
      margin-bottom: 18px;
      font-weight: 400;
    }

    .name-box {
      background: ${BLUE_LIGHT};
      border-radius: 6px;
      padding: 14px 50px;
      margin-bottom: 20px;
      min-width: 340px;
      text-align: center;
    }

    .name-text {
      font-size: 32px;
      color: ${BLUE_DARK};
      text-align: center;
      line-height: 1.2;
    }

    .description-text {
      font-size: 11px;
      color: ${GRAY_TEXT};
      text-align: center;
      line-height: 1.6;
      margin-bottom: 10px;
      max-width: 560px;
      white-space: pre-line;
    }

    /* ── Footer ───────────────────────────────────────────── */
    .footer {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: auto;
      padding-bottom: 10px;
    }

    .location-text {
      font-size: 10px;
      color: ${GRAY_TEXT};
      text-align: center;
      margin-bottom: 24px;
    }

    .signatures-row {
      display: flex;
      justify-content: center;
      gap: 80px;
    }

    .signature-block {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 160px;
    }

    .signature-line {
      width: 140px;
      border-bottom: 1.2px solid ${BLUE_DARK};
      margin-bottom: 4px;
    }

    .signature-name {
      font-size: 9px;
      color: ${BLUE_DARK};
      text-align: center;
      font-weight: 700;
    }

    .signature-cargo {
      font-size: 9px;
      color: ${GRAY_TEXT};
      text-align: center;
    }
  </style>
</head>
<body>
  <!-- Decoración superior izquierda -->
  <svg class="deco-tl" viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
    <path d="M0,0 L90,0 L0,90 Z" fill="${BLUE_DARK}" />
    <path d="M20,0 L90,0 L20,60 Z" fill="${BLUE_MID}" opacity="0.7" />
    <line x1="10" y1="0" x2="0" y2="10" stroke="#ffffff" stroke-width="0.8" opacity="0.3" />
    <line x1="20" y1="0" x2="0" y2="20" stroke="#ffffff" stroke-width="0.8" opacity="0.3" />
    <line x1="30" y1="0" x2="0" y2="30" stroke="#ffffff" stroke-width="0.8" opacity="0.3" />
    <line x1="40" y1="0" x2="0" y2="40" stroke="#ffffff" stroke-width="0.8" opacity="0.3" />
  </svg>

  <!-- Decoración inferior derecha -->
  <svg class="deco-br" viewBox="0 0 130 140" xmlns="http://www.w3.org/2000/svg">
    <rect x="60" y="80" width="70" height="6" fill="${BLUE_DARK}" opacity="1" />
    <rect x="60" y="90" width="70" height="6" fill="${BLUE_DARK}" opacity="0.88" />
    <rect x="60" y="100" width="70" height="6" fill="${BLUE_DARK}" opacity="0.76" />
    <rect x="60" y="110" width="70" height="6" fill="${BLUE_DARK}" opacity="0.64" />
    <rect x="60" y="120" width="70" height="6" fill="${BLUE_DARK}" opacity="0.52" />
    <rect x="60" y="130" width="70" height="6" fill="${BLUE_DARK}" opacity="0.40" />
    <path d="M40,20 L90,70 L40,120" stroke="${BLUE_MID}" stroke-width="18" fill="none" stroke-linejoin="round" />
    <path d="M55,35 L90,70 L55,105" stroke="${BLUE_DARK}" stroke-width="14" fill="none" stroke-linejoin="round" />
  </svg>

  <div class="content">
    <div class="header">
      <div class="header-left">
        <div class="xxxv">XXXV</div>
        <div class="header-divider"></div>
        <div class="header-text">
          <div class="header-title">
            REUNIÓN <b>NACIONAL</b><br>
            DE DIRECTIVOS Y LIDEREZ ESTRATÉGICOS<br>
            Y ACADÉMICOS EN TECNOLOGÍAS DE<br>
            LA INFORMACIÓN – RDN ANIEI 2026
          </div>
        </div>
      </div>
      <div class="header-logos">
        <div class="logo-box">ANIEI</div>
        <div class="logo-box">LICEO<br>UNIV.</div>
      </div>
    </div>

    <div class="body">
      <div class="org-line1">LA ASOCIACIÓN NACIONAL DE INSTITUCIONES DE EDUCACIÓN</div>
      <div class="org-line2">EN TECNOLOGÍAS DE LA INFORMACIÓN <span>ANIEI</span></div>
      <div class="otorga-text">OTORGA EL PRESENTE</div>
      <div class="reconocimiento-text">${escapeHtml(documentTitle)}</div>

      <div class="name-box">
        <div class="name-text">A: ${escapeHtml(recipientName)}</div>
      </div>

      <div class="description-text">${escapeHtml(description)}</div>
    </div>

    <div class="footer">
      <div class="location-text">${escapeHtml(location)}</div>
      <div class="signatures-row">
        ${signersHtml}
      </div>
    </div>
  </div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
