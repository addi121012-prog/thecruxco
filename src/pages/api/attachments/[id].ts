import type { APIRoute } from 'astro';
import { first, run, getEnv } from '../../../server/db';
import { ok, fail } from '../../../server/response';
import { guardApi } from '../../../server/auth';
import { canWrite } from '../../../server/rbac';
export const prerender = false;
export const GET: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  const att: any = await first(ctx.db, 'SELECT * FROM attachments WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!att) return fail('File not found', 404);
  const bucket = getEnv(locals).ATTACHMENTS;
  if (!bucket) return fail('Storage not configured', 500);
  const obj = await bucket.get(att.r2_key);
  if (!obj) return fail('File not found in storage', 404);
  return new Response(obj.body, { headers: { 'content-type': att.content_type || 'application/octet-stream', 'content-disposition': `attachment; filename="${att.filename}"` } });
};
export const DELETE: APIRoute = async ({ locals, request, params }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission', 403);
  const att: any = await first(ctx.db, 'SELECT * FROM attachments WHERE id=? AND workspace_id=?', [params.id, ctx.workspace.id]);
  if (!att) return fail('File not found', 404);
  const bucket = getEnv(locals).ATTACHMENTS;
  if (bucket) { try { await bucket.delete(att.r2_key); } catch {} }
  await run(ctx.db, 'DELETE FROM attachments WHERE id=?', [att.id]);
  return ok();
};
