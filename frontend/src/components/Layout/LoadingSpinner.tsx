import React from 'react';

const LoadingSpinner: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
    <div className="flex items-center justify-center h-screen">
      <div className="text-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <span className="text-lg font-medium text-slate-600 dark:text-gray-400">Please wait Loading ......</span>
      </div>
    </div>
  </div>
  );
};

export default LoadingSpinner;