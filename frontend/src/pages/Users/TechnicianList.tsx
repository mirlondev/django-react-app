import React, { useState } from 'react';
import { Plus, Search, Mail, Phone, Wrench, Calendar, MoreVertical } from 'lucide-react';
import { Technician } from '../types';

interface TechnicianListProps {
  technicians: Technician[];
  onCreateTechnician?: () => void;
  onTechnicianSelect?: (technician: Technician) => void;
}

const TechnicianList: React.FC<TechnicianListProps> = ({ 
  technicians, 
  onCreateTechnician, 
  onTechnicianSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTechnicians = technicians.filter(tech => 
    tech.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSpecialtyBadge = (specialty: string) => {
    const colors = {
      hardware: 'bg-blue-100 text-blue-800 border-blue-200',
      software: 'bg-green-100 text-green-800 border-green-200',
      network: 'bg-purple-100 text-purple-800 border-purple-200',
      security: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[specialty as keyof typeof colors] || colors.hardware;
  };

  const getSpecialtyIcon = (specialty: string) => {
    // You could return different icons based on specialty
    return <Wrench className="w-4 h-4" />;
  };

  const getSpecialtyLabel = (specialty: string) => {
    const labels = {
      hardware: 'Matériel',
      software: 'Logiciel', 
      network: 'Réseau',
      security: 'Sécurité'
    };
    return labels[specialty as keyof typeof labels] || specialty;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
          <p className="text-gray-600 mt-1">{filteredTechnicians.length} technicians active</p>
        </div>
        <button
          onClick={onCreateTechnician}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Technician</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search technicians by name, email, or specialty..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Technician Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTechnicians.map((technician) => (
          <div
            key={technician.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTechnicianSelect?.(technician)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-lg">
                    {technician.user.first_name.charAt(0)}{technician.user.last_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {technician.user.first_name} {technician.user.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{technician.user.username}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 p-1 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <span className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full border ${getSpecialtyBadge(technician.specialty)}`}>
                {getSpecialtyIcon(technician.specialty)}
                <span>{getSpecialtyLabel(technician.specialty)}</span>
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 truncate">{technician.user.email}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{technician.phone}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Joined {formatDate(technician.created_at)}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Active Tickets</span>
                <span className="text-sm font-medium text-purple-600">7</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTechnicians.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
          <p className="text-gray-600">Try adjusting your search criteria.</p>
        </div>
      )}
    </div>
  );
};

export default TechnicianList;