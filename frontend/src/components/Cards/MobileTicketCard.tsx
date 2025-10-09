import React, { useRef } from "react";
import {
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  MessageSquare,
  User,
  UserCheck,
  Calendar,
  UserCheck as AssignIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/utils";
import { getPriorityBadge, getStatusBadge } from "../../utils/badge";
import { Ticket } from "../../types";

interface MobileTicketCardProps {
  ticket:Ticket[];
  setShowDeleteModal: (show: boolean) => void;
  setShowAssignModal: (show: boolean) => void;
  setSelectedTicket: (ticket: Ticket) => void;

  userType?: string;
}
const MobileTicketCard= ({
  ticket,
  setSelectedTicket,
  setShowDeleteModal,
  setShowAssignModal,
  userType,

}:MobileTicketCardProps) => {
  const actionMenuRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h5 className="font-medium text-black dark:text-white text-sm mb-1">
            {ticket.code}
          </h5>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-black dark:text-white font-medium text-sm truncate">
                {ticket.title}
              </p>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col items-center gap-1 mr-8">
          <div className="flex flex-row">
          <Link
            to={`/tickets/${ticket.id}`}
            className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
          {userType !== "technician" && (
            <Link
              to={`/tickets/${ticket.id}/edit`}
              className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Link>
          )}
          </div>
         
          <div className="mt-1">
            
          {userType === "admin" && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setSelectedTicket(ticket);
                setShowAssignModal(true);
              }}
              className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 rounded transition-colors"
              title="Assign to"
            >
              <AssignIcon className="h-4 w-4" />
            </button>
          )}
          
          {userType === "admin" && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setSelectedTicket(ticket);
                setShowDeleteModal(true);
              }}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <User className="h-3 w-3 text-purple-500 dark:text-purple-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Client
            </span>
          </div>
          <p className="text-black dark:text-white text-sm">
            {ticket?.client?.user.first_name} {ticket?.client?.user.last_name}
          </p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <UserCheck className="h-3 w-3 text-green-500 dark:text-green-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Technician
            </span>
          </div>
          {ticket.technician ? (
            <p className="text-black dark:text-white text-sm">
              {ticket?.technician?.user.first_name}{" "}
              {ticket?.technician?.user.last_name}
            </p>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Unassigned
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Created
            </span>
          </div>
          <span className="text-black dark:text-white text-sm">
            {formatDate(ticket.created_at)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Status
          </span>
          <div className="text-sm ">
         
         { getStatusBadge(ticket.status)}

          </div>
        </div>
        <div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
            Priority
          </span>
          <div className="text-sm">{getPriorityBadge(ticket.priority)}</div>
        </div>
      </div>
    </div>
  );
};

export default MobileTicketCard;