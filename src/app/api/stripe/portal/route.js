import { stripe } from '@/lib/stripe';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
      .from('profiles').select('stripe_customer_id').eq('user_id', user.id).single();

    if (!profile?.stripe_customer_id) {
      return new Response('No subscription found', { status: 400 });
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/dashboard`,
    });

    return Response.json({ url: session.url });
  } catch (e) {
    console.error('Portal error:', e);
    return new Response(e.message || 'Failed to open billing portal', { status: 500 });
  }
}
