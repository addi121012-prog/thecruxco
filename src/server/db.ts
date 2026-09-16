// Thin helpers over the Cloudflare D1 binding.
export function getDB(locals: App.Locals): any {
  const db = locals?.runtime?.env?.DB;
  if (!db) throw new Error('D1 binding "DB" is not available on locals.runtime.env');
  return db;
}
export function getEnv(locals: App.Locals): Record<string, any> {
  return locals?.runtime?.env || {};
}
export async function all(db: any, sql: string, params: any[] = []): Promise<any[]> {
  const r = await db.prepare(sql).bind(...params).all();
  return r.results || [];
}
export async function first(db: any, sql: string, params: any[] = []): Promise<any> {
  return await db.prepare(sql).bind(...params).first();
}
export async function run(db: any, sql: string, params: any[] = []): Promise<any> {
  return await db.prepare(sql).bind(...params).run();
}
