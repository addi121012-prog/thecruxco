// Pluggable email. Console driver by default; Resend when RESEND_API_KEY is set.
export async function sendEmail(env: any, to: string, subject: string, html: string, text?: string) {
  const key = env?.RESEND_API_KEY;
  if (!key) {
    console.log('[email:console]', JSON.stringify({ to, subject, text: text || html.replace(/<[^>]+>/g, ' ') }));
    return { sent: false, reason: 'no-provider' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: 'The Crux <noreply@thecruxco.com>', to, subject, html, text }),
    });
    return { sent: res.ok };
  } catch (e) { console.log('[email:error]', String(e)); return { sent: false }; }
}
