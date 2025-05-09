import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { CheckoutSessionParams } from '../../../types/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const {
    amount,
    description,
    metadata,
    success_url,
    cancel_url,
    customer_email,
  } = req.body as CheckoutSessionParams;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: description || 'ScholarShare Payment',
          },
          unit_amount: Math.round(amount * 100), // amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: metadata || {},
      success_url: success_url || `${req.headers.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${req.headers.origin}/payment/canceled`,
      customer_email: customer_email,
    });

    return res.status(200).json({ id: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message });
  }
}