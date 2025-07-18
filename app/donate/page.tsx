// app/donate/page.tsx
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';
import DonateForm from '@/components/DonateForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonatePage() {
  const searchParams = useSearchParams();
  const paperId = searchParams.get('paperId');

  return (
    <Elements stripe={stripePromise}>
      <DonateForm paperId={paperId} />
    </Elements>
  );
}