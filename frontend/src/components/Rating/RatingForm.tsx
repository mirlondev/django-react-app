// components/Rating/RatingForm.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import RatingStars from './RatingStars';

const RatingForm = ({ onSubmit, onCancel, title, technicianId, submitText = "Submit Rating" }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating > 0) {
      // On renvoie aussi le technicien concerné
      onSubmit({ technician: technicianId, rating, comment });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{title}</h2>
            <button 
              onClick={onCancel}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">Rating</label>
            <RatingStars rating={rating} setRating={setRating} />
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Comment (Optional)</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              placeholder="Share your experience..."
            ></textarea>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={rating === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingForm;
