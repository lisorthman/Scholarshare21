'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  reviewerName: string;
  message: string; // Changed from 'comment' to match your schema
  rating: number;
  createdAt: string;
}

export default function ReviewList({ paperId }: { paperId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews/${paperId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch reviews');
        }
        
        const data = await res.json();
        setReviews(data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [paperId]);

  if (loading) return <p className="text-gray-500">Loading reviews...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (reviews.length === 0) return <p className="text-gray-500">No reviews yet. Be the first to review!</p>;

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review._id}
          className="border p-4 rounded-lg bg-white shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-800">
              {review.reviewerName || 'Anonymous'}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{review.message}</p>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span 
                key={i} 
                className={`text-lg ${i < review.rating ? 'text-yellow-500' : 'text-grey-300'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}