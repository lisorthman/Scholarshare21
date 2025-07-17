// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-06-30.basil',
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const {
    amount,
    description,
    metadata,
    success_url,
    cancel_url,
    customer_email,
  } = body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description || 'ScholarShare Payment',
            },
            unit_amount: Math.round(amount), // amount should already be in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: metadata || {},
      success_url: success_url || `${req.nextUrl.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.nextUrl.origin}/payment/canceled`,
      customer_email: customer_email,
    });

    return NextResponse.json({ id: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
