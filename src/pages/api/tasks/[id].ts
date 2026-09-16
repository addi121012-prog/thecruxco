import type { APIRoute } from 'astro';
import { first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str, oneOf, dateMsOrNull } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWrite } from '../../../server/rbac';
export const prerender = false;
const PRIOS = ['low', 'medium', 'high'];
export const PATCH: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission to edit tasks', 403);
  const task: any = await first(ctx.db, 'SELECT * FROM tasks WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!task) return fail('Task not found', 404);
  const b = await readBody(request);
  const status = b.status !== undefined ? oneOf(b.status, ['open', 'done'], 'status', task.status) : task.status;
  const f = {
    title: str(b.title ?? task.title, 300),
    owner_id: str(b.owner_id ?? task.owner_id, 60),
    due_at: b.due_at !== undefined ? dateMsOrNull(b.due_at) : task.due_at,
    priority: oneOf(b.priority ?? task.priority, PRIOS, 'priority', task.priority),
    notes: str(b.notes ?? task.notes, 2000),
    status,
    completed_at: status === 'done' ? (task.completed_at || Date.now()) : null,
  };
  await run(ctx.db, `UPDATE tasks SET title=?,owner_id=?,due_at=?,priority=?,notes=?,status=?,completed_at=?,updated_at=? WHERE id=?`,
    [f.title, f.owner_id, f.due_at, f.priority, f.notes, f.status, f.completed_at, Date.now(), task.id]);
  return ok();
};
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission to delete tasks', 403);
  const task: any = await first(ctx.db, 'SELECT * FROM tasks WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!task) return fail('Task not found', 404);
  await run(ctx.db, 'DELETE FROM tasks WHERE id=?', [task.id]);
  return ok();
};
