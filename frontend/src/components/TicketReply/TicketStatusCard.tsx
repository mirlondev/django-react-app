import React from 'react';
import { Tag, Calendar, Clock, AlertCircle, CheckCircle, Clock as ClockIcon, XCircle } from 'lucide-react';

interface TicketStatusCardProps {
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export const TicketStatusCard: React.FC<TicketStatusCardProps> = ({
  status,
  priority,
  createdAt,
  updatedAt,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, { icon: React.ReactElement; color: string }> = {
      open: {
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-orange-500",
      },
      resolved: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-500",
      },
      in_progress: {
        icon: <ClockIcon className="w-4 h-4" />,
        color: "text-blue-500",
      },
      closed: { icon: <XCircle className="w-4 h-4" />, color: "text-gray-500" },
    };
    const statusInfo = icons[status] || icons.open;
    return <span className={statusInfo.color}>{statusInfo.icon}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const classes: Record<string, string> = {
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          classes[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Unknown"}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Tag className="w-5 h-5 mr-2" /> Statut
      </h2>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Statut actuel
          </span>
          <div className="flex items-center gap-2">
            {getStatusIcon(status)}
            <span className="font-medium capitalize text-gray-900 dark:text-white">
              {status.replace("_", " ")}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Priorité
          </span>
          {getPriorityBadge(priority)}
        </div>
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
            <Calendar className="w-3 h-3 mr-1" />
            Créé: {formatDate(createdAt)}
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            Modifié: {formatDate(updatedAt)}
          </div>
        </div>
      </div>
    </div>
  );
};