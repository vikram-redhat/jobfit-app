import { getStripe } from '@/lib/stripe';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const supabase = createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response('Unauthorized', { status: 401 });

    const { data: profile } = await supabase
      .from('profiles').select('stripe_customer_id, full_name, is_subscribed').eq('user_id', user.id).single();

    if (profile?.is_subscribed) {
      return new Response('Already subscribed', { status: 400 });
    }

    // Get or create Stripe customer
    let customerId = profile?.stripe_customer_id;
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: user.email,
        name: profile?.full_name,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('user_id', user.id);
    }

    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL;

    const session = await getStripe().checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?upgraded=1`,
      cancel_url: `${origin}/upgrade`,
      metadata: { user_id: user.id },
    });

    return Response.json({ url: session.url });
  } catch (e) {
    console.error('Checkout error:', e);
    return new Response(e.message || 'Failed to create checkout session', { status: 500 });
  }
}
