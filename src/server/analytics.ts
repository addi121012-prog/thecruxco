import { uid } from './ids';
export async function track(db: any, workspaceId: string | null, userId: string | null, event: string, props: any = {}) {
  try {
    await db.prepare('INSERT INTO analytics_events (id,workspace_id,user_id,event,props,created_at) VALUES (?,?,?,?,?,?)')
      .bind(uid('ev'), workspaceId, userId, event, JSON.stringify(props || {}), Date.now()).run();
  } catch { /* analytics must never break a request */ }
}
