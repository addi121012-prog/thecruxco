import type { APIRoute } from 'astro';
import { all } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { req, str, oneOf, dateMsOrNull, ValidationError } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWrite } from '../../../server/rbac';
import { uid } from '../../../server/ids';
export const prerender = false;
const PRIOS = ['low', 'medium', 'high'];
const ETYPES = ['general', 'lead', 'opportunity'];
export const GET: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  const url = new URL(request.url);
  const entityType = url.searchParams.get('entity_type');
  const entityId = url.searchParams.get('entity_id');
  let sql = `SELECT t.*, u.name AS owner_name FROM tasks t LEFT JOIN users u ON u.id=t.owner_id WHERE t.workspace_id=?`;
  const p: any[] = [ctx.workspace.id];
  if (entityType && entityId) { sql += ' AND t.entity_type=? AND t.entity_id=?'; p.push(entityType, entityId); }
  sql += ' ORDER BY (t.status="done"), t.due_at IS NULL, t.due_at ASC LIMIT 500';
  return ok({ tasks: await all(ctx.db, sql, p) });
};
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission to add tasks', 403);
  try {
    const b = await readBody(request);
    const title = req(b.title, 'Task title', 300);
    const t = Date.now(); const id = uid('task');
    await ctx.db.prepare(`INSERT INTO tasks (id,workspace_id,title,entity_type,entity_id,owner_id,due_at,priority,status,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, ctx.workspace.id, title, oneOf(b.entity_type, ETYPES, 'entity_type', 'general'), str(b.entity_id, 60) || null,
        str(b.owner_id, 60) || ctx.user.id, dateMsOrNull(b.due_at), oneOf(b.priority, PRIOS, 'priority', 'medium'), 'open', str(b.notes, 2000), t, t).run();
    return ok({ id });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    return fail('Could not create task', 500);
  }
};
