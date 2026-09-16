import type { APIRoute } from 'astro';
import { first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str, email as vEmail, oneOf, dateMsOrNull, ValidationError } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWriteSales } from '../../../server/rbac';
import { logActivity } from '../../../server/activity';
export const prerender = false;
const STATUSES = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
const PRIOS = ['low', 'medium', 'high'];
async function getLead(ctx: any, id: any) {
  return await first(ctx.db, 'SELECT * FROM leads WHERE id=? AND workspace_id=?', [id, ctx.workspace.id]);
}
export const GET: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const lead = await getLead(g.ctx, params.id); if (!lead) return fail('Lead not found', 404);
  return ok({ lead });
};
export const PATCH: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to edit leads', 403);
  const lead = await getLead(ctx, params.id); if (!lead) return fail('Lead not found', 404);
  try {
    const b = await readBody(request);
    const f = {
      company_name: str(b.company_name ?? lead.company_name, 160),
      contact_person: str(b.contact_person ?? lead.contact_person, 120),
      designation: str(b.designation ?? lead.designation, 120),
      email: b.email != null ? (b.email ? vEmail(b.email) : '') : lead.email,
      phone: str(b.phone ?? lead.phone, 40),
      source: str(b.source ?? lead.source, 80),
      requirement: str(b.requirement ?? lead.requirement, 4000),
      owner_id: str(b.owner_id ?? lead.owner_id, 60),
      priority: oneOf(b.priority ?? lead.priority, PRIOS, 'priority', 'medium'),
      notes: str(b.notes ?? lead.notes, 4000),
      next_follow_up: b.next_follow_up !== undefined ? dateMsOrNull(b.next_follow_up) : lead.next_follow_up,
      status: oneOf(b.status ?? lead.status, STATUSES, 'status', lead.status),
    };
    await run(ctx.db, `UPDATE leads SET company_name=?,contact_person=?,designation=?,email=?,phone=?,source=?,requirement=?,owner_id=?,priority=?,notes=?,next_follow_up=?,status=?,updated_at=? WHERE id=?`,
      [f.company_name, f.contact_person, f.designation, f.email, f.phone, f.source, f.requirement, f.owner_id, f.priority, f.notes, f.next_follow_up, f.status, Date.now(), lead.id]);
    if (f.status !== lead.status) await logActivity(ctx.db, ctx.workspace.id, { entityType: 'lead', entityId: lead.id, userId: ctx.user.id, type: 'status', detail: `Status → ${f.status}` });
    return ok();
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    return fail('Could not update lead', 500);
  }
};
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to delete leads', 403);
  const lead = await getLead(ctx, params.id); if (!lead) return fail('Lead not found', 404);
  await run(ctx.db, 'DELETE FROM leads WHERE id=?', [lead.id]);
  return ok();
};
