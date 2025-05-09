import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

interface PublishPaymentProps {
  onSuccess: () => void;
}

export default function PublishPayment({ onSuccess }: PublishPaymentProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const PUBLISHING_FEE = 10; // $10 fixed fee

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: PUBLISHING_FEE * 100,
          description: 'ScholarShare Publishing Fee',
          metadata: {
            type: 'publishing',
          },
          success_url: `${window.location.origin}/submit?payment=success`,
          cancel_url: `${window.location.origin}/submit`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const session = await response.json();
      const result = await stripe?.redirectToCheckout({ sessionId: session.id });

      if (result?.error) {
        throw result.error;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="publish-payment">
      <h3>Publishing Fee</h3>
      <p>As a Gold Publisher, you're required to pay a ${PUBLISHING_FEE} fee for this submission.</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <button onClick={handlePayment} disabled={isLoading}>
        {isLoading ? 'Processing...' : `Pay $${PUBLISHING_FEE}`}
      </button>
    </div>
  );
}