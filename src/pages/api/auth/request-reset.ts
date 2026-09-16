import type { APIRoute } from 'astro';
import { getDB, getEnv, first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { email as vEmail, ValidationError } from '../../../server/validate';
import { uid, token } from '../../../server/ids';
import { sendEmail } from '../../../server/email';
import { rateLimit, clientIp } from '../../../server/ratelimit';
export const prerender = false;
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const db = getDB(locals);
    const env = getEnv(locals);
    if (!(await rateLimit(db, 'reset:' + clientIp(request), 10, 3600000))) return fail('Too many attempts. Please wait a while and try again.', 429);
    const email = vEmail((await readBody(request)).email);
    const user: any = await first(db, 'SELECT * FROM users WHERE email=?', [email]);
    if (user) {
      const tk = token(24);
      const t = Date.now();
      await run(db, 'INSERT INTO password_resets (id,user_id,token,created_at,expires_at) VALUES (?,?,?,?,?)', [uid('pr'), user.id, tk, t, t + 3600_000]);
      const link = `${new URL(request.url).origin}/reset-password?token=${tk}`;
      await sendEmail(env, email, 'Reset your The Crux password', `<p>Reset your password using the link below (valid 1 hour):</p><p><a href="${link}">${link}</a></p>`, `Reset your password: ${link}`);
    }
    // Never reveal whether the email exists.
    return ok({ message: 'If that email has an account, a reset link is on its way.' });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    return fail('Could not process request', 500);
  }
};
