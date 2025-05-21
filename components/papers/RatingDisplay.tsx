'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

export default function RatingDisplay({ paperId }: { paperId: string }) {
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const res = await fetch(`/api/reviews/${paperId}/average-rating`);
        const data = await res.json();
        setAverageRating(data.average || 0);
      } catch (err) {
        console.error('Error fetching average rating:', err);
      }
    };
    fetchRating();
  }, [paperId]);

  if (averageRating === null) return <p>Loading rating...</p>;

  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="font-semibold text-gray-700">Average Rating:</span>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300'
            }`}
            fill={i < Math.round(averageRating) ? '#facc15' : 'none'}
          />
        ))}
      </div>
      <span className="text-sm text-gray-500">({averageRating.toFixed(1)})</span>
    </div>
  );
}
