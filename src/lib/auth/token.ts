/**
 * Token HMAC-SHA256 para sesiones de administrador.
 *
 * Formato: base64url(JSON payload).base64url(firma HMAC-SHA256)
 *
 * Usa exclusivamente Web Crypto API (crypto.subtle) para ser compatible
 * con Edge Runtime (middleware) y Node.js Runtime (server actions).
 * Sin dependencias de `Buffer` ni módulo `crypto` de Node.
 */

const ALGO = { name: "HMAC", hash: "SHA-256" } as const;
const TTL_MS = 4 * 60 * 60 * 1000; // 4 horas

function encode(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Retorna ArrayBuffer directamente para compatibilidad con crypto.subtle
 * (evita el problema de TypeScript con Uint8Array<ArrayBufferLike> vs ArrayBuffer).
 */
function decode(str: string): ArrayBuffer {
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, "=");
  const raw = atob(padded);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
}

async function importKey(secret: string, usage: "sign" | "verify"): Promise<CryptoKey> {
  const secretBytes = new TextEncoder().encode(secret);
  return crypto.subtle.importKey("raw", secretBytes, ALGO, false, [usage]);
}

/**
 * Genera un token firmado con el secreto dado.
 * El token lleva un campo `exp` (Unix ms) para expiración automática.
 */
export async function createToken(secret: string): Promise<string> {
  const payload = new TextEncoder().encode(JSON.stringify({ exp: Date.now() + TTL_MS }));
  const payloadB64 = encode(payload);
  const key = await importKey(secret, "sign");
  const sigBuf = await crypto.subtle.sign(ALGO, key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${encode(new Uint8Array(sigBuf))}`;
}

/**
 * Verifica que un token sea válido: firma correcta + no expirado.
 * Retorna false ante cualquier error (token malformado, firma incorrecta, expirado).
 */
export async function verifyToken(token: string | null | undefined, secret: string): Promise<boolean> {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  try {
    const key = await importKey(secret, "verify");
    const valid = await crypto.subtle.verify(
      ALGO,
      key,
      decode(sigB64),
      new TextEncoder().encode(payloadB64),
    );
    if (!valid) return false;
    const payloadBytes = new Uint8Array(decode(payloadB64));
    const { exp } = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp: number };
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}
