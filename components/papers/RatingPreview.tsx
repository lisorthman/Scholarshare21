'use client';

import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RatingPreview({ paperId }: { paperId: string }) {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/reviews/${paperId}/average-rating`);
        const data = await res.json();
        setAverageRating(data.average || 0);
        setRatingCount(data.count || 0);
      } catch (err) {
        console.error('Error fetching average rating:', err);
      }
    };
    fetchRating();
  }, [paperId]);

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-gray-700">Community Rating</h3>
      {averageRating !== null ? (
        <>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'
                }`}
                fill={i < Math.round(averageRating) ? '#facc15' : 'none'}
              />
            ))}
            <span className="text-sm ml-1">({averageRating.toFixed(1)})</span>
          </div>
          <p className="text-xs text-gray-500">{ratingCount} ratings</p>
        </>
      ) : (
        <p className="text-sm text-gray-500">Loading ratings...</p>
      )}
    </div>
  );
}