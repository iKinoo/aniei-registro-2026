import { randomInt } from "crypto";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Genera contraseña segura usando CSPRNG (crypto.randomInt).
 * Evita Math.random (predecible). Longitud por defecto 14 (~84 bits con CHARSET).
 */
export function generateSecurePassword(len = 14, useSymbols = true): string {
  const chars = useSymbols ? CHARSET : ALPHANUM;
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars[randomInt(chars.length)];
  }
  return s;
}

/** Genera contraseña alfanumérica de 12 chars para compatibilidad */
export function generateSecurePasswordAlnum(len = 12): string {
  return generateSecurePassword(len, false);
}
