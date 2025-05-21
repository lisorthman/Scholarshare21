'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  reviewerName: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export default function ReviewList({ paperId }: { paperId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/${paperId}`);
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [paperId]);

  if (loading) return <p>Loading reviews...</p>;

  if (reviews.length === 0) return <p className="text-gray-500">No reviews yet.</p>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="border p-3 rounded-lg bg-white shadow-sm"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-gray-800">{review.reviewerName}</span>
            <span className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-gray-600 mb-1">{review.comment}</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`text-yellow-500 ${i < review.rating ? '' : 'opacity-30'}`}>★</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
