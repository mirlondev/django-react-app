import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  onBack: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Ticket non trouvé</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Le ticket que vous recherchez n'existe pas ou vous n'avez pas la permission de le voir.
        </p>
        <button
          onClick={onBack}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retour aux tickets
        </button>
      </div>
    </div>
  );
};