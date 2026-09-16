import type { APIRoute } from 'astro';
import { all } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { req, str, oneOf, intOrNull, numOrNull, dateMsOrNull, ValidationError } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWriteSales } from '../../../server/rbac';
import { uid } from '../../../server/ids';
import { logActivity } from '../../../server/activity';
import { track } from '../../../server/analytics';
export const prerender = false;
export const STAGES = ['qualified', 'discovery', 'presales', 'proposal', 'negotiation', 'won', 'lost'];

export const GET: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  const rows = await all(ctx.db, `SELECT o.*, u.name AS owner_name FROM opportunities o LEFT JOIN users u ON u.id=o.owner_id WHERE o.workspace_id=? ORDER BY o.updated_at DESC LIMIT 1000`, [ctx.workspace.id]);
  return ok({ opportunities: rows });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to add opportunities', 403);
  try {
    const b = await readBody(request);
    const name = req(b.name, 'Opportunity name', 160);
    const t = Date.now(); const id = uid('opp');
    await ctx.db.prepare(
      `INSERT INTO opportunities (id,workspace_id,name,company_name,value,currency,probability,expected_close,owner_id,stage,requirements,notes,next_action,follow_up_at,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(id, ctx.workspace.id, name, str(b.company_name, 160), numOrNull(b.value) || 0, 'INR',
      intOrNull(b.probability) ?? 20, dateMsOrNull(b.expected_close), str(b.owner_id, 60) || ctx.user.id,
      oneOf(b.stage, STAGES, 'stage', 'qualified'), str(b.requirements, 8000), str(b.notes, 8000),
      str(b.next_action, 400), dateMsOrNull(b.follow_up_at), t, t).run();
    await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: id, userId: ctx.user.id, type: 'created', detail: `Opportunity created: ${name}` });
    const cnt: any = await ctx.db.prepare('SELECT COUNT(*) c FROM opportunities WHERE workspace_id=?').bind(ctx.workspace.id).first();
    if (cnt && cnt.c === 1) await track(ctx.db, ctx.workspace.id, ctx.user.id, 'first_opportunity_created', {});
    return ok({ id });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    console.log('[opp:create]', String(e));
    return fail('Could not create opportunity', 500);
  }
};
