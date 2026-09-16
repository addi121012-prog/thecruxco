import type { APIRoute } from 'astro';
import { getDB, first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { email as vEmail, str, ValidationError } from '../../../server/validate';
import { verifyPassword } from '../../../server/crypto';
import { createSession, sessionCookie, isSecure } from '../../../server/session';
import { rateLimit, clientIp } from '../../../server/ratelimit';
export const prerender = false;
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const db = getDB(locals);
    if (!(await rateLimit(db, 'login:' + clientIp(request), 30, 600000))) return fail('Too many attempts. Please wait a few minutes and try again.', 429);
    const body = await readBody(request);
    const email = vEmail(body.email);
    const password = str(body.password, 200);
    const user: any = await first(db, 'SELECT * FROM users WHERE email=?', [email]);
    if (!user || !(await verifyPassword(password, user.password_hash))) return fail('Invalid email or password', 401);
    const s = await createSession(db, user.id);
    let redirect = '/app';
    const membership = await first(db, 'SELECT id FROM memberships WHERE user_id=? AND status=? LIMIT 1', [user.id, 'active']);
    if (!membership) redirect = '/app/onboarding';
    return new Response(JSON.stringify({ ok: true, redirect }), { status: 200, headers: { 'content-type': 'application/json', 'set-cookie': sessionCookie(s.id, isSecure(request)) } });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    return fail('Could not log in', 500);
  }
};
