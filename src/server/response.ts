export function json(data: any, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } });
}
export function ok(data: any = {}): Response { return json({ ok: true, ...data }); }
export function fail(message: string, status = 400, extra: any = {}): Response {
  return json({ ok: false, error: message, ...extra }, status);
}
export async function readBody(request: Request): Promise<any> {
  const ct = request.headers.get('content-type') || '';
  try {
    if (ct.includes('application/json')) return await request.json();
    if (ct.includes('form')) {
      const f = await request.formData(); const o: any = {};
      for (const [k, v] of f.entries()) o[k] = v;
      return o;
    }
  } catch { /* fall through */ }
  return {};
}
