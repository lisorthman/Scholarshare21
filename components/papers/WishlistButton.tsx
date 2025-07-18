'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Heart } from 'lucide-react';

interface WishlistButtonProps {
  paperId: string;
  style?: React.CSSProperties;
  onWishlistUpdate?: () => void;
}

export default function WishlistButton({ 
  paperId, 
  style, 
  onWishlistUpdate 
}: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  // Check saved status from both APIs
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const [savedResponse, bookshelfResponse] = await Promise.all([
          fetch(`/api/user/saved-papers/check?paperId=${paperId}`, {
            credentials: 'include'
          }),
          fetch(`/api/bookshelf?paperId=${paperId}`, {
            credentials: 'include'
          })
        ]);

        if (savedResponse.ok && bookshelfResponse.ok) {
          const [savedData, bookshelfData] = await Promise.all([
            savedResponse.json(),
            bookshelfResponse.json()
          ]);
          
          // Paper is saved if it exists in either collection
          const isInSavedPapers = savedData.isSaved;
          const isInBookshelf = bookshelfData.bookshelf?.some(
            (item: any) => item.paperId?.id === paperId && item.status === 'toread'
          );
          
          setIsSaved(isInSavedPapers || isInBookshelf);
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
      setProcessing(true);
      
      // Update both collections in parallel
      const [savedResponse, bookshelfResponse] = await Promise.all([
        fetch('/api/user/saved-papers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paperId,
            action: isSaved ? 'remove' : 'add'
          })
        }),
        fetch('/api/bookshelf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paperId,
            action: isSaved ? 'remove' : 'addToReadingList'
          })
        })
      ]);

      if (savedResponse.status === 401 || bookshelfResponse.status === 401) {
        toast.info('Please login to manage your wishlist');
        router.push('/login');
        return;
      }

      if (!savedResponse.ok || !bookshelfResponse.ok) {
        throw new Error('Failed to update wishlist');
      }

      const [savedData, bookshelfData] = await Promise.all([
        savedResponse.json(),
        bookshelfResponse.json()
      ]);

      // Determine new saved status from both responses
      const newSavedStatus = savedData.isSaved || 
        bookshelfData.bookshelf?.some(
          (item: any) => item.paperId?.id === paperId && item.status === 'toread'
        );

      setIsSaved(newSavedStatus);
      toast.success(
        newSavedStatus 
          ? 'Added to your wishlist' 
          : 'Removed from your wishlist'
      );

      if (onWishlistUpdate) {
        onWishlistUpdate();
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <button 
      onClick={toggleSavedPaper}
      disabled={loading || processing}
      aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
      className={`
        flex items-center justify-center gap-3
        px-5 py-3
        rounded-lg
        transition-all duration-200
        text-base font-medium
        ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        ${
          processing
            ? 'bg-[#EFEBE9] text-[#5D4037]'
            : isSaved 
              ? 'bg-[#FFEBEE] text-[#C62828] hover:bg-[#FFCDD2]'
              : 'bg-white text-[#5D4037] hover:bg-[#EFEBE9]'
        }
        border border-[#D7CCC8]
        min-w-[180px]
        shadow-sm hover:shadow-md
      `}
      style={style}
    >
      {loading ? (
        <>
          <Heart className="w-5 h-5 animate-pulse" />
          <span>Loading...</span>
        </>
      ) : processing ? (
        <>
          <Heart className="w-5 h-5 animate-pulse" />
          <span>{isSaved ? 'Removing...' : 'Adding...'}</span>
        </>
      ) : isSaved ? (
        <>
          <Heart className="w-5 h-5 fill-[#C62828] text-[#C62828]" />
          <span>In Your Wishlist</span>
        </>
      ) : (
        <>
          <Heart className="w-5 h-5" />
          <span>Add to Wishlist</span>
        </>
      )}
    </button>
  );
}