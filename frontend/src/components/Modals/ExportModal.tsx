import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { exportAPI } from '../../services/api';

const ExportModal = ({ isOpen, onClose }) => {
  const [format, setFormat] = useState('pdf');
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getFileExtension = (format) => {
    switch (format) {
      case 'pdf': return 'pdf';
      case 'excel': return 'xlsx';
      default: return format;
    }
  };

  const handleExport = async (exportFormat) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await exportAPI.export(exportFormat, filters);
      
      // Check if response is valid
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Set filename based on content-disposition header or default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `tickets_export.${getFileExtension(exportFormat)}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (error.response.status === 403) {
          setError('You do not have permission to export tickets.');
        } else if (error.response.status === 404) {
          setError('Export endpoint not found. Please check the URL configuration.');
        } else {
          setError(`Export failed: ${error.response.data?.error || error.response.statusText}`);
        }
      } else if (error.request) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Export failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 dark:text-white">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full ext-">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Export Tickets</h2>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              disabled={loading}
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        
        <div className="p-6 border-t dark:border-gray-700 flex justify-end space-x-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            onClick={() => handleExport(format)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center disabled:opacity-50"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;