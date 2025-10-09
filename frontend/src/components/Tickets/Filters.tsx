import React from "react";
import { Ticket } from "@/types/ticket";

interface FiltersProps {
  tickets: Ticket[];
  setFilteredTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const Filters: React.FC<FiltersProps> = ({
  tickets,
  setFilteredTickets,
  setCurrentPage,
}) => {
  const handleStatusChange = (status: string) => {
    if (status === "all") setFilteredTickets(tickets);
    else setFilteredTickets(tickets.filter((t) => t.status === status));
    setCurrentPage(1);
  };

  return (
    <div className="flex gap-2">
      <select
        onChange={(e) => handleStatusChange(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="all">All Status</option>
        <option value="open">Open</option>
        <option value="in-progress">In Progress</option>
        <option value="closed">Closed</option>
      </select>
    </div>
  );
};

export default Filters;
