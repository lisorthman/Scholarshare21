'use client';

import { Elements } from '@stripe/react-stripe-js';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import DonateForm from '@/components/DonateForm';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function DonateClientSection() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = searchParams.get('paperId');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/signin?callbackUrl=/donate${paperId ? `?paperId=${paperId}` : ''}`);
    }
  }, [status, router, paperId]);

  if (status === 'loading') return <div>Loading...</div>;
  if (!session) return null; // Already redirecting

  return (
    <Elements stripe={stripePromise}>
      <DonateForm paperId={paperId} />
    </Elements>
  );
}
