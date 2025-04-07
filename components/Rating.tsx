'use client';
import { useState, useEffect } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingProps {
  value?: number; // Current user's rating (0-5)
  average?: number; // Average rating (0-5)
  onChange?: (rating: number) => void; // Callback when user rates
  readOnly?: boolean; // If true, rating can't be changed
  size?: number; // Size of stars in pixels
  showAverage?: boolean; // Whether to show average rating
}

export default function Rating({
  value = 0,
  average = 0,
  onChange,
  readOnly = false,
  size = 20,
  showAverage = true,
}: RatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const handleMouseEnter = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };

  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index);
    }
  };

  const renderStar = (index: number) => {
    const ratingValue = hoverRating !== null ? hoverRating : displayValue;
    const averageValue = average;
    const isActive = index <= ratingValue;
    const isHalfActive = showAverage && !isActive && averageValue >= index - 0.5 && averageValue < index;

    return (
      <span
        key={index}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
        onClick={() => handleClick(index)}
        style={{
          cursor: readOnly ? 'default' : 'pointer',
          color: isActive ? '#FFD700' : isHalfActive ? '#FFD700' : '#D1D5DB',
          transition: 'color 0.2s',
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
        }}
      >
        {isHalfActive ? (
          <StarHalf size={size} fill="#FFD700" />
        ) : (
          <Star size={size} fill={isActive ? '#FFD700' : 'transparent'} />
        )}
      </span>
    );
  };

  return (
    <div className="rating-container" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <div className="stars" style={{ display: 'flex' }}>
        {[1, 2, 3, 4, 5].map(renderStar)}
      </div>
      
      {showAverage && isClient && average > 0 && (
        <span className="average-rating" style={{ 
          fontSize: `${size * 0.7}px`, 
          color: '#666', 
          marginLeft: '8px'
        }}>
          ({average.toFixed(1)})
        </span>
      )}
      
      {!readOnly && isClient && displayValue > 0 && (
        <span className="your-rating" style={{ 
          fontSize: `${size * 0.7}px`, 
          color: '#0070f3', 
          marginLeft: '8px',
          fontWeight: 'bold'
        }}>
          Your rating: {displayValue}
        </span>
      )}
    </div>
  );
}