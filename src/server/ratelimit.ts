import { uid } from './ids';
export function clientIp(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || 'local';
}
// DB-backed sliding-window limiter. Returns true if allowed. Fails open on error.
export async function rateLimit(db: any, bucket: string, max: number, windowMs: number): Promise<boolean> {
  const now = Date.now(); const since = now - windowMs;
  try {
    const r: any = await db.prepare('SELECT COUNT(*) c FROM rate_events WHERE bucket=? AND created_at>=?').bind(bucket, since).first();
    if ((r?.c || 0) >= max) return false;
    await db.prepare('INSERT INTO rate_events (id,bucket,created_at) VALUES (?,?,?)').bind(uid('rl'), bucket, now).run();
    if (Math.random() < 0.05) { try { await db.prepare('DELETE FROM rate_events WHERE created_at < ?').bind(now - windowMs * 6).run(); } catch {} }
    return true;
  } catch { return true; }
}
