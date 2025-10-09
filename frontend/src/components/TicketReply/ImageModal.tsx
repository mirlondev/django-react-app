import React from 'react';
import { X } from 'lucide-react';

interface ImageModalProps {
  selectedImage: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ selectedImage, onClose }) => {
  if (!selectedImage) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>
        <img
          src={selectedImage}
          alt="Image agrandie"
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};