import React from "react";
import { Search, Filter, Plus } from "lucide-react";

const HeaderActions: React.FC = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tickets..."
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="flex space-x-2">
        <button className="flex items-center gap-1 border rounded px-3 py-2">
          <Filter className="w-4 h-4" /> Filters
        </button>
        <button className="flex items-center gap-1 bg-blue-600 text-white rounded px-3 py-2">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>
    </div>
  );
};

export default HeaderActions;
