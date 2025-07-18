"use client";

import { useEffect, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

interface Paper {
  _id: string;
  title: string;
}

const presetAmounts = [50, 100, 500, 1000];

interface DonateFormProps {
  paperId: string | null;
}

export default function DonateForm({ paperId }: DonateFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  // Remove useSearchParams from here, use prop instead
  const initialPaperId = paperId;

  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<string | undefined>(initialPaperId || undefined);
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await fetch("/api/papers/approved");
        const data = await res.json();
        setPapers(data);
      } catch (err) {
        toast.error("Failed to load papers");
      }
    };
    fetchPapers();
  }, []);

  const handleAmountClick = (value: number) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) setAmount(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const res = await axios.post("/api/stripe/create-payment-intent", {
        amount,
        paperId: selectedPaper,
        name,
      });

      const clientSecret = res.data.clientSecret;

      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: { name },
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent?.status === "succeeded") {
        toast.success("Donation successful!");
      }
    } catch (err) {
      toast.error("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#f9f9f9] p-6 rounded-xl shadow-md w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Left Side */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Support the Publisher</h2>
        <p className="text-sm mb-3 text-gray-700">
          Your contribution helps support ongoing research.
        </p>

        <label className="block mb-2 text-sm font-medium">Support for:</label>
        <select
          value={selectedPaper}
          onChange={(e) => setSelectedPaper(e.target.value)}
          className="w-full mb-4 border px-3 py-2 rounded"
          required
        >
          <option value="">Select a Paper</option>
          {papers.map((paper) => (
            <option key={paper._id} value={paper._id}>
              {paper.title}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm font-medium">Amount (LKR):</label>
        <div className="flex gap-2 mb-3">
          {presetAmounts.map((amt) => (
            <button
              type="button"
              key={amt}
              onClick={() => handleAmountClick(amt)}
              className={`px-4 py-2 rounded border ${
                amount === amt ? "bg-[#8B4513] text-white" : "bg-white"
              }`}
            >
              Rs. {amt}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Custom Amount"
          value={customAmount}
          onChange={handleCustomAmount}
          className="w-full mb-4 border px-3 py-2 rounded"
        />
      </div>

      {/* Right Side */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>

        <label className="block mb-2 text-sm font-medium">Card Information</label>
        <div className="border p-3 mb-4 rounded">
          <CardElement />
        </div>

        <label className="block mb-2 text-sm font-medium">Your Name</label>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full mb-6 border px-3 py-2 rounded"
        />

        <button
          type="submit"
          className="w-full bg-[#8B4513] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#A0522D] transition"
          disabled={loading}
        >
          {loading ? "Processing..." : "Donate"}
        </button>
      </div>
    </form>
  );
}
