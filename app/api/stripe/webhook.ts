import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { StripeWebhookEvent } from '../../../types/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable: NodeJS.ReadableStream) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const session = event.data.object as Stripe.Checkout.Session;

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(session);
        break;
      case 'checkout.session.async_payment_succeeded':
        await handleAsyncPaymentSucceeded(session);
        break;
      case 'checkout.session.async_payment_failed':
        await handleAsyncPaymentFailed(session);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error('Error handling webhook event:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }

  return res.status(200).json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  if (!session.metadata) return;

  if (session.metadata.type === 'support') {
    await recordSupportPayment(
      session.metadata.paperId as string,
      session.metadata.authorId as string,
      session.amount_total ? session.amount_total / 100 : 0
    );
  } else if (session.metadata.type === 'publishing') {
    await completePublishingPayment(session.customer_email as string);
  }
}

async function handleAsyncPaymentSucceeded(session: Stripe.Checkout.Session) {
  // Handle async payment success (like bank transfers)
}

async function handleAsyncPaymentFailed(session: Stripe.Checkout.Session) {
  // Notify user of payment failure
}

// Implement these with your actual database logic
async function recordSupportPayment(paperId: string, authorId: string, amount: number) {
  console.log(`Recording support payment: ${amount} for paper ${paperId} by author ${authorId}`);
  // Your database logic here
}

async function completePublishingPayment(email: string) {
  console.log(`Completing publishing payment for ${email}`);
  // Your database logic here
}