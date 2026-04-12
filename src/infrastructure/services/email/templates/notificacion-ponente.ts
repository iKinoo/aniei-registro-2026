export interface NotificacionPonenteData {
  nombre: string;
  apellido: string;
  correo: string;
  password: string;
  nombreActividad: string;
  rol: string;
}

export function renderNotificacionPonenteHTML(datos: NotificacionPonenteData): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="background:#1e3a8a;color:#fff;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:22px;">Has sido registrado como Ponente</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.8;">Congreso ANIEI 2026</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        <p style="margin:0 0 16px;font-size:15px;color:#333;">
          Estimado(a) <strong>${datos.nombre} ${datos.apellido}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:15px;color:#333;">
          El equipo organizador del Congreso ANIEI 2026 ha creado una cuenta para ti como ponente.
        </p>

        <table style="width:100%;border-collapse:collapse;margin:0 0 20px;" cellpadding="8">
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;width:40%;">Actividad:</td>
            <td style="color:#333;">${datos.nombreActividad}</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;">Rol:</td>
            <td style="color:#333;">${datos.rol}</td>
          </tr>
          <tr style="background:#f9f9f9;border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#1a1a2e;" colspan="2">Credenciales de Acceso</td>
          </tr>
          <tr style="border-bottom:1px solid #eee;">
            <td style="font-weight:bold;color:#555;">Usuario / Email:</td>
            <td style="color:#333;">${datos.correo}</td>
          </tr>
          <tr>
            <td style="font-weight:bold;color:#555;">Contraseña temporal:</td>
            <td style="color:#1a1a2e;font-weight:bold;font-size:16px;">${datos.password}</td>
          </tr>
        </table>

        <div style="background:#fff8e1;border-left:4px solid #f59e0b;padding:12px 16px;margin:0 0 20px;border-radius:4px;">
          <p style="margin:0;font-size:14px;color:#92400e;">
            <strong>⚠ Datos de pago pendientes:</strong> Tu registro de pago/depósito aún no ha sido completado.
            Una vez iniciada tu sesión, podrás seleccionar tus actividades adicionales y completar el proceso de inscripción si aplica.
          </p>
        </div>

        <p style="margin:0 0 20px;font-size:15px;color:#333;text-align:center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://aniei.space'}/login"
             style="background:#1a1a2e;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;display:inline-block;font-weight:bold;">
            Iniciar sesión
          </a>
        </p>

        <p style="margin:0;font-size:13px;color:#888;">
          Si tienes alguna duda, contacta al equipo organizador del congreso.
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
