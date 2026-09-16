import { token } from './ids';
import { run, first } from './db';
export const COOKIE = 'crux_session';
const MAXAGE = 60 * 60 * 24 * 30;
export async function createSession(db: any, userId: string) {
  const id = token(32);
  const expires = Date.now() + MAXAGE * 1000;
  await run(db, 'INSERT INTO sessions (id,user_id,created_at,expires_at) VALUES (?,?,?,?)', [id, userId, Date.now(), expires]);
  return { id, expires };
}
export function sessionCookie(id: string, secure = true): string {
  return `${COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAXAGE}${secure ? '; Secure' : ''}`;
}
export function clearCookie(secure = true): string {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure ? '; Secure' : ''}`;
}
export function readSessionId(request: Request): string | null {
  const c = request.headers.get('cookie') || '';
  const m = c.match(/(?:^|;\s*)crux_session=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}
export async function getSessionUser(db: any, request: Request) {
  const id = readSessionId(request);
  if (!id) return null;
  const s: any = await first(db, 'SELECT * FROM sessions WHERE id=?', [id]);
  if (!s) return null;
  if (s.expires_at < Date.now()) { await run(db, 'DELETE FROM sessions WHERE id=?', [id]); return null; }
  const u: any = await first(db, 'SELECT * FROM users WHERE id=?', [s.user_id]);
  if (!u) return null;
  return { session: s, user: u };
}
export async function destroySession(db: any, request: Request) {
  const id = readSessionId(request);
  if (id) await run(db, 'DELETE FROM sessions WHERE id=?', [id]);
}
export function isSecure(request: Request): boolean {
  try { return new URL(request.url).protocol === 'https:'; } catch { return true; }
}
