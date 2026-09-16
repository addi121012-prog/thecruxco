import type { APIRoute } from 'astro';
import { first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWriteSales } from '../../../server/rbac';
import { uid } from '../../../server/ids';
import { logActivity } from '../../../server/activity';
import { track } from '../../../server/analytics';
export const prerender = false;
// Send an opportunity to Pre-Sales: creates the structured workspace + flips status/stage.
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('Only sales/admin can send to Pre-Sales', 403);
  const b = await readBody(request);
  const opp: any = await first(ctx.db, 'SELECT * FROM opportunities WHERE id=? AND workspace_id=?', [str(b.opportunityId, 60), ctx.workspace.id]);
  if (!opp) return fail('Opportunity not found', 404);
  let ps: any = await first(ctx.db, 'SELECT * FROM presales WHERE opportunity_id=?', [opp.id]);
  const t = Date.now();
  if (!ps) {
    const id = uid('ps');
    await run(ctx.db, `INSERT INTO presales (id,workspace_id,opportunity_id,owner_id,status,customer_problem,business_requirements,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)`,
      [id, ctx.workspace.id, opp.id, str(b.ownerId, 60) || null, 'requested', opp.requirements || '', opp.requirements || '', t, t]);
    ps = { id };
    const cnt: any = await first(ctx.db, 'SELECT COUNT(*) c FROM presales WHERE workspace_id=?', [ctx.workspace.id]);
    if (cnt && cnt.c === 1) await track(ctx.db, ctx.workspace.id, ctx.user.id, 'first_presales_created', {});
  }
  const newStage = ['qualified', 'discovery'].includes(opp.stage) ? 'presales' : opp.stage;
  await run(ctx.db, `UPDATE opportunities SET presales_status='requested', stage=?, updated_at=? WHERE id=?`, [newStage, t, opp.id]);
  await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: opp.id, userId: ctx.user.id, type: 'presales', detail: 'Sent to Pre-Sales' });
  return ok({ presalesId: ps.id });
};
