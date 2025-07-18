'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiStar } from 'react-icons/fi';

interface Props {
  paperId: string;
  onReviewSubmitted?: () => void;
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
          reviewerName: reviewerName.trim() || 'Anonymous'
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setMessage('');
        setRating(5);
        setReviewerName('');
        onReviewSubmitted?.();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Review submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="mt-6 space-y-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Name Field */}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <label className="block mb-1.5 text-sm font-medium text-[#5D4037]">
          Your Name (optional)
        </label>
        <input
          type="text"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
          className="w-full p-2.5 border border-[#D7CCC8] rounded-lg bg-[#EFEBE9] focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all"
          placeholder="How you'd like to be shown"
          maxLength={50}
        />
      </motion.div>
      
      {/* Review Field */}
      <motion.div
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <label className="block mb-1.5 text-sm font-medium text-[#5D4037]">
          Your Review <span className="text-[#C62828]">*</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2.5 border border-[#D7CCC8] rounded-lg bg-[#EFEBE9] focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all"
          rows={4}
          required
          placeholder="Share your thoughtful feedback about this paper..."
        />
      </motion.div>
      
      {/* Rating Field */}
      <div>
        <label className="block mb-1.5 text-sm font-medium text-[#5D4037]">
          Rating
        </label>
        <div className="flex items-center space-x-2">
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="p-2 border border-[#8D6E63] rounded-lg bg-[#EFEBE9] focus:ring-2 focus:ring-[#A1887F] focus:border-[#A1887F] transition-all"
          >
            {[1, 2, 3, 4, 5].map((r) => (
              <option key={r} value={r}>
                {r} star{r !== 1 ? 's' : ''}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {Array(5).fill(0).map((_, i) => (
              <FiStar
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-[#FFA000] fill-[#FFA000]' : 'text-[#D7CCC8]'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={submitting}
        className={`flex items-center justify-center w-full py-2.5 px-4 rounded-lg text-white font-medium ${
          submitting ? 'bg-[#8D6E63]' : 'bg-[#5D4037] hover:bg-[#3E2723]'
        } transition-colors`}
        whileHover={!submitting ? { scale: 1.02 } : {}}
        whileTap={!submitting ? { scale: 0.98 } : {}}
      >
        {submitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </motion.button>
      
      {/* Success Message */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="flex items-center p-3 text-sm text-[#2E7D32] bg-[#E8F5E9] rounded-lg"
        >
          <FiCheckCircle className="mr-2" />
          Review submitted successfully!
        </motion.div>
      )}
    </motion.form>
  );
}