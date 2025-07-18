'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import { useSearchParams } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const DonationForm = () => {
  const [papers, setPapers] = useState<{ _id: string; title: string }[]>([]);
  const [paperId, setPaperId] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [message, setMessage] = useState('');
  const stripe = useStripe();
  const elements = useElements();
  const searchParams = useSearchParams();

  useEffect(() => {
    const paperIdParam = searchParams.get('paperId');
    if (paperIdParam) setPaperId(paperIdParam);
  }, [searchParams]);

  useEffect(() => {
    const fetchPapers = async () => {
      const res = await fetch('/api/papers/approved');
      const data = await res.json();
      setPapers(data);
    };
    fetchPapers();
  }, []);

  const handlePresetClick = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(null);
    setCustomAmount(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    const finalAmount = amount || Number(customAmount);
    if (!finalAmount || finalAmount < 50) {
      setMessage('Please enter a valid amount (min 50 LKR)');
      return;
    }

    const res = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: finalAmount, paperId }),
    });

    const { clientSecret, error } = await res.json();
    if (error || !clientSecret) {
      setMessage('Error creating payment. Try again.');
      return;
    }

    const result = await stripe?.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements?.getElement(CardNumberElement)!,
        billing_details: {
          name: (document.getElementById('sender-name') as HTMLInputElement)?.value,
        },
      },
    });

    if (result?.error) {
      setMessage(`Payment failed: ${result.error.message}`);
    } else if (result?.paymentIntent?.status === 'succeeded') {
      setMessage('🎉 Donation successful! Thank you for your support.');
    }
  };

  return (
    <div className="pt-20 px-4">
      <div className="max-w-5xl mx-auto bg-[#b08f6a] rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Support the Author</h2>
        <div className="bg-white rounded-lg p-6 grid md:grid-cols-2 gap-6">
          {/* LEFT */}
          <div>
            <p className="text-gray-700 mb-4">
              Your contribution helps support ongoing research and open knowledge sharing.
            </p>

            <label className="block mb-2 font-semibold">Support for:</label>
            <select
              className="w-full border px-3 py-2 rounded mb-4"
              value={paperId}
              onChange={(e) => setPaperId(e.target.value)}
            >
              <option value="">General Support</option>
              {papers.map((paper) => (
                <option key={paper._id} value={paper._id}>
                  {paper.title}
                </option>
              ))}
            </select>

            <label className="block mb-2 font-semibold">Amount (LKR):</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  key={val}
                  type="button"
                  className={`px-4 py-2 rounded ${
                    amount === val ? 'bg-[#8a6c4f] text-white' : 'bg-[#b08f6a] text-white'
                  }`}
                  onClick={() => handlePresetClick(val)}
                >
                  Rs {val}
                </button>
              ))}
            </div>
            <input
              type="number"
              placeholder="Or enter custom amount"
              className="w-full border px-3 py-2 rounded"
              value={customAmount}
              onChange={handleCustomChange}
            />
          </div>

          {/* RIGHT */}
          <div>
            <h3 className="font-semibold mb-2">Payment Details</h3>
            <div className="space-y-3 mb-4">
              <CardNumberElement className="p-3 border rounded" />
              <CardExpiryElement className="p-3 border rounded" />
              <CardCvcElement className="p-3 border rounded" />
            </div>

            <label className="block mb-2 font-semibold">Your Name</label>
            <input
              type="text"
              id="sender-name"
              placeholder="Full Name"
              className="w-full border px-3 py-2 rounded mb-6"
            />

            <div className="text-center">
              <button
                onClick={handleSubmit}
                className="bg-[#b08f6a] text-white py-3 px-6 rounded hover:bg-[#8a6c4f] font-semibold"
              >
                Donate
              </button>
            </div>
            {message && (
              <p className="mt-4 text-center text-sm text-red-600 font-medium">{message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DonatePage() {
  return (
    <Elements stripe={stripePromise}>
      <DonationForm />
    </Elements>
  );
}
