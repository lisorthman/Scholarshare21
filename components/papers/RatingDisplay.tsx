'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function RatingDisplay({ paperId }: { paperId: string }) {
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reviews/${paperId}/average-rating`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch rating');
        }
        
        const data = await res.json();
        setAverageRating(data.average || 0);
        setReviewsCount(data.count || 0);
      } catch (err) {
        console.error('Error fetching average rating:', err);
        setError('Failed to load rating');
        setAverageRating(0);
        setReviewsCount(0);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRating();
  }, [paperId]);

  if (loading) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 h-6"
    >
      <div className="w-24 h-4 bg-[#EFEBE9] rounded-full animate-pulse"></div>
    </motion.div>
  );

  if (error) return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-[#C62828] bg-[#FFEBEE] px-3 py-1 rounded-full text-sm inline-flex items-center"
    >
      {error}
    </motion.div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2 mb-3"
    >
      <span className="font-medium text-[#5D4037]">Rating:</span>
      
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Star
              className={`w-5 h-5 ${
                i < Math.round(averageRating!) ? 'text-[#FFA000]' : 'text-[#D7CCC8]'
              }`}
              fill={i < Math.round(averageRating!) ? '#FFA000' : 'none'}
            />
          </motion.div>
        ))}
      </div>
      
      <motion.span 
        className="text-sm font-medium text-[#8D6E63]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {averageRating?.toFixed(1) || '0.0'}
      </motion.span>
      
      
    </motion.div>
  );
}