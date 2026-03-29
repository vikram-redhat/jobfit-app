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
    const { data } = await adminSupabase.from('app_settings').select('*');
    return Response.json(Object.fromEntries((data ?? []).map(r => [r.key, r.value])));
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function PUT(request) {
  try {
    await assertAdmin();
    const { key, value } = await request.json();
    if (!key || value === undefined) return new Response('key and value required', { status: 400 });

    const adminSupabase = createAdminSupabase();
    await adminSupabase.from('app_settings').upsert({ key, value: String(value) }, { onConflict: 'key' });
    return Response.json({ ok: true });
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}
