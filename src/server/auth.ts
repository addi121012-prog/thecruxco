import { getDB } from './db';
import { getSessionUser } from './session';
import { loadContext } from './workspace';
import { fail } from './response';
export async function authContext(locals: App.Locals, request: Request) {
  const db = getDB(locals);
  const su = await getSessionUser(db, request);
  if (!su) return { db, user: null, member: null, workspace: null, trial: null, session: null };
  const ctx = await loadContext(db, su.user);
  return { db, user: su.user, member: ctx.member, workspace: ctx.workspace, trial: ctx.trial, session: su.session };
}
// Guard for API routes: returns {ctx} or a Response to return immediately.
export async function guardApi(locals: App.Locals, request: Request, opts: { write?: boolean } = {}) {
  const ctx = await authContext(locals, request);
  if (!ctx.user) return { error: fail('Not authenticated', 401) };
  if (!ctx.workspace) return { error: fail('No workspace', 403) };
  if (opts.write && ctx.trial && ctx.trial.expired) return { error: fail('Your free trial has ended. Upgrade to continue.', 402, { trialExpired: true }) };
  return { ctx };
}
