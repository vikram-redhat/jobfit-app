import { createServerSupabase } from '@/lib/supabase-server';
import { createAdminSupabase } from '@/lib/supabase-admin';

async function assertAdmin() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Forbidden');
}

export async function GET() {
  try {
    await assertAdmin();
    const adminSupabase = createAdminSupabase();

    const [{ data: profiles }, { data: { users: authUsers } }, { data: jobs }] = await Promise.all([
      adminSupabase.from('profiles').select('*').order('created_at', { ascending: false }),
      adminSupabase.auth.admin.listUsers({ perPage: 1000 }),
      adminSupabase.from('jobs').select('user_id'),
    ]);

    const emailMap = Object.fromEntries(authUsers.map(u => [u.id, u.email]));

    // Count jobs per user from the jobs table (source of truth)
    const jobCounts = (jobs ?? []).reduce((acc, j) => {
      acc[j.user_id] = (acc[j.user_id] ?? 0) + 1;
      return acc;
    }, {});

    const rows = (profiles ?? []).map(p => ({
      user_id: p.user_id,
      full_name: p.full_name,
      email: emailMap[p.user_id] ?? p.email ?? '—',
      analysis_count: jobCounts[p.user_id] ?? 0,
      is_subscribed: p.is_subscribed ?? false,
      subscription_status: p.subscription_status ?? null,
      created_at: p.created_at,
    }));

    return Response.json(rows);
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}
