import type { APIRoute } from 'astro';
import { first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str, oneOf, intOrNull, numOrNull, dateMsOrNull, ValidationError } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWriteSales } from '../../../server/rbac';
import { logActivity } from '../../../server/activity';
export const prerender = false;
const STAGES = ['qualified', 'discovery', 'presales', 'proposal', 'negotiation', 'won', 'lost'];
async function getOpp(ctx: any, id: any) {
  return await first(ctx.db, 'SELECT * FROM opportunities WHERE id=? AND workspace_id=?', [id, ctx.workspace.id]);
}
export const GET: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const o = await getOpp(g.ctx, params.id); if (!o) return fail('Opportunity not found', 404);
  return ok({ opportunity: o });
};
export const PATCH: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to edit opportunities', 403);
  const o = await getOpp(ctx, params.id); if (!o) return fail('Opportunity not found', 404);
  try {
    const b = await readBody(request);
    // Stage-only quick update (kanban drag)
    if (b.stage != null && Object.keys(b).length <= 2) {
      const stage = oneOf(b.stage, STAGES, 'stage', o.stage);
      let closed = o.closed_at, prob = o.probability;
      if (stage === 'won') { closed = Date.now(); prob = 100; }
      else if (stage === 'lost') { closed = Date.now(); }
      else { closed = null; }
      await run(ctx.db, 'UPDATE opportunities SET stage=?,closed_at=?,probability=?,lost_reason=?,updated_at=? WHERE id=?',
        [stage, closed, prob, stage === 'lost' ? str(b.lost_reason, 400) : null, Date.now(), o.id]);
      await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: o.id, userId: ctx.user.id, type: 'stage', detail: `Stage → ${stage}` });
      return ok({ stage });
    }
    const f = {
      name: str(b.name ?? o.name, 160),
      company_name: str(b.company_name ?? o.company_name, 160),
      value: b.value !== undefined ? (numOrNull(b.value) || 0) : o.value,
      probability: b.probability !== undefined ? (intOrNull(b.probability) ?? 0) : o.probability,
      expected_close: b.expected_close !== undefined ? dateMsOrNull(b.expected_close) : o.expected_close,
      owner_id: str(b.owner_id ?? o.owner_id, 60),
      stage: oneOf(b.stage ?? o.stage, STAGES, 'stage', o.stage),
      requirements: str(b.requirements ?? o.requirements, 8000),
      notes: str(b.notes ?? o.notes, 8000),
      next_action: str(b.next_action ?? o.next_action, 400),
      follow_up_at: b.follow_up_at !== undefined ? dateMsOrNull(b.follow_up_at) : o.follow_up_at,
    };
    let closed = o.closed_at;
    if (f.stage === 'won' || f.stage === 'lost') { if (!closed) closed = Date.now(); if (f.stage === 'won') f.probability = 100; }
    else closed = null;
    await run(ctx.db, `UPDATE opportunities SET name=?,company_name=?,value=?,probability=?,expected_close=?,owner_id=?,stage=?,requirements=?,notes=?,next_action=?,follow_up_at=?,closed_at=?,updated_at=? WHERE id=?`,
      [f.name, f.company_name, f.value, f.probability, f.expected_close, f.owner_id, f.stage, f.requirements, f.notes, f.next_action, f.follow_up_at, closed, Date.now(), o.id]);
    if (f.stage !== o.stage) await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: o.id, userId: ctx.user.id, type: 'stage', detail: `Stage → ${f.stage}` });
    return ok();
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    return fail('Could not update opportunity', 500);
  }
};
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to delete opportunities', 403);
  const o = await getOpp(ctx, params.id); if (!o) return fail('Opportunity not found', 404);
  await run(ctx.db, 'DELETE FROM presales WHERE opportunity_id=?', [o.id]);
  await run(ctx.db, 'DELETE FROM proposals WHERE opportunity_id=?', [o.id]);
  await run(ctx.db, 'DELETE FROM opportunities WHERE id=?', [o.id]);
  return ok();
};
