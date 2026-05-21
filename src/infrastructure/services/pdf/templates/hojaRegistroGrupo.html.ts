export interface HojaRegistroGrupoHtmlProps {
  token: string;
  nombres: string[];
  responsableNombre: string;
  qrDataUrl: string;
  baseUrl: string;
}

export function buildHojaRegistroGrupoHtml(props: HojaRegistroGrupoHtmlProps): string {
  const { nombres, responsableNombre, qrDataUrl, baseUrl, token } = props;

  const membersHtml = nombres
    .map(
      (nombre, index) => `
      <div class="member-row">
        <span class="member-number">${index + 1}.</span>
        <span class="member-name">${escapeHtml(nombre)}</span>
      </div>
    `
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Registro Grupal Rápido</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      width: 210mm;
      height: 297mm;
      font-family: 'DejaVu Sans', 'Liberation Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #E4E4E4;
      padding: 40px;
    }

    .section {
      background: #FFF;
      border-radius: 5px;
      padding: 30px;
      min-height: 100%;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
    }

    .title {
      font-size: 24px;
      font-weight: 700;
      color: #1a365d;
    }

    .subtitle {
      font-size: 14px;
      color: #4a5568;
      margin-top: 5px;
    }

    .responsable-box {
      background: #f0f4f8;
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 20px;
    }

    .responsable-label {
      font-size: 10px;
      color: #718096;
    }

    .responsable-name {
      font-size: 14px;
      font-weight: 700;
      color: #1a365d;
    }

    .qr-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 30px;
      padding: 20px;
      background: #f8fafc;
      border-radius: 8px;
    }

    .qr-title {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 10px;
      color: #1a365d;
    }

    .qr-subtitle {
      font-size: 10px;
      color: #718096;
      margin-bottom: 15px;
      text-align: center;
      max-width: 400px;
    }

    .qr-image {
      width: 150px;
      height: 150px;
    }

    .link-text {
      font-size: 10px;
      color: #3182ce;
      margin-top: 10px;
      word-break: break-all;
    }

    .member-list-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
      margin-top: 30px;
      color: #1a365d;
    }

    .member-list {
      margin-top: 10px;
    }

    .member-row {
      display: flex;
      border-bottom: 1px solid #e2e8f0;
      padding: 8px 0;
    }

    .member-number {
      font-size: 12px;
      width: 30px;
      color: #718096;
    }

    .member-name {
      font-size: 12px;
      color: #1a365d;
    }
  </style>
</head>
<body>
  <div class="section">
    <div class="header">
      <div>
        <div class="title">Registro Grupal Rápido</div>
        <div class="subtitle">Congreso ANIEI 2026</div>
      </div>
    </div>

    <div class="responsable-box">
      <div class="responsable-label">Registrado por</div>
      <div class="responsable-name">${escapeHtml(responsableNombre)}</div>
    </div>

    <div class="qr-container">
      <div class="qr-title">Termina tu Registro</div>
      <div class="qr-subtitle">
        Escanea este código QR con tu celular. Te mostraremos esta lista de participantes.
        Selecciona tu nombre y completa tu registro para activar tu cuenta y acceder al portal.
      </div>
      <img src="${escapeHtml(qrDataUrl)}" class="qr-image" alt="QR de registro" />
      <div class="link-text">${escapeHtml(`${baseUrl}/grupo-completar/${token}`)}</div>
    </div>

    <div class="member-list-title">Lista de Participantes (${nombres.length})</div>
    <div class="member-list">
      ${membersHtml}
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
