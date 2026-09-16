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
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to convert leads', 403);
  const b = await readBody(request);
  const lead: any = await first(ctx.db, 'SELECT * FROM leads WHERE id=? AND workspace_id=?', [str(b.id, 60), ctx.workspace.id]);
  if (!lead) return fail('Lead not found', 404);
  if (lead.converted_opportunity_id) return fail('This lead was already converted', 400);
  const t = Date.now();
  const oppId = uid('opp');
  const name = str(b.name, 160) || `${lead.company_name} opportunity`;
  const value = Number(b.value) || 0;
  await run(ctx.db,
    `INSERT INTO opportunities (id,workspace_id,name,company_name,value,currency,probability,expected_close,owner_id,stage,requirements,notes,source,lead_id,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [oppId, ctx.workspace.id, name, lead.company_name, value, 'INR', 20, null, lead.owner_id || ctx.user.id, 'qualified',
     lead.requirement, lead.notes, lead.source, lead.id, t, t]);
  await run(ctx.db, `UPDATE leads SET status='converted', converted_opportunity_id=?, updated_at=? WHERE id=?`, [oppId, t, lead.id]);
  await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: oppId, userId: ctx.user.id, type: 'created', detail: `Converted from lead: ${lead.company_name}` });
  const cnt: any = await first(ctx.db, 'SELECT COUNT(*) c FROM opportunities WHERE workspace_id=?', [ctx.workspace.id]);
  if (cnt && cnt.c === 1) await track(ctx.db, ctx.workspace.id, ctx.user.id, 'first_opportunity_created', {});
  return ok({ opportunityId: oppId });
};
