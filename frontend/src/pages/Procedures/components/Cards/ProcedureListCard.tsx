import { ChevronRight } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import ProcedureCard from "./ProcedureCard";
const ProcedureListCard = ({proceduresData}) => {
  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Procédures de Réparation
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Guides et tutoriels pour les réparations courantes
              </p>
            </div>
            <Link
              to="/procedures"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center"
            >
              Voir tout
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proceduresData.slice(0, 3).map((procedure, index) => (
              <Link
                key={procedure.id}
                to={`/procedures/${procedure.id}`}
                className="block"
              >
                <ProcedureCard procedure={procedure} index={index} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProcedureListCard;
