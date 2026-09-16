import type { APIRoute } from 'astro';
import { getDB, first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str } from '../../../server/validate';
import { hashPassword } from '../../../server/crypto';
export const prerender = false;
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const db = getDB(locals);
    const body = await readBody(request);
    const tk = str(body.token, 200);
    const password = str(body.password, 200);
    if (password.length < 8) return fail('Password must be at least 8 characters');
    const pr: any = await first(db, 'SELECT * FROM password_resets WHERE token=? AND used_at IS NULL', [tk]);
    if (!pr || pr.expires_at < Date.now()) return fail('This reset link is invalid or has expired', 400);
    await run(db, 'UPDATE users SET password_hash=? WHERE id=?', [await hashPassword(password), pr.user_id]);
    await run(db, 'UPDATE password_resets SET used_at=? WHERE id=?', [Date.now(), pr.id]);
    await run(db, 'DELETE FROM sessions WHERE user_id=?', [pr.user_id]);
    return ok({ message: 'Password updated. You can log in now.' });
  } catch (e) {
    return fail('Could not reset password', 500);
  }
};
