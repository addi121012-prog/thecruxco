import type { APIRoute } from 'astro';
import { getDB, first, run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { req, ValidationError } from '../../../server/validate';
import { uid, slugify } from '../../../server/ids';
import { getSessionUser } from '../../../server/session';
import { track } from '../../../server/analytics';
import { TRIAL_DAYS } from '../../../server/workspace';
export const prerender = false;
export const POST: APIRoute = async ({ locals, request }) => {
  try {
    const db = getDB(locals);
    const su = await getSessionUser(db, request);
    if (!su) return fail('Not authenticated', 401);
    const name = req((await readBody(request)).name, 'Company name', 120);
    const t = Date.now();
    const wsId = uid('ws');
    const trialEnds = t + TRIAL_DAYS * 86400000;
    await run(db, 'INSERT INTO workspaces (id,name,slug,created_by,plan,plan_status,seats,trial_ends_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)',
      [wsId, name, slugify(name), su.user.id, 'trial', 'trial', 3, trialEnds, t]);
    await run(db, 'INSERT INTO memberships (id,workspace_id,user_id,role,status,created_at) VALUES (?,?,?,?,?,?)',
      [uid('mem'), wsId, su.user.id, 'admin', 'active', t]);
    await run(db, 'UPDATE users SET current_workspace_id=? WHERE id=?', [wsId, su.user.id]);
    await track(db, wsId, su.user.id, 'workspace_created', { name });
    return ok({ redirect: '/app', workspaceId: wsId });
  } catch (e) {
    if (e instanceof ValidationError) return fail(e.message);
    console.log('[ws:create:error]', String(e));
    return fail('Could not create workspace', 500);
  }
};
