import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil', // Use your actual Stripe API version
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'lkr', paperId } = body;

    // Validate amount
    if (!amount || isNaN(amount) || amount < 50) {
      return NextResponse.json(
        { error: 'Invalid donation amount. Minimum is 50 LKR.' },
        { status: 400 }
      );
    }

    // Stripe expects amount in the smallest currency unit (cents)
    const convertedAmount = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertedAmount,
      currency,
      metadata: {
        paperId: paperId || 'general-donation',
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Stripe payment intent error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
