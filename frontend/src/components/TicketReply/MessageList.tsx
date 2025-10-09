import React from 'react';
import { MessageSquare, Filter, ChevronDown, MessageCircle, Clock } from 'lucide-react';

export type MessageType = {
  type: "original" | "intervention" | "whatsapp";
  id: string;
  message: string;
  user_id: string;
  user_type: "client" | "technician" | "whatsapp" | "admin";
  timestamp: string;
  user_name: string;
  direction?: "inbound" | "outbound";
  status?: string;
};

interface MessagesListProps {
  messages: MessageType[];
  messageFilter: "all" | "interventions" | "whatsapp";
  showFilterDropdown: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  onFilterChange: (filter: "all" | "interventions" | "whatsapp") => void;
  onToggleFilterDropdown: () => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  messageFilter,
  showFilterDropdown,
  messagesEndRef,
  onFilterChange,
  onToggleFilterDropdown,
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Messages Header with Filter */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Conversation ({messages.length})
          </h2>
          <div className="relative">
            <button
              onClick={onToggleFilterDropdown}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              {messageFilter === "all" ? "Tous" : messageFilter === "interventions" ? "Interventions" : "WhatsApp"}
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-10">
                <button
                  onClick={() => onFilterChange("all")}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Tous les messages
                </button>
                <button
                  onClick={() => onFilterChange("interventions")}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  Interventions uniquement
                </button>
                <button
                  onClick={() => onFilterChange("whatsapp")}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  WhatsApp uniquement
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="p-6 max-h-96 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                message.user_type === "client" 
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : message.user_type === "technician"
                  ? "bg-gradient-to-br from-green-500 to-blue-600"
                  : message.user_type === "whatsapp"
                  ? "bg-gradient-to-br from-green-600 to-green-700"
                  : "bg-gradient-to-br from-gray-500 to-gray-600"
              }`}>
                {message.type === "whatsapp" ? (
                  <MessageCircle className="w-5 h-5" />
                ) : (
                  message.user_name.split(" ").map(n => n.charAt(0)).join("").substring(0, 2)
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {message.user_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      message.type === "original"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : message.type === "intervention"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    }`}>
                      {message.type === "original" ? "Description initiale" : 
                       message.type === "intervention" ? "Intervention" : "WhatsApp"}
                    </span>
                    {message.direction && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        message.direction === "inbound" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {message.direction === "inbound" ? "Reçu" : "Envoyé"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDate(message.timestamp)}
                  </span>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>

                {message.status && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Statut: {message.status}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};