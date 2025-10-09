// components/Rating/RatingCard.jsx
import React, { useState } from 'react';
import { User, Calendar } from 'lucide-react';
import RatingStars from './RatingStars';

const RatingCard = ({ rating, showUser = false }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <RatingStars rating={rating.rating} readonly={true} size="sm" setRating={undefined} />
          <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
            {rating.rating.toFixed(1)}
          </span>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(rating.created_at).toLocaleDateString()}
        </span>
      </div>
      
      {rating.comment && (
        <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
          {rating.comment}
        </p>
      )}
      
      {showUser && (
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <User className="w-3 h-3 mr-1" />
          <span>
            {rating.client_name || rating.technician_name}
          </span>
        </div>
      )}
    </div>
  );
};

export default RatingCard;