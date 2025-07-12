'use client';

import { useState } from 'react';

interface Props {
  paperId: string;
  onReviewSubmitted?: () => void; // Optional callback
}

export default function ReviewForm({ paperId, onReviewSubmitted }: Props) {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          paperId, 
          message, 
          rating,
          reviewerName: reviewerName.trim() || 'Anonymous' // Fallback to Anonymous if empty
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setMessage('');
        setRating(5);
        setReviewerName('');
        onReviewSubmitted?.(); // Refresh reviews if callback provided
      }
    } catch (err) {
      console.error('Review submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label className="block mb-2 text-sm font-medium">Your Name (optional)</label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="How you'd like to be shown"
          maxLength={50}
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Your Review</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded"
          rows={4}
          required
          placeholder="Share your thoughts about this paper..."
        />
      </div>
      
      <div>
        <label className="block mb-2 text-sm font-medium">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-24 p-2 border border-gray-500 rounded"
        >
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} ★</option>
          ))}
        </select>
      </div>
      
      <button
        type="submit"
        disabled={submitting}
        className="bg-orange-900 text-white px-4 py-2 rounded hover:bg-amber-800 disabled:bg-orange-900"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
      
      {success && (
        <p className="text-red-900 mt-3">Review submitted successfully!</p>
      )}
    </form>
  );
}