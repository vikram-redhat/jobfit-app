import { createServerSupabase } from '@/lib/supabase-server';
import { createAdminSupabase } from '@/lib/supabase-admin';

async function assertAdmin() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Forbidden');
  return user;
}

export async function GET() {
  try {
    await assertAdmin();
    const adminSupabase = createAdminSupabase();

    const [{ data: profiles }, { data: setting }, { data: jobs }] = await Promise.all([
      adminSupabase.from('profiles').select('user_id, is_subscribed'),
      adminSupabase.from('app_settings').select('value').eq('key', 'free_tier_limit').single(),
      adminSupabase.from('jobs').select('user_id'),
    ]);

    const freeTierLimit = parseInt(setting?.value ?? '2', 10);

    const jobCounts = (jobs ?? []).reduce((acc, j) => {
      acc[j.user_id] = (acc[j.user_id] ?? 0) + 1;
      return acc;
    }, {});

    const totalUsers = profiles?.length ?? 0;
    const paidUsers = profiles?.filter(p => p.is_subscribed).length ?? 0;
    const totalAnalyses = Object.values(jobCounts).reduce((sum, n) => sum + n, 0);
    const usersAtLimit = profiles?.filter(p => !p.is_subscribed && (jobCounts[p.user_id] ?? 0) >= freeTierLimit).length ?? 0;

    return Response.json({ totalUsers, paidUsers, totalAnalyses, usersAtLimit, freeTierLimit });
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}
