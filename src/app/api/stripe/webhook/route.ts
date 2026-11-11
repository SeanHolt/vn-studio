import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planType = session.metadata?.planType;

    if (userId && planType === 'PRO') {
      await prisma.user.update({
        where: { id: userId },
        data: { planTier: 'PRO', maxProjects: 999 },
      });
    } else if (userId && planType === 'PACK_10') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          planTier: 'PACK_10',
          maxProjects: { increment: 10 },
        },
      });
    }
    const purchaseType = session.metadata?.purchaseType;
    const purchasedProjectId = session.metadata?.projectId;
    const paidCents = Number(session.metadata?.priceCents || 0);

    if (userId && purchaseType === 'GAME_UNLOCK' && purchasedProjectId) {
      await prisma.gamePurchase.upsert({
        where: {
          userId_projectId: {
            userId,
            projectId: purchasedProjectId,
          },
        },
        update: {},
        create: {
          userId,
          projectId: purchasedProjectId,
          amount: paidCents,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}
