'use client';
import { useState } from 'react';

interface Review {
  _id: string;
  reviewerId: string;
  message: string;
  rating: number;
  createdAt: string;
}

export default function ReviewSection({ paperId, existingReviews }: { paperId: string; existingReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(existingReviews || []);
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const userId = localStorage.getItem('userId') || ''; // Or use context/session if available

  const submitReview = async () => {
    if (!message.trim()) return alert("Please write a review.");

    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId, reviewerId: userId, message, rating }),
      });
      const data = await res.json();

      if (res.ok) {
        setReviews(prev => [...prev, { _id: Date.now().toString(), reviewerId: userId, message, rating, createdAt: new Date().toISOString() }]);
        setMessage('');
        setRating(5);
        alert("Review submitted!");
      } else {
        alert(data.error || "Error submitting review");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ paddingTop: '30px' }}>
      <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Reviews</h2>

      {reviews.length === 0 && <p>No reviews yet. Be the first to leave one!</p>}

      {reviews.map((r, i) => (
        <div key={i} style={{ background: '#f1f1f1', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
          <strong>Rating: {r.rating}/5</strong>
          <p>{r.message}</p>
          <small style={{ color: '#666' }}>Posted on {new Date(r.createdAt).toLocaleDateString()}</small>
        </div>
      ))}

      <h3 style={{ marginTop: '20px' }}>Leave a Review</h3>
      <textarea
        rows={4}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Your review..."
        style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}
      />
      <div style={{ marginBottom: '10px' }}>
        <label>Rating: </label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={e => setRating(parseInt(e.target.value))}
        />
      </div>
      <button
        onClick={submitReview}
        disabled={submitting}
        style={{
          backgroundColor: '#0070f3',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          padding: '10px 20px',
          cursor: 'pointer',
        }}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </div>
  );
}
