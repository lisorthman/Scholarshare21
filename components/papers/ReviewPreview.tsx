'use client';

import { useEffect, useState } from 'react';

interface Review {
  _id: string;
  reviewerName: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export default function ReviewPreview({ 
  paperId, 
  maxReviews = 1 
}: { 
  paperId: string; 
  maxReviews?: number 
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/${paperId}?limit=${maxReviews}`);
        const data = await res.json();
        setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [paperId, maxReviews]);

  return (
    <div className="space-y-3">
      <h3 className="font-medium text-gray-700">
        {maxReviews > 1 ? 'Recent Reviews' : 'Latest Review'}
      </h3>
      
      {loading ? (
        <p className="text-sm text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500">No reviews yet</p>
      ) : (
        reviews.map((review) => (
          <div key={review._id} className="text-sm">
            <div className="flex justify-between items-start">
              <span className="font-medium">{review.reviewerName}</span>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span 
                    key={i} 
                    className={`${i < review.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="text-gray-600 line-clamp-2 mt-1">{review.comment}</p>
          </div>
        ))
      )}
    </div>
  );
}