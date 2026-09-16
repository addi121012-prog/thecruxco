// Password hashing via PBKDF2-SHA256 (Web Crypto — works on the Workers runtime).
const ITER = 100000;
function bufToB64(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf); let s = '';
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s);
}
function b64ToBuf(b64: string): Uint8Array {
  const s = atob(b64); const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u;
}
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, key, 256);
  return `pbkdf2$${ITER}$${bufToB64(salt.buffer)}$${bufToB64(bits)}`;
}
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const parts = String(stored).split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
    const iter = parseInt(parts[1], 10);
    const salt = b64ToBuf(parts[2]);
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, key, 256);
    const a = bufToB64(bits); const b = parts[3];
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
  } catch { return false; }
}
