// components/Rating/RatingStars.jsx
import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

const RatingStars = ({ rating, setRating, readonly = false, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly && setRating) {
      setRating(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  // If readonly, display the rating with half stars
  if (readonly) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center">
        <div className="flex mr-2">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className={`${sizeClasses[size]} text-yellow-400 fill-current`} />
          ))}
          {hasHalfStar && (
            <StarHalf className={`${sizeClasses[size]} text-yellow-400 fill-current`} />
          )}
          {[...Array(emptyStars)].map((_, i) => (
            <Star key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`} />
          ))}
        </div>
      </div>
    );
  }

  // Interactive rating stars
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hoverRating ? star <= hoverRating : star <= rating;
        return (
          <button
            key={star}
            type="button"
            className={`p-1 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            {filled ? (
              <Star className={`${sizeClasses[size]} text-yellow-400 fill-current`} />
            ) : (
              <Star className={`${sizeClasses[size]} text-gray-300`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;