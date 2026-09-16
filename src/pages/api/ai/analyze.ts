import type { APIRoute } from 'astro';
import { getEnv, first, all } from '../../../server/db';
import { readBody, ok, fail } from '../../../server/response';
import { str } from '../../../server/validate';
import { guardApi } from '../../../server/auth';
import { track } from '../../../server/analytics';
export const prerender = false;
export const POST: APIRoute = async ({ locals, request }) => {
  const g = await guardApi(locals, request); if (g.error) return g.error;
  const { ctx } = g;
  const env = getEnv(locals);
  const b = await readBody(request);
  const opp: any = await first(ctx.db, 'SELECT * FROM opportunities WHERE id=? AND workspace_id=?', [str(b.opportunityId, 60), ctx.workspace.id]);
  if (!opp) return fail('Opportunity not found', 404);
  if (!env.ANTHROPIC_API_KEY) {
    return ok({ configured: false, message: 'AI analysis is not configured yet. Add an ANTHROPIC_API_KEY to enable it.' });
  }
  const ps: any = await first(ctx.db, 'SELECT * FROM presales WHERE opportunity_id=?', [opp.id]);
  const proposals = await all(ctx.db, 'SELECT name,version,status,value,sent_at FROM proposals WHERE opportunity_id=?', [opp.id]);
  const fmtDate = (ms: any) => ms ? new Date(Number(ms)).toISOString().slice(0, 10) : 'not set';
  const ctxText = [
    `Opportunity: ${opp.name}`,
    `Company: ${opp.company_name || 'n/a'}`,
    `Stage: ${opp.stage}  |  Deal value: INR ${opp.value || 0}  |  Probability: ${opp.probability || 0}%`,
    `Expected close: ${fmtDate(opp.expected_close)}  |  Next action: ${opp.next_action || 'none'}  |  Follow-up: ${fmtDate(opp.follow_up_at)}`,
    `Requirements: ${opp.requirements || 'none recorded'}`,
    `Notes: ${opp.notes || 'none'}`,
    ps ? `Pre-Sales status: ${ps.status}. Problem: ${ps.customer_problem || '-'}. Functional: ${ps.functional_requirements || '-'}. Technical: ${ps.technical_requirements || '-'}. Integrations: ${ps.integrations || '-'}. Open questions: ${ps.open_questions || '-'}.` : 'Pre-Sales: not started.',
    proposals.length ? `Proposals: ${proposals.map((p: any) => `${p.name} (${p.status})`).join('; ')}` : 'Proposals: none yet.',
    `Today: ${new Date().toISOString().slice(0, 10)}`,
  ].join('\n');
  const prompt = `You are a pragmatic B2B sales/pre-sales advisor. Analyze this opportunity and reply in GitHub-flavoured markdown with EXACTLY these sections and headings:\n\n## Deal Health\n(One of: Healthy / Watch / At Risk — plus one sentence why.)\n\n## Summary\n(2-3 sentences.)\n\n## Missing Information\n(Bullets of the key unknowns a rep should fill in.)\n\n## Risks\n(Bullets.)\n\n## Recommended Next Action\n(One concrete next step.)\n\n## Suggested Discovery Questions\n(3-5 sharp questions.)\n\nBe specific and concise. Do not invent facts not implied by the context.\n\n--- OPPORTUNITY CONTEXT ---\n${ctxText}`;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: env.AI_MODEL || 'claude-3-5-haiku-latest', max_tokens: 900, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!res.ok) { const tx = await res.text(); console.log('[ai:error]', res.status, tx.slice(0, 300)); return fail('AI service error. Check your API key and try again.', 502); }
    const data: any = await res.json();
    const text = (data.content && data.content[0] && data.content[0].text) || 'No analysis returned.';
    await track(ctx.db, ctx.workspace.id, ctx.user.id, 'ai_analyze', { opp: opp.id });
    return ok({ configured: true, analysis: text });
  } catch (e) {
    console.log('[ai:exception]', String(e));
    return fail('Could not reach the AI service', 502);
  }
};
