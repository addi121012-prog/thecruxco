import type { APIRoute } from 'astro';
import { all, first, run, getEnv } from '../../../server/db';
import { ok, fail } from '../../../server/response';
import { guardApi } from '../../../server/auth';
import { canWrite } from '../../../server/rbac';
import { uid } from '../../../server/ids';
export const prerender = false;
const MAX = 10 * 1024 * 1024;
const ALLOWED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/png', 'image/jpeg', 'text/csv', 'text/plain', 'application/zip'];
export const GET: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const proposalId = new URL(request.url).searchParams.get('proposal_id');
  const rows = await all(g.ctx.db, 'SELECT id,filename,content_type,size,created_at FROM attachments WHERE workspace_id=? AND proposal_id=? ORDER BY created_at DESC', [g.ctx.workspace.id, proposalId]);
  return ok({ attachments: rows });
};
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request, { write: true }); if (g.error) return g.error;
  const { ctx } = g;
  if (!canWrite(ctx.member)) return fail('You do not have permission to upload files', 403);
  const bucket = getEnv(locals).ATTACHMENTS;
  if (!bucket) return fail('File storage is not configured (R2 bucket missing)', 500);
  let form: FormData;
  try { form = await request.formData(); } catch { return fail('Invalid upload'); }
  const file: any = form.get('file');
  const proposalId = String(form.get('proposalId') || '');
  if (!file || typeof file.arrayBuffer !== 'function') return fail('No file provided');
  if (file.size > MAX) return fail('File is too large (max 10 MB)');
  const ctype = file.type || 'application/octet-stream';
  if (!ALLOWED.includes(ctype)) return fail('That file type is not allowed');
  const prop: any = await first(ctx.db, 'SELECT * FROM proposals WHERE id=? AND workspace_id=?', [proposalId, ctx.workspace.id]);
  if (!prop) return fail('Proposal not found', 404);
  const id = uid('att');
  const safeName = String(file.name || 'file').replace(/[^\w.\- ]+/g, '_').slice(0, 120);
  const key = `ws/${ctx.workspace.id}/prop/${prop.id}/${id}-${safeName}`;
  try {
    await bucket.put(key, await file.arrayBuffer(), { httpMetadata: { contentType: ctype } });
  } catch (e) { console.log('[r2:put]', String(e)); return fail('Upload failed', 500); }
  await run(ctx.db, 'INSERT INTO attachments (id,workspace_id,proposal_id,opportunity_id,filename,content_type,size,r2_key,uploaded_by,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
    [id, ctx.workspace.id, prop.id, prop.opportunity_id, safeName, ctype, file.size, key, ctx.user.id, Date.now()]);
  return ok({ id, filename: safeName });
};
