import React, { useState, useRef } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  FileText,
  User,
  Calendar,
  Clock,
  Truck,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Intervention } from "../../types";
import { formatCurrency, formatHours, formatDate } from "../../utils/utils";
import { getStatusBadge } from "../../utils/badge";

interface MobileInterventionCardProps {
  intervention: Intervention;
  setSelectedIntervention: (intervention: Intervention) => void;
  setShowDeleteModal: (show: boolean) => void;
  userType?: string;
}

const MobileInterventionCard: React.FC<MobileInterventionCardProps> = ({
  intervention,
  setSelectedIntervention,
  setShowDeleteModal,
  userType,
}) => {
  const actionMenuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h5 className="font-medium text-black dark:text-white text-sm mb-1">
            {intervention.code.substring(0, 8)}
          </h5>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-white font-medium text-sm truncate">
                {intervention.ticket.title}
              </p>
              
            </div>
          </div>
        </div>
        
        {/* Action buttons in 2 groups */}
        <div className="flex  gap-2 pl-8 justify-end w-full">
          {/* First group */}
          <div className="">
            <Link
              to={`/interventions/${intervention.id}`}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            </div>
            <div>
            <Link
              to={`/interventions/${intervention.id}/edit`}
              className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </div>


                    {/* Second group */}
            {userType !== "technician" && (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedIntervention(intervention);
                  setShowDeleteModal(true);
                }}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded transition-colors"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              {/* Empty space for alignment */}
              <div className="w-7 h-7"></div>
            </div>
          )}
          

        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <User className="h-3 w-3 text-green-500 dark:text-green-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Technician
            </span>
          </div>
          {intervention.technician ? (
            <p className="text-black dark:text-white text-sm truncate">
              {intervention.technician.user.first_name}{" "}
              {intervention.technician.user.last_name}
            </p>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Unassigned
            </span>
          )}
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Date
            </span>
          </div>
          <span className="text-black dark:text-white text-sm">
            {formatDate(intervention.intervention_date)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Hours
            </span>
          </div>
          <span className="text-black dark:text-white text-sm">
            {formatHours(intervention?.hours_worked)}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Truck className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Travel
            </span>
          </div>
          <span className="text-black dark:text-white text-sm">
            {formatHours(intervention?.travel_time)}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Cost
            </span>
          </div>
          <span className="text-black dark:text-white text-sm">
            {formatCurrency(intervention.total_cost)}
          </span>
        </div>
      </div>

      <div className="text-center">
          {getStatusBadge(
            intervention.status)}
        

      </div>
    </div>
  );
};

export default MobileInterventionCard;