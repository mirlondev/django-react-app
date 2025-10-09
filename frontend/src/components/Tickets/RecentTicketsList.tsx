import React from "react";
import { ChevronRight, Eye, Users } from "lucide-react";
import { getPriorityBadge, getStatusBadge } from "../../utils/badge";
import { Link } from "react-router-dom";
import { Ticket } from "../../types";


interface RecentTicketsListProps {
  tickets: Ticket[];
  title?:string
}

const RecentTicketsList: React.FC<RecentTicketsListProps> = ({ tickets, title }) => {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200/60 dark:border-gray-700/60 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
          {title}
        </h2>
        <Link to={'/tickets'} className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center transition-colors duration-200">
          View all <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      <div className="divide-y divide-slate-200/60 dark:divide-gray-700/60">
        {tickets.slice(0, 5).map((ticket) => (
          <div
            key={ticket.id}
            className="px-6 py-4 hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-slate-800 dark:text-white mr-3">
                    {ticket.code} 
                  </h4>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white mr-3">{ticket.title}</h3>
                  <div className="flex space-x-2">
                  <span
                      className={`px-3 py-1 rounded-full text-xs font-medium `}
                    > {getPriorityBadge(ticket.priority)}
                    </span>
                     
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium `}
                    >
                      {getStatusBadge(ticket.status === "in_progress" ? "In Progress" : ticket.status)}
                    </span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {ticket.description}
                </p>
                <div className="text-sm text-slate-500 dark:text-gray-400 flex items-center flex-wrap">
                  <Users className="w-4 h-4 mr-1" />
                  <span className="mr-4 font-medium">{ticket.client.company_name}</span>
                  <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <Link to={`/tickets/${ticket.id}`}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 ml-4 flex items-center p-2 rounded-lg hover:bg-blue dark:hover:bg-gray-700 transition-all duration-200">
                  <Eye className="w-5 h-5" />
               
              </Link>
              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTicketsList;