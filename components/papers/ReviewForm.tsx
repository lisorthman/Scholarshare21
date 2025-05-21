"use client";

import { useState } from "react";

interface Props {
  paperId: string;
}

export default function ReviewForm({ paperId }: Props) {
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewerId, setReviewerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerId.trim()) return alert("Please enter your User ID");

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paperId, reviewerId, message, rating }),
      });

      if (res.ok) {
        setSuccess(true);
        setMessage("");
        setRating(5);
        setReviewerId("");
      }
    } catch (err) {
      console.error("Review submission failed", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <label className="block mb-2 text-sm font-medium">Your User ID</label>
      <input
        type="text"
        value={reviewerId}
        onChange={(e) => setReviewerId(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3"
        required
      />
      <label className="block mb-2 text-sm font-medium">Your Review</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-3"
        rows={4}
        required
      />
      <label className="block mb-2 text-sm font-medium">Rating</label>
      <select
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-24 p-2 border border-gray-300 rounded mb-4"
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>{r} ⭐</option>
        ))}
      </select>
      <br />
      <button
        type="submit"
        disabled={submitting}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
      {success && (
        <p className="text-green-600 mt-3">Review submitted successfully!</p>
      )}
    </form>
  );
}
