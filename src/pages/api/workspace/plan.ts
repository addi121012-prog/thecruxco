import type { APIRoute } from 'astro';
import { run } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { oneOf } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { isAdmin } from '../../../server/rbac';
import { track } from '../../../server/analytics';
export const prerender = false;
// NOTE: Billing is STUBBED. No payment gateway is wired yet. This activates a plan
// without charging so the trial gate + seat limits can be exercised. Swap the body
// for a Razorpay subscription callback when billing goes live.
const PLANS: any = { starter: { seats: 3 }, team: { seats: 10 }, business: { seats: 25 }, trial: { seats: 3 } };
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  if (!isAdmin(ctx.member)) return fail('Only admins can change the plan', 403);
  const plan = oneOf((await readBody(request)).plan, ['starter', 'team', 'business'], 'plan');
  await run(ctx.db, `UPDATE workspaces SET plan=?, plan_status='active', seats=? WHERE id=?`, [plan, PLANS[plan].seats, ctx.workspace.id]);
  await track(ctx.db, ctx.workspace.id, ctx.user.id, 'upgrade', { plan, stub: true });
  return ok({ plan });
};
