'use client';

import { useState, useEffect } from 'react';
import { FiHeart } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

interface WishlistButtonProps {
  paperId: string;
  style?: React.CSSProperties;
}

export default function WishlistButton({ paperId, style }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWishlistStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`/api/wishlist/check?paperId=${paperId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setIsInWishlist(data.isInWishlist);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkWishlistStatus();
  }, [paperId]);

  const toggleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Handle case where user is not logged in
        // You might want to redirect to login or show a message
        return;
      }

      setLoading(true);
      const method = isInWishlist ? 'DELETE' : 'POST';
      const response = await fetch(`/api/wishlist/${paperId}`, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        setIsInWishlist(!isInWishlist);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <button style={style} disabled>
        <FiHeart size={24} color="#5D4037" />
      </button>
    );
  }

  return (
    <button 
      onClick={toggleWishlist}
      style={style}
      aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
    >
      {isInWishlist ? (
        <FaHeart size={24} color="#D32F2F" />
      ) : (
        <FiHeart size={24} color="#5D4037" />
      )}
    </button>
  );
}