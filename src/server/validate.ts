export class ValidationError extends Error {}
export function str(v: any, max = 4000): string {
  return (v == null ? '' : String(v)).trim().slice(0, max);
}
export function req(v: any, field: string, max = 4000): string {
  const s = str(v, max);
  if (!s) throw new ValidationError(`${field} is required`);
  return s;
}
export function email(v: any): string {
  const s = str(v, 200).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s)) throw new ValidationError('Enter a valid email address');
  return s;
}
export function numOrNull(v: any): number | null {
  if (v === '' || v == null) return null;
  const n = Number(v);
  return isFinite(n) ? n : null;
}
export function intOrNull(v: any): number | null {
  const n = numOrNull(v);
  return n == null ? null : Math.round(n);
}
export function dateMsOrNull(v: any): number | null {
  const s = str(v, 40);
  if (!s) return null;
  const t = Date.parse(s);
  return isNaN(t) ? null : t;
}
export function oneOf(v: any, allowed: string[], field: string, def?: string): string {
  const s = str(v, 60);
  if (allowed.includes(s)) return s;
  if (def != null) return def;
  throw new ValidationError(`Invalid ${field}`);
}
