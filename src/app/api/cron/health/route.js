// src/app/api/cron/health/route.js
//
// Daily Supabase liveness check. Does two jobs at once:
//
//   1. KEEPS THE PROJECT AWAKE. Supabase free tier auto-pauses a project after
//      ~7 days without *database* activity. In Sept 2026 that happened silently:
//      the DB paused, its hostname stopped resolving, and every login failed
//      with "Failed to fetch" while the static marketing pages kept serving —
//      so nothing looked broken from outside and no alert fired.
//
//      This must be a real Postgres round-trip to count as activity. Pinging
//      GoTrue's /auth/v1/health would NOT work: it never touches the database.
//
//   2. ALERTS when the DB is unreachable, by email via Resend.
//
// Auth: Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is
// set on the project. The route is public in middleware (cron requests carry no
// Supabase session), so this header check is the only thing guarding it.

import { createAdminSupabase } from '@/lib/supabase-admin';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic'; // never statically optimized or cached
export const maxDuration = 30;

const ALERT_TO =
  process.env.ALERT_EMAIL || process.env.ADMIN_EMAIL || 'help@jobfit.today';
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://jobfit.today';

// A single probe: read one row from app_settings. Cheap, hits Postgres for
// real, and works whether or not the table has rows.
async function probe() {
  const supabase = createAdminSupabase();
  const started = Date.now();
  const { error } = await supabase.from('app_settings').select('*').limit(1);
  return { ok: !error, ms: Date.now() - started, error: error?.message ?? null };
}

// Retry before declaring failure. During the Sept 2026 restore the endpoint
// flapped 521 -> 502 -> 200 within ninety seconds; a single bad read is noise,
// three spread over ~6s is a real outage.
async function probeWithRetries(attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    last = await probe();
    if (last.ok) return { ...last, attempts: i + 1 };
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 3000));
  }
  return { ...last, attempts };
}

async function sendAlert(result) {
  if (!process.env.RESEND_API_KEY) {
    console.error('[cron/health] DB unreachable and RESEND_API_KEY is unset — no alert sent.');
    return false;
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: ALERT_TO,
      subject: '🔴 JobFit: Supabase unreachable — logins are down',
      text: [
        `The daily health check could not reach Supabase after ${result.attempts} attempts.`,
        '',
        `Error: ${result.error || 'unknown'}`,
        `Checked: ${new Date().toISOString()}`,
        '',
        'Users cannot sign in, sign up, or run analyses right now. The marketing',
        'pages will still be serving normally, so the site looks healthy.',
        '',
        'Most likely cause: the Supabase free-tier project auto-paused after ~7',
        'days of inactivity. Check https://supabase.com/dashboard and hit Restore',
        'if it shows Paused — a restore takes roughly 2-5 minutes and needs no',
        'redeploy, since the project URL and keys do not change.',
        '',
        `Site: ${SITE_URL}`,
      ].join('\n'),
    });
    return true;
  } catch (e) {
    console.error('[cron/health] alert send failed:', e?.message);
    return false;
  }
}

export async function GET(request) {
  const secret = process.env.CRON_SECRET;

  // Fail closed. Without a secret configured this would be an open endpoint
  // that anyone could use to drive service-role queries.
  if (!secret) {
    console.error('[cron/health] CRON_SECRET is not set — refusing to run.');
    return Response.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await probeWithRetries();

  if (result.ok) {
    console.log(`[cron/health] ok in ${result.ms}ms (attempt ${result.attempts})`);
    return Response.json({ status: 'ok', latencyMs: result.ms, attempts: result.attempts });
  }

  console.error(`[cron/health] FAILED after ${result.attempts} attempts: ${result.error}`);
  const alerted = await sendAlert(result);

  // 503 so Vercel logs it as a failed cron run and it surfaces in the dashboard.
  return Response.json(
    { status: 'unhealthy', error: result.error, attempts: result.attempts, alerted },
    { status: 503 }
  );
}
