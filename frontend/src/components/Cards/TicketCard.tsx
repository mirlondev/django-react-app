import { FileText, ExternalLink } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const TicketCard = ({intervention}) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-black dark:text-white flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Related Ticket
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Ticket Code
          </span>
          <span className="font-medium text-black dark:text-white">
            {intervention.ticket.code?.substring(0, 8)}
          </span>
        </div>
        <div className="border-t pt-3 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Title</p>
          <p className="font-medium text-black dark:text-white">
            {intervention.ticket.title}
          </p>
        </div>
        {intervention.ticket.description && (
          <div className="border-t pt-3 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Description
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {intervention.ticket.description}
            </p>
          </div>
        )}
        <div className="pt-3">
          <Link
            to={`/tickets/${intervention.ticket.id}`}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ExternalLink className="w-4 h-4" />
            View Ticket Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TicketCard;
