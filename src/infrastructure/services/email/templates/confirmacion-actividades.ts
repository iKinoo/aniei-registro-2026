export interface ConfirmacionActividadesData {
  nombre: string;
  apellido: string;
  folio: string;
  actividades: Array<{
    nombre: string;
    fecha: string;
    costo: string | null;
  }>;
  totalCosto: string | null; // null si todo gratis
  fecha: string;
}

export function renderConfirmacionActividadesHTML(datos: ConfirmacionActividadesData): string {
  const filasActividades = datos.actividades
    .map(
      (a) => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:8px 4px;font-size:14px;color:#333;">${a.nombre}</td>
          <td style="padding:8px 4px;font-size:13px;color:#666;">${a.fecha}</td>
          <td style="padding:8px 4px;font-size:14px;color:#333;text-align:right;white-space:nowrap;">
            ${a.costo ? `<strong>${a.costo}</strong>` : '<span style="color:#16a34a;">Gratis</span>'}
          </td>
        </tr>`,
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="background:#312e81;color:#ffffff;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:22px;">Inscripción a Actividades Confirmada</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.8;">Congreso ANIEI 2026</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;color:#333;">
          Estimado(a) <strong>${datos.nombre} ${datos.apellido}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:15px;color:#333;">
          Tu inscripción a las siguientes actividades del Congreso ANIEI 2026 ha sido confirmada exitosamente.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:0 0 20px;" cellpadding="0">
          <thead>
            <tr style="background:#f5f3ff;border-bottom:2px solid #ddd;">
              <th style="padding:8px 4px;text-align:left;font-size:13px;color:#555;">Actividad</th>
              <th style="padding:8px 4px;text-align:left;font-size:13px;color:#555;">Fecha</th>
              <th style="padding:8px 4px;text-align:right;font-size:13px;color:#555;">Costo</th>
            </tr>
          </thead>
          <tbody>
            ${filasActividades}
          </tbody>
          ${datos.totalCosto ? `
          <tfoot>
            <tr style="background:#f5f3ff;">
              <td colspan="2" style="padding:10px 4px;font-weight:bold;font-size:14px;color:#312e81;">Total pagado</td>
              <td style="padding:10px 4px;font-weight:bold;font-size:16px;color:#312e81;text-align:right;">${datos.totalCosto}</td>
            </tr>
          </tfoot>` : ''}
        </table>

        <table style="width:100%;border-collapse:collapse;margin:0 0 20px;" cellpadding="8">
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;width:40%;">Folio de registro:</td>
            <td style="color:#312e81;font-weight:bold;font-size:16px;">${datos.folio}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#555;">Fecha de inscripción:</td>
            <td style="color:#333;">${datos.fecha}</td>
          </tr>
        </table>

        <p style="margin:0 0 20px;font-size:15px;color:#333;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aniei.space'}/perfil"
             style="background:#312e81;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;display:inline-block;font-weight:bold;">
            Ver mi perfil
          </a>
        </p>

        <p style="margin:0;font-size:13px;color:#888;">
          Conserva este correo como comprobante de tu inscripción a las actividades.
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
