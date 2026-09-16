import type { APIRoute } from 'astro';
import { first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str, oneOf } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWritePresales } from '../../../server/rbac';
import { logActivity } from '../../../server/activity';
export const prerender = false;
const FIELDS = ['customer_problem', 'business_requirements', 'functional_requirements', 'technical_requirements', 'integrations', 'module_mapping', 'customization', 'assumptions', 'dependencies', 'open_questions', 'demo_requirements', 'solution_notes'];
const ST = ['requested', 'in_progress', 'complete'];
export const GET: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const ps = await first(g.ctx.db, 'SELECT * FROM presales WHERE id=? AND workspace_id=?', [params.id, g.ctx.workspace.id]);
  if (!ps) return fail('Pre-Sales workspace not found', 404);
  return ok({ presales: ps });
};
export const PATCH: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWritePresales(ctx.member)) return fail('You do not have permission to edit Pre-Sales', 403);
  const ps: any = await first(ctx.db, 'SELECT * FROM presales WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!ps) return fail('Pre-Sales workspace not found', 404);
  const b = await readBody(request);
  const sets: string[] = []; const vals: any[] = [];
  for (const f of FIELDS) { if (b[f] !== undefined) { sets.push(`${f}=?`); vals.push(str(b[f], 8000)); } }
  const status = b.status !== undefined ? oneOf(b.status, ST, 'status', ps.status) : ps.status;
  if (b.owner_id !== undefined) { sets.push('owner_id=?'); vals.push(str(b.owner_id, 60)); }
  sets.push('status=?'); vals.push(status);
  sets.push('updated_at=?'); vals.push(Date.now());
  vals.push(ps.id);
  await run(ctx.db, `UPDATE presales SET ${sets.join(',')} WHERE id=?`, vals);
  if (status !== ps.status) {
    await run(ctx.db, 'UPDATE opportunities SET presales_status=?, updated_at=? WHERE id=?', [status === 'complete' ? 'complete' : 'in_progress', Date.now(), ps.opportunity_id]);
    await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: ps.opportunity_id, userId: ctx.user.id, type: 'presales', detail: `Pre-Sales → ${status}` });
  }
  return ok();
};
