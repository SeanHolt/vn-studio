import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Sign in required to purchase games.' }, { status: 401 });
  }

  const body = (await request.json()) as { projectId?: string };
  if (!body.projectId) {
    return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: body.projectId },
    select: { id: true, title: true, priceCents: true, isPublished: true },
  });

  if (!project || !project.isPublished || project.priceCents <= 0) {
    return NextResponse.json({ error: 'Game is not available for purchase.' }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: session.user.email,
    metadata: {
      purchaseType: 'GAME_UNLOCK',
      userId: session.user.id,
      projectId: project.id,
      priceCents: String(project.priceCents),
    },
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: project.priceCents,
          product_data: {
            name: `VN Studio Game Pass: ${project.title}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/play/${project.id}?unlocked=true`,
    cancel_url: `${appUrl}/explore`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
