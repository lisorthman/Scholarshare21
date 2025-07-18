'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar } from 'react-icons/fi';

interface Review {
  _id: string;
  reviewerName: string;
  message: string;
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

  if (loading) return (
    <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#5D4037]"></div>
    </div>
  );

  if (error) return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 text-center text-[#C62828] bg-[#FFEBEE] rounded-lg"
    >
      {error}
    </motion.div>
  );

  if (reviews.length === 0) return (
    <motion.p 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8 text-[#5D4037]"
    >
      No reviews yet. Be the first to review!
    </motion.p>
  );

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {reviews.map((review) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-[#D7CCC8] p-5 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-semibold text-[#3E2723]">
                {review.reviewerName || 'Anonymous'}
              </span>
              <span className="text-sm text-[#8D6E63]">
                {new Date(review.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
            
            <p className="text-[#5D4037] mb-3">{review.message}</p>
            
            <div className="flex items-center">
              <div className="flex gap-1 mr-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'text-[#FFA000] fill-[#FFA000]' : 'text-[#D7CCC8]'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-[#8D6E63]">
                {review.rating.toFixed(1)} rating
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}