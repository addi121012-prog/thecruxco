import type { APIRoute } from 'astro';
import { all, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { req, str, email as vEmail, oneOf, dateMsOrNull, ValidationError } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWriteSales } from '../../../server/rbac';
import { uid } from '../../../server/ids';
import { logActivity } from '../../../server/activity';
import { track } from '../../../server/analytics';
export const prerender = false;
const STATUSES = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
const PRIOS = ['low', 'medium', 'high'];

export const GET: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  const url = new URL(request.url);
  const status = url.searchParams.get('status') || '';
  let sql = `SELECT l.*, u.name AS owner_name FROM leads l LEFT JOIN users u ON u.id=l.owner_id WHERE l.workspace_id=?`;
  const p: any[] = [ctx.workspace.id];
  if (STATUSES.includes(status)) { sql += ' AND l.status=?'; p.push(status); }
  sql += ' ORDER BY l.created_at DESC LIMIT 500';
  return ok({ leads: await all(ctx.db, sql, p) });
};

export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to add leads', 403);
  try {
    const b = await readBody(request);
    const company_name = req(b.company_name, 'Company name', 160);
    const email = b.email ? vEmail(b.email) : '';
    const t = Date.now();
    const id = uid('lead');
    await run(ctx.db,
      `INSERT INTO leads (id,workspace_id,company_name,contact_person,designation,email,phone,source,requirement,owner_id,priority,notes,next_follow_up,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [id, ctx.workspace.id, company_name, str(b.contact_person, 120), str(b.designation, 120), email, str(b.phone, 40),
       str(b.source, 80), str(b.requirement, 4000), str(b.owner_id, 60) || ctx.user.id, oneOf(b.priority, PRIOS, 'priority', 'medium'),
       str(b.notes, 4000), dateMsOrNull(b.next_follow_up), oneOf(b.status, STATUSES, 'status', 'new'), t, t]);
    await logActivity(ctx.db, ctx.workspace.id, { entityType: 'lead', entityId: id, userId: ctx.user.id, type: 'created', detail: `Lead created: ${company_name}` });
    const cnt: any = await ctx.db.prepare('SELECT COUNT(*) c FROM leads WHERE workspace_id=?').bind(ctx.workspace.id).first();
    if (cnt && cnt.c === 1) await track(ctx.db, ctx.workspace.id, ctx.user.id, 'first_lead_created', {});
    return ok({ id });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    console.log('[leads:create]', String(e));
    return fail('Could not create lead', 500);
  }
};
