import { createServerSupabase } from '@/lib/supabase-server';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { getStripe } from '@/lib/stripe';

export async function POST() {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, is_subscribed')
      .eq('user_id', user.id)
      .single();

    // Cancel active Stripe subscription if Pro
    if (profile?.is_subscribed && profile?.stripe_customer_id) {
      try {
        const subscriptions = await getStripe().subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1,
        });
        if (subscriptions.data.length > 0) {
          await getStripe().subscriptions.cancel(subscriptions.data[0].id);
        }
      } catch (e) {
        console.error('Stripe cancellation error during account delete:', e);
        // Continue with account deletion even if Stripe fails
      }
    }

    // Delete auth user — cascades to profiles and jobs via foreign key
    const adminSupabase = createAdminSupabase();
    const { error } = await adminSupabase.auth.admin.deleteUser(user.id);
    if (error) throw error;

    return Response.json({ ok: true });
  } catch (e) {
    console.error('Account delete error:', e);
    return new Response(e.message || 'Failed to delete account', { status: 500 });
  }
}
