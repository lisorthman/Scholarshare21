
import { Stripe } from 'stripe';

export interface Paper {
  id: string;
  title: string;
  author: string;
  authorId: string;
  keywords: string[];
  category?: string;
  createdAt: Date;
  downloads?: number;
}

export interface CheckoutSessionParams {
  amount: number;
  description?: string;
  metadata?: Stripe.MetadataParam;
  success_url?: string;
  cancel_url?: string;
  customer_email?: string;
}

export interface StripeWebhookEvent {
  type: string;
  data: {
    object: Stripe.Checkout.Session;
  };
}