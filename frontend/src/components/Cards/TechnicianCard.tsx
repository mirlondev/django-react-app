import React from 'react';
import { Users, Phone } from 'lucide-react';
import Button from '../ui/Button';

interface TechnicianInfo {
  user: {
    first_name: string;
    last_name: string;
  };
  phone?: string;
}

interface TechnicianCardProps {
  technician: TechnicianInfo;
}

export const TechnicianCard: React.FC<TechnicianCardProps> = ({ technician }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <Users className="w-5 h-5 mr-2" /> Technicien
      </h2>
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {technician.user.first_name.charAt(0)}
          {technician.user.last_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {technician.user.first_name} {technician.user.last_name}
          </h3>
          {technician.phone && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-2">
              <Phone className="w-3 h-3 mr-1" />
              <span>{technician.phone}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TechnicianCard;