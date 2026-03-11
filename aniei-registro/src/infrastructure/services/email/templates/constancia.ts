export interface ConstanciaEmailTemplateData {
  nombre: string;
  apellido: string;
  folio: string;
}

export function renderConstanciaEmailHTML(datos: ConstanciaEmailTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="background:#1a1a2e;color:#ffffff;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:22px;">Constancia de Inscripción</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.8;">Congreso ANIEI 2026</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;color:#333;">
          Estimado(a) <strong>${datos.nombre} ${datos.apellido}</strong>,
        </p>
        <p style="margin:0 0 16px;font-size:15px;color:#333;">
          Adjuntamos su constancia de inscripción al Congreso ANIEI 2026 con folio <strong>${datos.folio}</strong>.
        </p>
        <p style="margin:0;font-size:13px;color:#888;">
          Por favor, conserve este documento para su registro.
        </p>
      </td>
    </tr>
    <tr>
      <td style="background:#f0f0f0;padding:16px;text-align:center;font-size:12px;color:#888;">
        ANIEI 2026 — Asociación Nacional de Instituciones de Educación en Informática
      </td>
    </tr>
  </table>
</body>
</html>`;
}
