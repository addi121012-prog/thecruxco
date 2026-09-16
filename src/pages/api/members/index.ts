import type { APIRoute } from 'astro';
import { all } from '../../../server/db';
import { ok } from '../../../server/response';
import { guardApi } from '../../../server/auth';
export const prerender = false;
export const GET: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  const members = await all(ctx.db,
    `SELECT m.id, m.user_id, m.role, m.status, u.name, u.email
     FROM memberships m JOIN users u ON u.id = m.user_id
     WHERE m.workspace_id = ? ORDER BY m.created_at ASC`, [ctx.workspace.id]);
  const invites = await all(ctx.db, `SELECT id, email, role, created_at, expires_at FROM invites WHERE workspace_id=? AND accepted_at IS NULL ORDER BY created_at DESC`, [ctx.workspace.id]);
  return ok({ members, invites, me: ctx.user.id });
};
