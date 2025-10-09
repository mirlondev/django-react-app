import React, { useState, useEffect } from "react";
import { X, BookOpen, Search, FileText } from "lucide-react";
import { proceduresAPI } from "../../services/api";

const ProceduresCard = ({ onClose }) => {
  const [procedures, setProcedures] = useState([]);
  const [filteredProcedures, setFilteredProcedures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProcedures();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = procedures.filter(procedure =>
        procedure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        procedure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (procedure.tags && procedure.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredProcedures(filtered);
    } else {
      setFilteredProcedures(procedures);
    }
  }, [searchTerm, procedures]);

  const fetchProcedures = async () => {
    try {
      const response = await proceduresAPI.getAll();
      setProcedures(response.data);
      setFilteredProcedures(response.data);
    } catch (error) {
      console.error("Error fetching procedures:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Base de connaissances</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedProcedure ? (
          <div>
            <button 
              onClick={() => setSelectedProcedure(null)}
              className="mb-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              <X className="w-4 h-4 mr-1" /> Retour à la liste
            </button>
            
            <div className="prose dark:prose-invert max-w-none">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedProcedure.title}
              </h1>
              
              <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedProcedure.description}
                </p>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Étapes de résolution
              </h2>
              
              <div 
                className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                dangerouslySetInnerHTML={{ 
                  __html: selectedProcedure.steps.replace(/\n/g, '<br/>') 
                }}
              />
              
              {selectedProcedure.tags && (
                <div className="mt-6">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tags: </span>
                  {selectedProcedure.tags.split(',').map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                    >
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une procédure..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {filteredProcedures.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune procédure trouvée</p>
                </div>
              ) : (
                filteredProcedures.map((procedure) => (
                  <div
                    key={procedure.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => setSelectedProcedure(procedure)}
                  >
                    <div className="flex items-start mb-2">
                      <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg mr-3">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {procedure.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                      {procedure.description}
                    </p>
                    {procedure.tags && (
                      <div className="mt-3">
                        {procedure.tags.split(',').slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-block bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                        {procedure.tags.split(',').length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{procedure.tags.split(',').length - 2} plus
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProceduresCard;