import type { APIRoute } from 'astro';
import { getDB, getEnv, first, run } from '../../../server/db';
import { readBody, fail } from '../../../server/response';
import { email as vEmail, str, ValidationError } from '../../../server/validate';
import { hashPassword } from '../../../server/crypto';
import { uid } from '../../../server/ids';
import { createSession, sessionCookie, isSecure } from '../../../server/session';
import { rateLimit, clientIp } from '../../../server/ratelimit';
import { track } from '../../../server/analytics';
export const prerender = false;
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const db = getDB(locals);
    if (!(await rateLimit(db, 'signup:' + clientIp(request), 15, 3600000))) return fail('Too many attempts. Please wait a while and try again.', 429);
    const body = await readBody(request);
    const email = vEmail(body.email);
    const password = str(body.password, 200);
    const name = str(body.name, 120);
    const inviteToken = str(body.invite, 200);
    if (password.length < 8) return fail('Password must be at least 8 characters');
    const existing = await first(db, 'SELECT id FROM users WHERE email=?', [email]);
    if (existing) return fail('An account with this email already exists. Try logging in.', 409);
    const userId = uid('usr');
    const hash = await hashPassword(password);
    const t = Date.now();
    await run(db, 'INSERT INTO users (id,email,password_hash,name,created_at) VALUES (?,?,?,?,?)', [userId, email, hash, name || null, t]);
    let redirect = '/app/onboarding';
    if (inviteToken) {
      const inv: any = await first(db, 'SELECT * FROM invites WHERE token=? AND accepted_at IS NULL', [inviteToken]);
      if (inv && inv.expires_at > t && String(inv.email).toLowerCase() === email) {
        await run(db, 'INSERT OR IGNORE INTO memberships (id,workspace_id,user_id,role,status,created_at) VALUES (?,?,?,?,?,?)', [uid('mem'), inv.workspace_id, userId, inv.role, 'active', t]);
        await run(db, 'UPDATE invites SET accepted_at=? WHERE id=?', [t, inv.id]);
        await run(db, 'UPDATE users SET current_workspace_id=? WHERE id=?', [inv.workspace_id, userId]);
        redirect = '/app';
      }
    }
    const s = await createSession(db, userId);
    await track(db, null, userId, 'signup', { invited: !!inviteToken });
    return new Response(JSON.stringify({ ok: true, redirect }), { status: 200, headers: { 'content-type': 'application/json', 'set-cookie': sessionCookie(s.id, isSecure(request)) } });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    console.log('[signup:error]', String(e));
    return fail('Could not create account', 500);
  }
};
