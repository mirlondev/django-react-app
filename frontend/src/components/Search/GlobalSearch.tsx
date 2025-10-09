import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  MessageSquare, 
  BookOpen, 
  User, 
  Calendar,
  Tag,
  Clock,
  Eye,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { searchAPI } from '../../services/searchAPI';

// Format date utility
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short', 
    day: 'numeric'
  });
};

// Status badge component
const getStatusBadge = (status) => {
  const statusConfig = {
    open: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    closed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || statusConfig.open}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

// Priority badge component
const getPriorityBadge = (priority) => {
  const priorityConfig = {
    low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority] || priorityConfig.low}`}>
      {priority}
    </span>
  );
};

// Difficulty badge component
const getDifficultyColor = (difficulty) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': 
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'intermediate': 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'advanced': 
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: 
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};




const GlobalSearch = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    tickets: [],
    procedures: [], 
    users: []
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  
    debounceRef.current = setTimeout(() => {
      if (query.trim().length >= 2) {
        handleSearch(query.trim());
      } else {
        setResults({ tickets: [], procedures: [], users: [] });
      }
    }, 300);
  
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleSearch = async (searchQuery) => {
    setLoading(true);
    try {
      const searchResults = await searchAPI.searchAll(searchQuery);
      setResults(searchResults); // le backend doit renvoyer { tickets:[], procedures:[], users:[] }
    } catch (error) {
      console.error('Search error:', error);
      setResults({ tickets: [], procedures: [], users: [] });
    } finally {
      setLoading(false);
    }
  };

  const getTotalResults = () => {
    return results.tickets.length + results.procedures.length + results.users.length;
  };

  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    return {
      tickets: activeTab === 'tickets' ? results.tickets : [],
      procedures: activeTab === 'procedures' ? results.procedures : [],
      users: activeTab === 'users' ? results.users : []
    };
  };

  const handleResultClick = (type, id) => {
    if (onNavigate) {
      onNavigate(type, id);
    }
    onClose();
  };

  if (!isOpen) return null;

  const filteredResults = getFilteredResults();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black bg-opacity-50">
      <div
        ref={searchRef}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[80vh] flex flex-col"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search tickets, procedures, users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 outline-none text-lg"
          />
          {loading && (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        {query.trim().length >= 2 && (
          <div className="flex border-b border-gray-200 dark:border-gray-700 px-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              All ({getTotalResults()})
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tickets'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tickets ({results.tickets.length})
            </button>
            <button
              onClick={() => setActiveTab('procedures')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'procedures'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Procedures ({results.procedures.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Users ({results.users.length})
            </button>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Search Everything</p>
              <p className="text-sm">Type at least 2 characters to search tickets, procedures, and users</p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Searching...</p>
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Tickets Section */}
              {filteredResults.tickets.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Tickets ({filteredResults.tickets.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredResults.tickets.map((ticket) => (
                      <button
                        key={ticket.id}
                        onClick={() => handleResultClick('tickets', ticket.id)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {ticket.code}
                              </span>
                              {getStatusBadge(ticket.status)}
                              {getPriorityBadge(ticket.priority)}
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {ticket.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {ticket.client.user.first_name} {ticket.client.user.last_name}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(ticket.created_at)}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Procedures Section */}
              {filteredResults.procedures.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    Procedures ({filteredResults.procedures.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredResults.procedures.map((procedure) => (
                      <button
                        key={procedure.id}
                        onClick={() => handleResultClick('procedures', procedure.id)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                {procedure.category}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(procedure.difficulty)}`}>
                                {procedure.difficulty}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {procedure.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                              {procedure.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {procedure.tags && procedure.tags.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <Tag className="h-3 w-3" />
                                  {procedure.tags.slice(0, 2).map(tag => tag.name).join(', ')}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {procedure.views} views
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(procedure.created_at)}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Section */}
              {filteredResults.users.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-500" />
                    Users ({filteredResults.users.length})
                  </h3>
                  <div className="space-y-2">
                    {filteredResults.users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleResultClick('users', user.id)}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                @{user.username}
                              </span>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                {user.userType}
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {user.first_name} {user.last_name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar className="h-3 w-3" />
                              Joined {formatDate(user.created_at)}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;