import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api, { ticketsAPI, techniciansAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Technician, Ticket } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import ExportModal from "../../components/Modals/ExportModal";
import Pagination from "../../components/Pagination/Pagination";
import { formatDate } from "../../utils/utils";
import Button from "../../components/ui/Button";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";
import MobileTicketCard from "../../components/Cards/MobileTicketCard";
import { getPriorityBadge, getStatusBadge } from "../../utils/badge";

const TicketList = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Fetch tickets and technicians
  useEffect(() => {
    fetchTickets();
    if (user?.userType === "admin") {
      fetchTechnicians();
    }
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getAll();
      setTickets(response.data);
      setFilteredTickets(response.data);
    } catch (error) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await techniciansAPI.getAll();
      setTechnicians(response.data);
    } catch (error) {
      toast.error("Failed to load technicians");
    }
  };

  // Filter and sort tickets
  useEffect(() => {
    let result = tickets;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.client.user.first_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ticket.client.user.last_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (ticket.technician &&
            (ticket.technician.user.first_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              ticket.technician.user.last_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((ticket) => ticket.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((ticket) => ticket.priority === priorityFilter);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortField as keyof Ticket] > b[sortField as keyof Ticket]
          ? 1
          : -1;
      } else {
        return a[sortField as keyof Ticket] < b[sortField as keyof Ticket]
          ? 1
          : -1;
      }
    });

    setFilteredTickets(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [tickets, searchTerm, statusFilter, priorityFilter, sortField, sortOrder]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;

    try {
      await ticketsAPI.delete(selectedTicket.id);
      toast.success("Ticket deleted successfully");
      setShowDeleteModal(false);
      fetchTickets();
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  const navigate = useNavigate();

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;
    navigate(`/update/${selectedTicket}`);

    try {
      await ticketsAPI.update(selectedTicket.id);
      toast.success("Ticket updated successfully");
      setShowDeleteModal(false);
      fetchTickets();
    } catch (error) {
      toast.error("Failed to delete ticket");
    }
  };

  const handleAssignTicket = async () => {
    if (!selectedTicket || !selectedTechnician) return;

    try {
      setAssignLoading(true);

      // selectedTechnician doit être une string UUID, pas { technician_id: ... }
      //const payload = { technician_id: selectedTechnician };

      await ticketsAPI.assign(selectedTicket.id, selectedTechnician);

      toast.success("Ticket assigned successfully");

      setShowAssignModal(false);
      setSelectedTechnician("");
      fetchTickets();
    } catch (error: any) {

      // Si le technicien est déjà assigné
      if (error.response?.data?.error === "Technician already assigned") {
        toast.error("This technician is already assigned to this ticket");
      } else {
        toast.error("Failed to assign ticket");
      }
    } finally {
      setAssignLoading(false);
    }
  };



  const StatusFilter = () => (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:bg-gray-700"
    >
      <option value="all">All Status</option>
      <option value="open">Open</option>
      <option value="in_progress">In Progress</option>
      <option value="closed">Closed</option>
    </select>
  );

  const PriorityFilter = () => (
    <select
      value={priorityFilter}
      onChange={(e) => setPriorityFilter(e.target.value)}
      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:bg-gray-700"
    >
      <option value="all">All Priority</option>
      <option value="low">Low</option>
      <option value="medium">Medium</option>
      <option value="high">High</option>
    </select>
  );

  const ItemsPerPageSelector = () => (
    <select
      value={itemsPerPage}
      onChange={(e) => setItemsPerPage(Number(e.target.value))}
      className="rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary dark:bg-gray-700"
    >
      <option value="5">5 per page</option>
      <option value="10">10 per page</option>
      <option value="20">20 per page</option>
      <option value="50">50 per page</option>
    </select>
  );

  const SortHeader = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <th
      className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </div>
    </th>
  );

  const AssignModal = () => {
    if (!selectedTicket) return null;

    return (
      <div className="fixed left-0 top-0 z-50 flex h-full min-h-screen w-full items-center justify-center bg-black/90 px-4 py-5">
        <div className="w-full max-w-lg rounded-lg bg-white px-8 py-12 dark:bg-gray-800 md:px-17.5 md:py-15">
          <h2 className="mb-6 text-2xl font-bold text-black dark:text-white">
            Assign Technician
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Assign a technician to ticket:{" "}
            <strong className="text-black dark:text-white">
              {selectedTicket.title}
            </strong>
          </p>

          <div className="mb-8">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Select Technician
            </label>
            <select
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              className="w-full rounded-lg border-[1.5px] border-gray-300 bg-transparent px-4 py-3 text-black outline-none transition focus:border-blue-500 active:border-blue-500 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500"
            >
              <option value="">Select a technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.user.first_name} {tech.user.last_name} ({tech.specialty}
                  )
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-end sm:gap-6">
            <button
              onClick={() => {
                setShowAssignModal(false);
                setSelectedTechnician("");
              }}
              className="block rounded border border-gray-300 bg-gray-200 px-6 py-3 text-center font-medium text-black transition hover:border-red-500 hover:bg-red-500 hover:text-white dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:border-red-500 dark:hover:bg-red-500"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignTicket}
              disabled={!selectedTechnician || assignLoading}
              className="block rounded bg-blue-500 px-6 py-3 text-center font-medium text-white transition hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignLoading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 dark:border-blue-400"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-screen-2xl p-2 md:p-4 lg:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
            Support Tickets
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
            Manage and track all support requests
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          {/* Header with actions */}
          <div className="border-b border-gray-200 p-3 md:py-4 md:px-6 dark:border-gray-700">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-gray-300 bg-transparent py-2 pl-9 pr-3 md:py-3 md:pl-12 md:pr-4 text-black outline-none transition focus:border-blue-500 active:border-blue-500 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 md:w-64"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-center text-sm font-medium text-black transition hover:bg-opacity-90 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:px-4 md:py-3"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {showFilters ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex flex-col gap-3 mt-2 max-w-full md:flex-row md:items-center">
                <Button
                  onClick={() => setShowExportModal(true)}
                  variant="secondary"
                  className="w-full md:w-auto px-2 md:py-3 inline-flex justify-center"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">Export</span>
                </Button>

                {user?.userType !== "technician" && (
                  <Link to="/tickets/add" className="w-full md:w-auto block">
                    <Button
                      variant="primary"
                      className="w-full md:w-auto p-2 md:px-4 md:py-3 inline-flex justify-center"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">New Ticket</span>
                      <span className="sm:hidden ml-2">New</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-b border-gray-200 bg-gray-50 p-3 md:p-4 dark:border-gray-700 dark:bg-gray-700">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 md:mb-2 block text-xs md:text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <StatusFilter />
                </div>
                <div>
                  <label className="mb-1 md:mb-2 block text-xs md:text-sm font-medium text-black dark:text-white">
                    Priority
                  </label>
                  <PriorityFilter />
                </div>
              </div>
            </div>
          )}

          {/* Mobile Cards View (visible on small screens) */}
          <div className="block lg:hidden">
            {currentItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No tickets found
              </div>
            ) : (
              <div className="p-3">
                {currentItems.map((ticket, index) => (
                  <MobileTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    openActionMenu={openActionMenu}
                    setOpenActionMenu={setOpenActionMenu}
                    setSelectedTicket={setSelectedTicket}
                    setShowDeleteModal={setShowDeleteModal}
                    setShowAssignModal={setShowAssignModal}
                    userType={user?.userType}
   
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table (hidden on small screens) */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 text-left dark:bg-gray-700">
                  <SortHeader field="id">CODE</SortHeader>
                  <SortHeader field="title">Title</SortHeader>
                  <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                    Technician
                  </th>
                  <SortHeader field="status">Status</SortHeader>
                  <SortHeader field="priority">Priority</SortHeader>
                  <SortHeader field="created_at">Created</SortHeader>
                  <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((ticket, key) => (
                    <tr
                      key={ticket.id}
                      className={`${
                        key === currentItems.length - 1
                          ? ""
                          : "border-b border-gray-200 dark:border-gray-700"
                      } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <td className="px-4 py-5 pl-9 xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {ticket.code}
                        </h5>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <MessageSquare className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                          </div>
                          <p className="text-black dark:text-white font-medium truncate max-w-xs">
                            {ticket.title}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <User className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                          </div>
                          <p className="text-black dark:text-white">
                            {ticket?.client?.user.first_name}{" "}
                            {ticket?.client?.user.last_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        {ticket.technician ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <UserCheck className="h-5 w-5 text-green-500 dark:text-green-400" />
                            </div>
                            <p className="text-black dark:text-white">
                              {ticket?.technician?.user.first_name}{" "}
                              {ticket?.technician?.user.last_name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-5">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-4 py-5">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          <span className="text-black dark:text-white text-sm">
                            {formatDate(ticket.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex items-center space-x-3.5">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenu(
                                  openActionMenu === ticket.id ? " " : ticket.id
                                );
                              }}
                              className="hover:text-blue-500 dark:hover:text-blue-400"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openActionMenu === ticket.id && (
                              <div
                                ref={actionMenuRef}
                                className="absolute right-0 z-40 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                              >
                                <ul className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                                  <li>
                                    <Link
                                      to={`/tickets/${ticket.id}`}
                                      className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400 lg:text-base text-black dark:text-white"
                                    >
                                      <Eye className="h-4 w-4" />
                                      View Details
                                    </Link>
                                  </li>
                                  {user?.userType !== "technician" && (
                                    <li className="mt-2">
                                      <Link
                                        to={`/tickets/${ticket.id}/edit`}
                                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400 lg:text-base text-black dark:text-white"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                      </Link>
                                    </li>
                                  )}
                                  {user?.userType === "admin" && (
                                    <li className="mt-2">
                                      <button
                                        onClick={() => {
                                          setSelectedTicket(ticket);
                                          setShowAssignModal(true);
                                          setOpenActionMenu(null);
                                        }}
                                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400 lg:text-base text-black dark:text-white w-full text-left"
                                      >
                                        <UserCheck className="h-4 w-4" />
                                        Assign to
                                      </button>
                                    </li>
                                  )}
                                  {user?.userType == "admin" && (
                                    <li className="mt-2">
                                      <button
                                        onClick={() => {
                                          setSelectedTicket(ticket);
                                          setShowDeleteModal(true);
                                          setOpenActionMenu(null);
                                        }}
                                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-red-500 dark:hover:text-red-400 lg:text-base text-black dark:text-white w-full text-left"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            totalItems={filteredTickets.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>

        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
             {showDeleteModal && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedTicket(null); // reset pour éviter overlay bloquant
            }}
            onConfirm={handleDeleteTicket}
            dataName={
              selectedTicket
                ? `the ticket  :  "${selectedTicket.code}" of   "${selectedTicket?.client.user?.username}"`
                : undefined
            }
          />
        )}
        {showAssignModal && <AssignModal />}
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketList;
