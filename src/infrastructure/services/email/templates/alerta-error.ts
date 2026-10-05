import type { AlertaErrorData } from '@/application/ports/IAlertaErrorService';

const MAX_STACK_CHARS = 5000;

function escapar(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function campo(etiqueta: string, valor?: string): string {
  if (!valor) return '';
  return `<p style="margin:0 0 10px;font-size:14px;color:#333;"><strong>${etiqueta}:</strong> ${escapar(valor)}</p>`;
}

export function renderAlertaErrorHTML(datos: AlertaErrorData): string {
  const stack = datos.stack
    ? `${escapar(datos.stack.slice(0, MAX_STACK_CHARS))}${datos.stack.length > MAX_STACK_CHARS ? '\n… (truncado)' : ''}`
    : '(sin stack)';

  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td style="background:#8b1a1a;color:#ffffff;padding:24px;text-align:center;">
        <h1 style="margin:0;font-size:22px;">Alerta de error — ANIEI 2026</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.85;">${escapar(datos.entorno)} · ${escapar(datos.origen)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:24px;">
        ${campo('Contexto', datos.contexto)}
        ${campo('Mensaje', datos.mensaje)}
        ${campo('Código', datos.codigo)}
        ${campo('Folio', datos.folio)}
        ${campo('Ruta', datos.ruta)}
        ${campo('Momento', datos.timestamp)}
        ${datos.cantidadAcumulada ? `<p style="margin:0 0 10px;font-size:14px;color:#8b1a1a;"><strong>${datos.cantidadAcumulada}</strong> ocurrencias adicionales del mismo error acumuladas en la ventana de supresión.</p>` : ''}
        <p style="margin:16px 0 6px;font-size:14px;color:#333;"><strong>Traza:</strong></p>
        <pre style="background:#1a1a2e;color:#e8e8e8;padding:14px;border-radius:6px;font-size:12px;line-height:1.45;white-space:pre-wrap;word-break:break-word;max-height:420px;overflow:auto;">${stack}</pre>
      </td>
    </tr>
    <tr>
      <td style="background:#f0f0f0;padding:14px;text-align:center;font-size:12px;color:#888;">
        Sistema de Registro ANIEI 2026 — correo automático de notificación de errores
      </td>
    </tr>
  </table>
</body>
</html>`;
}
