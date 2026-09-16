import { defineMiddleware } from 'astro:middleware';
import { getDB } from './server/db';
import { getSessionUser } from './server/session';
import { loadContext } from './server/workspace';

export const onRequest = defineMiddleware(async (context, next) => {
  const { locals, request, url } = context;
  const path = url.pathname;
  const needsRuntime = path.startsWith('/app') || path.startsWith('/api');
  if (!needsRuntime) return next();

  try {
    const db = getDB(locals);
    const su = await getSessionUser(db, request);
    if (su) {
      const ctx = await loadContext(db, su.user);
      locals.user = su.user;
      locals.member = ctx.member;
      locals.workspace = ctx.workspace;
      locals.trial = ctx.trial;
      locals.session = su.session;
    } else {
      locals.user = null;
    }
  } catch {
    locals.user = null;
  }

  const isAuthApi = path.startsWith('/api/auth/');
  if (!locals.user && !isAuthApi) {
    if (path.startsWith('/api/')) {
      return new Response(JSON.stringify({ ok: false, error: 'Not authenticated' }), { status: 401, headers: { 'content-type': 'application/json' } });
    }
    return context.redirect(`/login?next=${encodeURIComponent(path)}`);
  }
  if (locals.user && !locals.workspace && path.startsWith('/app') && path !== '/app/onboarding') {
    return context.redirect('/app/onboarding');
  }
  return next();
});
