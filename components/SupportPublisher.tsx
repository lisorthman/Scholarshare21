import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Paper } from '../types/stripe';

interface SupportPublisherProps {
  paper: Paper;
}

export default function SupportPublisher({ paper }: SupportPublisherProps) {
  const [amount, setAmount] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          amount: amount * 100,
          description: `Support for "${paper.title}"`,
          metadata: {
            paperId: paper.id,
            authorId: paper.authorId,
            type: 'support',
          },
          success_url: `${window.location.origin}/papers/${paper.id}?payment=success`,
          cancel_url: `${window.location.origin}/papers/${paper.id}`,
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
    <div className="support-dialog">
      <h3>Support the Author</h3>
      <p>Your contribution helps support ongoing research.</p>
      
      <form onSubmit={handleSubmit}>
        <div className="amount-selector">
          <label>Amount (USD):</label>
          <input 
            type="number" 
            min="1" 
            step="1" 
            value={amount} 
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))} 
          />
        </div>
        
        {error !== null && <div className="error-message">{error}</div>}
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
}