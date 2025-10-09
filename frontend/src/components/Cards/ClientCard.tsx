import React from 'react';
import { User, Mail, Phone, Building } from 'lucide-react';

interface ClientInfo {
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
  phone?: string;
  company?: string;
}

interface ClientCardProps {
  client: ClientInfo;
}

const ClientCard: React.FC<ClientCardProps> = ({ client }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <User className="w-5 h-5 mr-2" /> Client
      </h2>
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {client.user.first_name.charAt(0)}
          {client.user.last_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {client.user.first_name} {client.user.last_name}
          </h3>
          <div className="space-y-1 mt-2">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Mail className="w-3 h-3 mr-1" />
              <span className="truncate">{client.user.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Phone className="w-3 h-3 mr-1" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.company && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Building className="w-3 h-3 mr-1" />
                <span>{client.company}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;