import type { APIRoute } from 'astro';
import { getDB } from '../../../server/db';
import { destroySession, clearCookie, isSecure } from '../../../server/session';
export const prerender = false;
async function doLogout(locals: App.Locals, request: Request) {
  try { const db = getDB(locals); await destroySession(db, request); } catch { /* ignore */ }
  return new Response(null, { status: 302, headers: { location: '/login', 'set-cookie': clearCookie(isSecure(request)) } });
}
export const POST: APIRoute = ({ locals, request }) => doLogout(locals, request);
export const GET: APIRoute = ({ locals, request }) => doLogout(locals, request);
