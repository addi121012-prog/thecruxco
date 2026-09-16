import type { APIRoute } from 'astro';
import { first, run, all } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str, oneOf, numOrNull, dateMsOrNull } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { canWrite } from '../../../server/rbac';
import { logActivity } from '../../../server/activity';
export const prerender = false;
const ST = ['draft', 'internal_review', 'sent', 'negotiation', 'accepted', 'rejected'];
export const PATCH: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission to edit proposals', 403);
  const p: any = await first(ctx.db, 'SELECT * FROM proposals WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!p) return fail('Proposal not found', 404);
  const b = await readBody(request);
  const status = b.status !== undefined ? oneOf(b.status, ST, 'status', p.status) : p.status;
  const f = {
    name: str(b.name ?? p.name, 200),
    version: str(b.version ?? p.version, 20),
    value: b.value !== undefined ? (numOrNull(b.value) || 0) : p.value,
    status,
    notes: str(b.notes ?? p.notes, 4000),
    expected_response_at: b.expected_response_at !== undefined ? dateMsOrNull(b.expected_response_at) : p.expected_response_at,
    sent_at: status === 'sent' && !p.sent_at ? Date.now() : p.sent_at,
  };
  await run(ctx.db, `UPDATE proposals SET name=?,version=?,value=?,status=?,notes=?,expected_response_at=?,sent_at=?,updated_at=? WHERE id=?`,
    [f.name, f.version, f.value, f.status, f.notes, f.expected_response_at, f.sent_at, Date.now(), p.id]);
  if (status !== p.status) {
    const oppStatus = status === 'sent' ? 'sent' : status === 'accepted' ? 'accepted' : status === 'rejected' ? 'rejected' : 'draft';
    await run(ctx.db, 'UPDATE opportunities SET proposal_status=?, updated_at=? WHERE id=?', [oppStatus, Date.now(), p.opportunity_id]);
    await logActivity(ctx.db, ctx.workspace.id, { entityType: 'opportunity', entityId: p.opportunity_id, userId: ctx.user.id, type: 'proposal', detail: `Proposal ${f.name} → ${status}` });
  }
  return ok();
};
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission to delete proposals', 403);
  const p: any = await first(ctx.db, 'SELECT * FROM proposals WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!p) return fail('Proposal not found', 404);
  const atts = await all(ctx.db, 'SELECT r2_key FROM attachments WHERE proposal_id=?', [p.id]);
  const bucket = locals?.runtime?.env?.ATTACHMENTS;
  if (bucket) { for (const a of atts) { try { await bucket.delete(a.r2_key); } catch {} } }
  await run(ctx.db, 'DELETE FROM attachments WHERE proposal_id=?', [p.id]);
  await run(ctx.db, 'DELETE FROM proposals WHERE id=?', [p.id]);
  return ok();
};
