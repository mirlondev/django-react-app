import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  Tag, 
  Eye, 
  Filter,
  ChevronDown,
  X,
  Plus,
  Clock,
  User,
  ArrowUpDown
} from 'lucide-react';
import { proceduresAPI } from '../../services/api';
import AuthenticatedLayout from '../../components/Auth/AuthenticatedLayout';
import Button from '../../components/ui/Button';
import Pagination from '../../components/Pagination/Pagination';
import { formatDate } from '../../utils/utils';

const ProceduresList = () => {
  const [procedures, setProcedures] = useState([]);
  const [filteredProcedures, setFilteredProcedures] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Network Infrastructure', 'Security', 'Troubleshooting', 'Installation', 'Configuration'];
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    fetchProcedures();
  }, []);

  useEffect(() => {
    let result = procedures;

  // Apply search filter
if (searchTerm) {
  try {
    result = result.filter((procedure) => {
      const tags = Array.isArray(procedure.tags)
        ? procedure.tags.join(" ")
        : (procedure.tags?.name || procedure.tags || "").toString();

      return (
        procedure.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        procedure.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tags.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  } catch (error) {
    console.log(error);
  }
}

   

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(procedure => procedure.category === categoryFilter);
    }

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      result = result.filter(procedure => procedure.difficulty === difficultyFilter);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredProcedures(result);
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, difficultyFilter, sortField, sortOrder, procedures]);

  const fetchProcedures = async () => {
    try {
      const response = await proceduresAPI.getAll();
      setProcedures(response.data);
    } catch (error) {
      console.error('Error fetching procedures:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProcedures.slice(indexOfFirstItem, indexOfLastItem);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

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

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-screen-2xl p-2 md:p-4 lg:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
            Knowledge Base
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
            Browse and search through all technical procedures and guides
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden mb-6">
          {/* Header with actions */}
          <div className="border-b border-gray-200 p-3 md:py-4 md:px-6 dark:border-gray-700">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search procedures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-gray-300 bg-transparent py-2 pl-9 pr-3 md:py-3 md:pl-12 md:pr-4 text-black outline-none transition focus:border-blue-500 active:border-blue-500 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 md:w-64"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-black transition hover:bg-opacity-90 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:px-4 md:py-3"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {showFilters ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-col  gap-2 mt-2 md:mt-0 sm:flex sm:flex-row">
                <Link to="/procedures/add">
                  <Button 
                    variant="primary" 
                    className="text-xs md:text-sm py-2 px-2 md:px-3 flex items-center gap-1 md:gap-2 w-full"
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">New Procedure</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-b border-gray-200 bg-gray-50 p-3 md:p-4 dark:border-gray-700 dark:bg-gray-700">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-4">
                <div>
                  <label className="mb-1 md:mb-2 block text-xs md:text-sm font-medium text-black dark:text-white">
                    Category
                  </label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 md:mb-2 block text-xs md:text-sm font-medium text-black dark:text-white">
                    Difficulty
                  </label>
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>
                        {difficulty === 'all' ? 'All Levels' : difficulty}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 md:mb-2 block text-xs md:text-sm font-medium text-black dark:text-white">
                    Sort By
                  </label>
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="title">Title</option>
                    <option value="views">Views</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Procedures Grid */}
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No procedures found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
              {currentItems.map((procedure) => (
                <article
                  key={procedure.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden"
                >
                  {procedure.featured_image && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={procedure.featured_image}
                        alt={procedure.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  
                  <div className="p-4 md:p-6">
                    {/* Category and Difficulty */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {procedure.category || 'General'}
                      </span>
                      {procedure.difficulty && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(procedure.difficulty)}`}>
                          {procedure.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
                      {procedure.title}
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm line-clamp-3 leading-relaxed">
                      {procedure.description}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(procedure.created_at)}</span>
                      </div>
                      {procedure.estimated_time && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{procedure.estimated_time}</span>
                        </div>
                      )}
                      {procedure.views && (
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{procedure.views} views</span>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {procedure.tags && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {procedure.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag.name}  {tag.slug}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action */}
                    <Link
                      to={`/procedures/${procedure.id}`}
                      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                    >
                      <BookOpen className="w-4 h-4" />
                      Read Procedure
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <Pagination
              totalItems={filteredProcedures.length}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setItemsPerPage={setItemsPerPage}
            />
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default ProceduresList;