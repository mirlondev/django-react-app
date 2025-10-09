import React from "react";
import { MoreVertical, Eye, Edit, Trash2, Ticket } from "lucide-react";
import { getStatusBadge, getPriorityBadge } from "../Badges/Badges";


interface TicketTableProps {
  tickets: Ticket[];
  currentItems: Ticket[];
  openActionMenu: number | null;
  setOpenActionMenu: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
  setShowAssignModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
}

const TicketTable: React.FC<TicketTableProps> = ({
  currentItems,
  openActionMenu,
  setOpenActionMenu,
  setSelectedTicket,
  setShowAssignModal,
  setShowDeleteModal,
  user,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">ID</th>
            <th className="p-2">Subject</th>
            <th className="p-2">Status</th>
            <th className="p-2">Priority</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((ticket) => (
            <tr key={ticket.id} className="border-b">
              <td className="p-2">{ticket.id}</td>
              <td className="p-2">{ticket.subject}</td>
              <td className="p-2">{getStatusBadge(ticket.status)}</td>
              <td className="p-2">{getPriorityBadge(ticket.priority)}</td>
              <td className="p-2 relative">
                <button
                  onClick={() =>
                    setOpenActionMenu(openActionMenu === ticket.id ? null : ticket.id)
                  }
                  className="p-1 rounded hover:bg-gray-200"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>

                {openActionMenu === ticket.id && (
                  <div className="absolute right-0 mt-1 bg-white border rounded shadow z-10">
                    <button className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    {user?.role === "admin" && (
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setShowDeleteModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 text-red-600"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
