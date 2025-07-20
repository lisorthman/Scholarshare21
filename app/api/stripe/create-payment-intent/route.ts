import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, currency = 'lkr', paperId } = body;

    // Enhanced validation with currency-specific minimums
    const minAmount = currency === 'lkr' ? 60 : 0.5; // 60 LKR or $0.50 minimum
    if (!amount || isNaN(amount) || amount < minAmount) {
      return NextResponse.json(
        { error: `Minimum donation is ${minAmount} ${currency.toUpperCase()}` },
        { status: 400 }
      );
    }

    const convertedAmount = Math.round(amount * 100); // Convert to cents

    const paymentIntent = await stripe.paymentIntents.create({
      amount: convertedAmount,
      currency,
      metadata: { paperId: paperId || 'general-donation' },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error('Stripe error:', err.message);
    return NextResponse.json(
      { error: err.message || 'Payment processing failed' },
      { status: 500 }
    );
  }
}
