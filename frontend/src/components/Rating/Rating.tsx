import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

const Rating = ({ rating, setRating, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (!readonly) {
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
              <Star className="w-6 h-6 text-yellow-400 fill-current" />
            ) : (
              <Star className="w-6 h-6 text-gray-300" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Rating;