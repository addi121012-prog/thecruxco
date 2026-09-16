import type { APIRoute } from 'astro';
import { first } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str, oneOf } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWriteSales } from '../../../server/rbac';
import { uid } from '../../../server/ids';
import { track } from '../../../server/analytics';
export const prerender = false;
const STATUSES = ['new', 'contacted', 'qualified', 'unqualified', 'converted'];
const PRIOS = ['low', 'medium', 'high'];
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWriteSales(ctx.member)) return fail('You do not have permission to import leads', 403);
  const b = await readBody(request);
  const rows: any[] = Array.isArray(b.rows) ? b.rows : [];
  const target = b.target === 'opportunities' ? 'opportunities' : 'leads';
  if (!rows.length) return fail('No rows to import');
  if (rows.length > 3000) return fail('Import is limited to 3000 rows at a time');
  const t = Date.now();
  let inserted = 0, skipped = 0;
  const stmts: any[] = [];
  for (const r of rows) {
    if (target === 'leads') {
      const company = str(r.company_name, 160);
      if (!company) { skipped++; continue; }
      stmts.push(ctx.db.prepare(`INSERT INTO leads (id,workspace_id,company_name,contact_person,designation,email,phone,source,requirement,owner_id,priority,notes,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(uid('lead'), ctx.workspace.id, company, str(r.contact_person, 120), str(r.designation, 120), str(r.email, 200), str(r.phone, 40),
          str(r.source, 80) || 'Import', str(r.requirement, 4000), ctx.user.id, PRIOS.includes(str(r.priority)) ? str(r.priority) : 'medium', str(r.notes, 4000),
          STATUSES.includes(str(r.status)) ? str(r.status) : 'new', t, t));
      inserted++;
    } else {
      const name = str(r.name, 160) || str(r.company_name, 160);
      if (!name) { skipped++; continue; }
      stmts.push(ctx.db.prepare(`INSERT INTO opportunities (id,workspace_id,name,company_name,value,currency,probability,owner_id,stage,requirements,notes,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(uid('opp'), ctx.workspace.id, name, str(r.company_name, 160), Number(String(r.value || '').replace(/[^0-9.]/g, '')) || 0, 'INR', 20,
          ctx.user.id, ['qualified','discovery','presales','proposal','negotiation','won','lost'].includes(str(r.stage)) ? str(r.stage) : 'qualified',
          str(r.requirements || r.requirement, 8000), str(r.notes, 8000), str(r.source, 80) || 'Import', t, t));
      inserted++;
    }
  }
  try {
    for (let i = 0; i < stmts.length; i += 50) await ctx.db.batch(stmts.slice(i, i + 50));
  } catch (e) { console.log('[import:error]', String(e)); return fail('Import failed while saving rows', 500); }
  await track(ctx.db, ctx.workspace.id, ctx.user.id, 'import_completed', { target, inserted });
  if (target === 'leads') { const c: any = await first(ctx.db, 'SELECT COUNT(*) c FROM leads WHERE workspace_id=?', [ctx.workspace.id]); if (c && c.c === inserted) await track(ctx.db, ctx.workspace.id, ctx.user.id, 'first_lead_created', { via: 'import' }); }
  return ok({ inserted, skipped });
};
