import React from 'react';
import { Star, StarHalf, StarOutline } from 'lucide-react';

const AverageRating = ({ rating, totalRatings, size = 'md' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

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
          <StarOutline key={i} className={`${sizeClasses[size]} text-yellow-400`} />
        ))}
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)} ({totalRatings} ratings)
      </span>
    </div>
  );
};

export default AverageRating;