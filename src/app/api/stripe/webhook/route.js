import { stripe } from '@/lib/stripe';
import { createAdminSupabase } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    return new Response(`Webhook error: ${e.message}`, { status: 400 });
  }

  const adminSupabase = createAdminSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.metadata?.user_id) {
          await adminSupabase.from('profiles').update({
            is_subscribed: true,
            subscription_status: 'active',
            stripe_customer_id: session.customer,
          }).eq('user_id', session.metadata.user_id);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const active = sub.status === 'active';
        await adminSupabase.from('profiles').update({
          is_subscribed: active,
          subscription_status: sub.status,
          subscription_end_date: active ? null : new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('stripe_customer_id', sub.customer);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await adminSupabase.from('profiles').update({
          is_subscribed: false,
          subscription_status: 'cancelled',
          subscription_end_date: new Date(sub.current_period_end * 1000).toISOString(),
        }).eq('stripe_customer_id', sub.customer);
        break;
      }
    }
  } catch (e) {
    console.error('Webhook handler error:', e);
    return new Response('Handler error', { status: 500 });
  }

  return new Response('ok');
}
