import type { APIRoute } from 'astro';
import { all, first } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { req, str, oneOf, numOrNull, dateMsOrNull, ValidationError } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWrite } from '../../../server/rbac';
import { uid } from '../../../server/ids';
import { logActivity } from '../../../server/activity';
import { track } from '../../../server/analytics';
export const prerender = false;
const ST = ['draft', 'internal_review', 'sent', 'negotiation', 'accepted', 'rejected'];
export const GET: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  const oppId = new URL(request.url).searchParams.get('opportunity_id');
  let sql = `SELECT p.*, o.name AS opp_name, o.company_name FROM proposals p LEFT JOIN opportunities o ON o.id=p.opportunity_id WHERE p.workspace_id=?`;
  const pr: any[] = [ctx.workspace.id];
  if (oppId) { sql += ' AND p.opportunity_id=?'; pr.push(oppId); }
  sql += ' ORDER BY p.created_at DESC LIMIT 500';
  return ok({ proposals: await all(ctx.db, sql, pr) });
};
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission to add proposals', 403);
  try {
    const b = await readBody(request);
    const opp: any = await first(ctx.db, 'SELECT * FROM opportunities WHERE id=? AND workspace_id=?', [str(b.opportunity_id, 60), ctx.workspace.id]);
    if (!opp) return fail('Opportunity not found', 404);
    const name = req(b.name, 'Proposal name', 200);
    const status = oneOf(b.status, ST, 'status', 'draft');
    const t = Date.now(); const id = uid('prop');
    const sentAt = status === 'sent' ? t : null;
    await ctx.db.prepare(`INSERT INTO proposals (id,workspace_id,opportunity_id,name,version,value,status,owner_id,notes,created_at,sent_at,expected_response_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .bind(id, ctx.workspace.id, opp.id, name, str(b.version, 20) || 'v1', numOrNull(b.value) || opp.value || 0, status, str(b.owner_id, 60) || ctx.user.id, str(b.notes, 4000), t, sentAt, dateMsOrNull(b.expected_response_at), t).run();
    if (status === 'sent') await ctx.db.prepare(`UPDATE opportunities SET proposal_status='sent', updated_at=? WHERE id=?`).bind(t, opp.id).run();
    await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: opp.id, userId: ctx.user.id, type: 'proposal', detail: `Proposal ${name} (${status})` });
    const cnt: any = await first(ctx.db, 'SELECT COUNT(*) c FROM proposals WHERE workspace_id=?', [ctx.workspace.id]);
    if (cnt && cnt.c === 1) await track(ctx.db, ctx.workspace.id, ctx.user.id, 'first_proposal_created', {});
    return ok({ id });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    return fail('Could not create proposal', 500);
  }
};
