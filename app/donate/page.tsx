'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import DonateForm from '@/components/DonateForm';
import DashboardLayout from '@/components/DashboardLayout';
import { User } from '@/types/user';
import { useAuthContext } from '@/components/AuthProvider';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const stripeOptions = {
  mode: "payment" as const,
  currency: 'usd',
  appearance: {
    theme: "stripe" as const,
  },
};

function getToken() {
  if (typeof window === 'undefined') return null;
  // Try localStorage first
  let token = null;
  try {
    token = localStorage.getItem('token');
  } catch {}
  // Fallback to cookies
  if (!token && typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
    if (match) token = match[1];
  }
  return token;
}

export default function DonatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paperId = searchParams.get('paperId');
  const [checked, setChecked] = useState(false);
  const { user } = useAuthContext();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const callbackUrl = `/donate${paperId ? `?paperId=${paperId}` : ''}`;
      router.push(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } else {
      setChecked(true);
    }
  }, [router, paperId]);

  if (!checked) return null;

  return (
    <DashboardLayout user={user} defaultPage="Donate">
      <DonateForm paperId={paperId} />
    </DashboardLayout>
  );
}
