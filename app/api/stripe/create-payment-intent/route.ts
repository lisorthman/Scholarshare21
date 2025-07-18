import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { amount, paperId } = await req.json();

    if (!amount || isNaN(amount) || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid donation amount. Minimum is 50 LKR.' },
        { status: 400 }
      );
    }

    // Convert amount to cents (Stripe expects smallest currency unit)
    const convertedAmount = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertedAmount,
      currency: 'lkr',
      metadata: {
        paperId: paperId || 'general-donation',
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error('Stripe payment intent error:', error.message);
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}
