import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json()) as { planType?: 'PACK_10' | 'PRO' };
  const planType = body.planType === 'PRO' ? 'PRO' : 'PACK_10';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: planType === 'PRO' ? 'subscription' : 'payment',
    customer_email: session.user.email,
    metadata: {
      userId: session.user.id,
      planType,
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: planType === 'PRO' ? 1200 : 900,
          ...(planType === 'PRO' ? { recurring: { interval: 'month' } } : {}),
          product_data: {
            name:
              planType === 'PRO'
                ? 'VN Studio Pro (Unlimited Games)'
                : 'VN Studio +10 Extra Project Slots (One-Time)',
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard?upgraded=true`,
    cancel_url: `${appUrl}/pricing`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
