import { createServerSupabase } from '@/lib/supabase-server';
import { getStripe } from '@/lib/stripe';

async function assertAdmin() {
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.ADMIN_EMAIL) throw new Error('Forbidden');
}

export async function GET() {
  try {
    await assertAdmin();
    const { data } = await getStripe().promotionCodes.list({ active: true, limit: 50, expand: ['data.coupon'] });
    const codes = data.map(pc => ({
      id: pc.id,
      code: pc.code,
      active: pc.active,
      times_redeemed: pc.times_redeemed,
      max_redemptions: pc.max_redemptions,
      discount: pc.coupon.percent_off
        ? `${pc.coupon.percent_off}% off`
        : `$${(pc.coupon.amount_off / 100).toFixed(2)} off`,
      duration: pc.coupon.duration,
    }));
    return Response.json(codes);
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function POST(request) {
  try {
    await assertAdmin();
    const { code, percentOff, amountOff, duration, maxRedemptions } = await request.json();

    if (!code?.trim()) return new Response('code is required', { status: 400 });
    if (!percentOff && !amountOff) return new Response('percentOff or amountOff required', { status: 400 });

    const couponParams = {
      duration: duration || 'once',
      ...(percentOff ? { percent_off: Number(percentOff) } : { amount_off: Math.round(Number(amountOff) * 100), currency: 'usd' }),
    };
    const coupon = await getStripe().coupons.create(couponParams);

    const promoParams = {
      coupon: coupon.id,
      code: code.trim().toUpperCase(),
      ...(maxRedemptions ? { max_redemptions: Number(maxRedemptions) } : {}),
    };
    const promoCode = await getStripe().promotionCodes.create(promoParams);

    return Response.json({ id: promoCode.id, code: promoCode.code });
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}

export async function DELETE(request) {
  try {
    await assertAdmin();
    const { id } = await request.json();
    await getStripe().promotionCodes.update(id, { active: false });
    return Response.json({ ok: true });
  } catch (e) {
    return new Response(e.message, { status: e.message === 'Forbidden' ? 403 : 500 });
  }
}
