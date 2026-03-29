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

    const [{ data: profiles }, { data: setting }] = await Promise.all([
      adminSupabase.from('profiles').select('analysis_count, is_subscribed'),
      adminSupabase.from('app_settings').select('value').eq('key', 'free_tier_limit').single(),
    ]);

    const freeTierLimit = parseInt(setting?.value ?? '2', 10);
    const totalUsers = profiles?.length ?? 0;
    const paidUsers = profiles?.filter(p => p.is_subscribed).length ?? 0;
    const totalAnalyses = profiles?.reduce((sum, p) => sum + (p.analysis_count ?? 0), 0) ?? 0;
    const usersAtLimit = profiles?.filter(p => !p.is_subscribed && (p.analysis_count ?? 0) >= freeTierLimit).length ?? 0;

    return Response.json({ totalUsers, paidUsers, totalAnalyses, usersAtLimit, freeTierLimit });
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}
