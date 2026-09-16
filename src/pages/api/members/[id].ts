import type { APIRoute } from 'astro';
import { first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { oneOf } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { isAdmin, ROLES } from '../../../server/rbac';
export const prerender = false;
export const PATCH: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!isAdmin(ctx.member)) return fail('Only admins can manage teammates', 403);
  const m: any = await first(ctx.db, 'SELECT * FROM memberships WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!m) return fail('Member not found', 404);
  const body = await readBody(request);
  const role = oneOf(body.role, ROLES as any, 'role', m.role);
  if (m.user_id === ctx.user.id && m.role === 'admin' && role !== 'admin') {
    const admins: any = await first(ctx.db, `SELECT COUNT(*) c FROM memberships WHERE workspace_id=? AND role='admin' AND status='active'`, [ctx.workspace.id]);
    if (admins.c <= 1) return fail('You are the only admin — assign another admin first', 400);
  }
  await run(ctx.db, 'UPDATE memberships SET role=? WHERE id=?', [role, m.id]);
  return ok();
};
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!isAdmin(ctx.member)) return fail('Only admins can remove teammates', 403);
  const m: any = await first(ctx.db, 'SELECT * FROM memberships WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!m) return fail('Member not found', 404);
  if (m.user_id === ctx.user.id) return fail('You cannot remove yourself', 400);
  await run(ctx.db, `UPDATE memberships SET status='disabled' WHERE id=?`, [m.id]);
  await run(ctx.db, 'DELETE FROM sessions WHERE user_id=?', [m.user_id]);
  return ok();
};
