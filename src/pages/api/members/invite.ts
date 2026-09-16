import type { APIRoute } from 'astro';
import { getEnv, first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { email as vEmail, oneOf, ValidationError } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { isAdmin, ROLES } from '../../../server/rbac';
import { uid, token } from '../../../server/ids';
import { sendEmail } from '../../../server/email';
import { track } from '../../../server/analytics';
export const prerender = false;
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!isAdmin(ctx.member)) return fail('Only admins can invite teammates', 403);
  try {
    const body = await readBody(request);
    const email = vEmail(body.email);
    const role = oneOf(body.role, ROLES as any, 'role', 'sales');
    // capacity check against seats
    const cnt: any = await first(ctx.db, `SELECT COUNT(*) c FROM memberships WHERE workspace_id=? AND status='active'`, [ctx.workspace.id]);
    const pend: any = await first(ctx.db, `SELECT COUNT(*) c FROM invites WHERE workspace_id=? AND accepted_at IS NULL`, [ctx.workspace.id]);
    if ((cnt.c + pend.c) >= ctx.workspace.seats) return fail(`Your plan includes ${ctx.workspace.seats} seats. Upgrade to add more.`, 402, { seatLimit: true });
    const already: any = await first(ctx.db, `SELECT u.id FROM users u JOIN memberships m ON m.user_id=u.id WHERE u.email=? AND m.workspace_id=?`, [email, ctx.workspace.id]);
    if (already) return fail('That person is already in this workspace');
    const tk = token(20); const t = Date.now();
    await run(ctx.db, 'INSERT INTO invites (id,workspace_id,email,role,token,invited_by,created_at,expires_at) VALUES (?,?,?,?,?,?,?,?)',
      [uid('inv'), ctx.workspace.id, email, role, tk, ctx.user.id, t, t + 14 * 86400000]);
    const link = `${new URL(request.url).origin}/signup?invite=${tk}&email=${encodeURIComponent(email)}`;
    await sendEmail(getEnv(locals), email, `You're invited to ${ctx.workspace.name} on The Crux`,
      `<p>${ctx.user.name || ctx.user.email} invited you to join <strong>${ctx.workspace.name}</strong> on The Crux CRM.</p><p><a href="${link}">Accept the invitation →</a></p>`,
      `Join ${ctx.workspace.name} on The Crux: ${link}`);
    await track(ctx.db, ctx.workspace.id, ctx.user.id, 'teammate_invited', { role });
    return ok({ inviteLink: link });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    return fail('Could not send invite', 500);
  }
};
