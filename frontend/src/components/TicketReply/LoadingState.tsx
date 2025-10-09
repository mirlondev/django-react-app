import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
        <h2 className="text-xl font-semibold mb-2">Chargement du ticket</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Veuillez patienter...
        </p>
      </div>
    </div>
  );
};