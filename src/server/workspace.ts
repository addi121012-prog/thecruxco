import { first } from './db';
export const TRIAL_DAYS = 30;
export function trialStatus(ws: any) {
  if (!ws) return null;
  const ends = ws.trial_ends_at || 0;
  const msLeft = ends - Date.now();
  const daysLeft = Math.max(0, Math.ceil(msLeft / 86400000));
  const active = ws.plan_status === 'active';
  return {
    endsAt: ends,
    daysLeft,
    expired: !active && msLeft <= 0,
    active,
    planStatus: ws.plan_status,
    plan: ws.plan,
  };
}
export async function loadContext(db: any, user: any) {
  let member: any = null;
  if (user.current_workspace_id) {
    member = await first(db, 'SELECT * FROM memberships WHERE user_id=? AND workspace_id=? AND status=?', [user.id, user.current_workspace_id, 'active']);
  }
  if (!member) {
    member = await first(db, 'SELECT * FROM memberships WHERE user_id=? AND status=? ORDER BY created_at ASC LIMIT 1', [user.id, 'active']);
  }
  if (!member) return { member: null, workspace: null, trial: null };
  const workspace: any = await first(db, 'SELECT * FROM workspaces WHERE id=?', [member.workspace_id]);
  return { member, workspace, trial: trialStatus(workspace) };
}
