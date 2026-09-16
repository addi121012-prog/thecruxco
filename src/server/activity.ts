import { uid } from './ids';
export async function logActivity(db: any, workspaceId: string, opts: { entityType: string; entityId: string; userId?: string | null; type: string; detail?: string | null }) {
  try {
    await db.prepare('INSERT INTO activities (id,workspace_id,entity_type,entity_id,user_id,type,detail,created_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(uid('act'), workspaceId, opts.entityType, opts.entityId, opts.userId || null, opts.type, opts.detail || null, Date.now()).run();
  } catch { /* ignore */ }
}
