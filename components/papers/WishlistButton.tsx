'use client';

import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface WishlistButtonProps {
  paperId: string;
  style?: React.CSSProperties;
}

export default function WishlistButton({ paperId, style }: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const response = await fetch(`/api/user/saved-papers/check?paperId=${paperId}`, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        }
      } catch (error) {
        console.error('Error checking saved status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSavedStatus();
  }, [paperId]);

  const toggleSavedPaper = async () => {
    try {
      setLoading(true);
      
      // First update the saved papers status
      const response = await fetch('/api/user/saved-papers', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          paperId,
          action: isSaved ? 'remove' : 'add'
        })
      });

      if (response.status === 401) {
        toast.info('Please login to save papers');
        router.push('/login');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setIsSaved(data.isSaved);
        toast.success(
          data.isSaved 
            ? 'Added to your saved papers' 
            : 'Removed from your saved papers'
        );
        
        // Update bookshelf status based on the new saved state
        const bookshelfAction = data.isSaved ? 'addToReadingList' : 'remove';
        const bookshelfResponse = await fetch('/api/bookshelf', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            paperId,
            action: bookshelfAction
          })
        });

        if (!bookshelfResponse.ok) {
          const errorData = await bookshelfResponse.json();
          console.error('Failed to update bookshelf status:', errorData.error);
        }
      } else {
        throw new Error('Failed to update saved papers');
      }
    } catch (error) {
      console.error('Error toggling saved paper:', error);
      toast.error('Failed to update saved papers');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleSavedPaper}
      style={style}
      disabled={loading}
      aria-label={isSaved ? "Remove from saved papers" : "Add to saved papers"}
      className={`hover:opacity-80 transition-opacity ${loading ? 'cursor-wait' : 'cursor-pointer'}`}
    >
      {loading ? (
        <FiHeart size={24} className="animate-pulse text-gray-500" />
      ) : isSaved ? (
        <FaHeart size={24} className="text-red-500" />
      ) : (
        <FiHeart size={24} className="text-gray-700" />
      )}
    </button>
  );
}