export interface ConfirmacionTemplateData {
  nombre: string;
  apellido: string;
  folio: string;
  institucion: string;
  fecha: string;
  password?: string;
}

export function renderConfirmacionHTML(datos: ConfirmacionTemplateData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="background:#1a1a2e;color:#ffffff;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:22px;">Registro Confirmado</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.8;">Congreso ANIEI 2026</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;color:#333;">
          Estimado(a) <strong>${datos.nombre} ${datos.apellido}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:15px;color:#333;">
          Su inscripción al Congreso ANIEI 2026 ha sido registrada exitosamente.
        </p>
        <table style="width:100%;border-collapse:collapse;margin:0 0 20px;" cellpadding="8">
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;width:40%;">Nombre:</td>
            <td style="color:#333;">${datos.nombre} ${datos.apellido}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;">Folio:</td>
            <td style="color:#1a1a2e;font-weight:bold;font-size:16px;">${datos.folio}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;">Institución:</td>
            <td style="color:#333;">${datos.institucion}</td>
          </tr>
          <tr style="${datos.password ? 'border-bottom:1px solid #eee;' : ''}">
            <td style="font-weight:bold;color:#555;">Fecha de registro:</td>
            <td style="color:#333;">${datos.fecha}</td>
          </tr>
          ${datos.password ? `
          <tr style="background:#f9f9f9;border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#1a1a2e;" colspan="2">Credenciales de Acceso</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;">Folio de Registro:</td>
            <td style="color:#1a1a2e;font-weight:bold;font-size:16px;">${datos.folio}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#555;">Contraseña:</td>
            <td style="color:#1a1a2e;font-weight:bold;font-size:16px;">${datos.password}</td>
          </tr>
          ` : ''}
        </table>
        
        ${datos.password ? `
        <p style="margin:0 0 20px;font-size:15px;color:#333;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aniei.space'}/login" style="background:#1a1a2e;color:#fff;text-decoration:none;padding:10px 20px;border-radius:4px;display:inline-block;">Iniciar sesión para ver mi perfil</a>
        </p>
        ` : ''}

        <p style="margin:0;font-size:13px;color:#888;">
          Conserve este correo como comprobante de su inscripción.
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
