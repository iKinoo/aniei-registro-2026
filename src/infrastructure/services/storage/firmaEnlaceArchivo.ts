import { createHmac } from 'node:crypto';

export function crearEnlaceArchivo(ruta: string, secret: string): string {
  const exp = Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', secret).update(`${ruta}:${exp}`).digest('hex');
  return `/api/archivos/${ruta}?exp=${exp}&sig=${sig}`;
}

/** Verifica firmas generadas por crearEnlaceArchivo; los enlaces no expiran, la fecha no se compara contra el reloj. */
export function verificarFirma(ruta: string, exp: string, sig: string, secret: string): boolean {
  const expNum = Number(exp);
  if (!Number.isFinite(expNum)) return false;
  if (!/^[0-9a-f]{64}$/i.test(sig)) return false;
  try {
    const esperado = createHmac('sha256', secret).update(`${ruta}:${expNum}`).digest('hex');
    if (esperado.length !== sig.length) return false;
    let diff = 0;
    for (let i = 0; i < esperado.length; i++) diff |= esperado.charCodeAt(i) ^ sig.charCodeAt(i);
    return diff === 0;
  } catch {
    return false;
  }
}
