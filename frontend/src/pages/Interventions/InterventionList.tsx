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
  Clock,
  DollarSign,
  Truck,
  ChevronDown,
  ArrowUpDown,
  X,
  FileText
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api, { interventionsAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Intervention, Technician, Ticket } from "../../types";
import { Link, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import MonthlyReportModal from "../../components/Modals/MonthlyReportModal";
import {
  formatCurrency,
  formatHours,
  formatDate,
  formatDateTime,
} from "../../utils/utils";
import Pagination from "../../components/Pagination/Pagination";
import Button from "../../components/ui/Button";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";
import { getStatusBadge, getPriorityBadge } from "../../utils/badge";
import MobileInterventionCard from "../../components/Cards/MobileInterventionCard";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";

interface InterventionWithDetails extends Intervention {
  ticket?: Ticket;
  technician?: Technician;
}

const InterventionList = () => {
  const { user } = useAuth();
  const [interventions, setInterventions] = useState<InterventionWithDetails[]>(
    []
  );
  const [filteredInterventions, setFilteredInterventions] = useState<
    InterventionWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedIntervention, setSelectedIntervention] =
    useState<InterventionWithDetails | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const navigate = useNavigate();
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);

  // Fetch interventions
  useEffect(() => {
    fetchInterventions();
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

  const fetchInterventions = async () => {
    try {
      setLoading(true);
      const response = await interventionsAPI.getAll();
      setInterventions(response.data);
      setFilteredInterventions(response.data);
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching interventions:", error);
      toast.error("Failed to load interventions");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort interventions
  useEffect(() => {
    let result = interventions;

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (intervention) =>
          intervention.ticket.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          intervention.report
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (intervention.technician &&
            (intervention.technician.user.first_name
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
              intervention.technician.user.last_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase())))
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(
        (intervention) => intervention.status === statusFilter
      );
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      if (sortOrder === "asc") {
        return a[sortField as keyof Intervention] >
          b[sortField as keyof Intervention]
          ? 1
          : -1;
      } else {
        return a[sortField as keyof Intervention] <
          b[sortField as keyof Intervention]
          ? 1
          : -1;
      }
    });

    setFilteredInterventions(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [interventions, searchTerm, statusFilter, sortField, sortOrder]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInterventions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredInterventions.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleDeleteIntervention = async () => {
    if (!selectedIntervention) return;

    try {
      await interventionsAPI.delete(selectedIntervention.id);
      toast.success("Intervention deleted successfully");

      // Fermer le modal et réinitialiser l'intervention sélectionnée
      setShowDeleteModal(false);
      setSelectedIntervention(null);

      // Recharger la liste
      fetchInterventions();
    } catch (error) {
      console.error("Error deleting intervention:", error);
      toast.error("Failed to delete intervention");
    }
  };

  const StatusFilter = () => (
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-stroke dark:bg-form-input dark:text-white dark:focus:border-primary dark:bg-gray-600"
    >
      <option value="all">All Status</option>
      <option value="scheduled">Scheduled</option>
      <option value="in_progress">In Progress</option>
      <option value="completed">Completed</option>
      <option value="cancelled">Cancelled</option>
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
      className="px-1 sm:px-2 py-3 sm:py-4 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </div>
    </th>
  );

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner/>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-screen-2xl p-2 md:p-4 lg:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <h1 className="text-xl md:text-2xl font-semibold text-black dark:text-white">
            Interventions
          </h1>
          <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
            Manage and track all technical interventions
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
                    placeholder="Search interventions..."
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

              <div className="flex flex-col w-full gap-2 mt-2 md:mt-0 sm:flex sm:flex-row sm:justify-end">
                <Button
                  onClick={() => setShowMonthlyReport(true)}
                  variant="outline"
                  className="text-xs md:text-sm py-2 px-2 md:px-3 flex items-center gap-1 md:gap-2"
                >
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">Monthly Report</span>
                  <span className="sm:hidden">Report</span>
                </Button>

                <Link to="/interventions/add">
                  <Button 
                    variant="primary" 
                    className="text-xs md:text-sm py-2 px-2 md:px-3 flex items-center gap-1 md:gap-2  w-full"
                  >
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">New Intervention</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                </Link>
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
              </div>
            </div>
          )}

          {/* Mobile Cards View (visible on small screens) */}
          <div className="block lg:hidden">
            {currentItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No interventions found
              </div>
            ) : (
              <div className="p-3">
                {currentItems.map((intervention, index) => (
                  <MobileInterventionCard
                    key={intervention.id}
                    intervention={intervention}
                    openActionMenu={openActionMenu}
                    setOpenActionMenu={setOpenActionMenu}
                    setSelectedIntervention={setSelectedIntervention}
                    setShowDeleteModal={setShowDeleteModal}
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
                  <SortHeader field="id">Code</SortHeader>
                  <th className="px-2 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                    Ticket
                  </th>
                  <th className="px-2 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                    Technician
                  </th>
                  <SortHeader field="intervention_date">Date</SortHeader>
                  <SortHeader field="hours_worked">Hours</SortHeader>
                  <SortHeader field="travel_time">Travel Time</SortHeader>
                  <SortHeader field="total_cost">Total Cost</SortHeader>
                  <SortHeader field="status">Status</SortHeader>
                  <th className="px-2 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No interventions found
                    </td>
                  </tr>
                ) : (
                  currentItems.map((intervention, key) => (
                    <tr
                      key={intervention.id}
                      className={`${
                        key === currentItems.length - 1
                          ? ""
                          : "border-b border-gray-200 dark:border-gray-700"
                      } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                    >
                      <td className="px-2 py-3 pl-4 xl:pl-6">
                        <h5 className="font-medium text-black dark:text-white text-sm">
                          {intervention.code.substring(0, 8)}
                        </h5>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <FileText className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-black dark:text-white font-medium text-sm">
                              {intervention.ticket.title.length > 20
                                ? `${intervention.ticket.title.substring(0, 20)}...`
                                : intervention.ticket.title}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {intervention.ticket.id.substring(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        {intervention.technician ? (
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              <User className="h-4 w-4 text-green-500 dark:text-green-400" />
                            </div>
                            <p className="text-black dark:text-white text-sm">
                              {intervention.technician.user.first_name}{" "}
                              {intervention.technician.user.last_name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400 text-sm">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-black dark:text-white text-xs">
                            {formatDate(intervention.intervention_date)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-black dark:text-white text-sm">
                            {formatHours(intervention?.hours_worked)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <Truck className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-black dark:text-white text-sm">
                            {formatHours(intervention?.travel_time)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-black dark:text-white text-sm">
                            {formatCurrency(intervention.total_cost)}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                       
                          {getStatusBadge(intervention.status)}
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenu(
                                  openActionMenu === intervention.id
                                    ? null
                                    : intervention.id
                                );
                              }}
                              className="hover:text-blue-500 dark:hover:text-blue-400"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {openActionMenu === intervention.id && (
                              <div
                                ref={actionMenuRef}
                                className="absolute right-0 z-40 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                              >
                                <ul className="border-b border-gray-200 px-3 py-2 dark:border-gray-700">
                                  <li>
                                    <Link
                                      to={`/interventions/${intervention.id}`}
                                      className="flex items-center gap-2 text-xs font-medium duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400 text-black dark:text-white"
                                    >
                                      <Eye className="h-3 w-3" />
                                      View Details
                                    </Link>
                                  </li>
                                  <li className="mt-2">
                                    <Link
                                      to={`/interventions/${intervention.id}/edit`}
                                      className="flex items-center gap-2 text-xs font-medium duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400 text-black dark:text-white"
                                    >
                                      <Edit className="h-3 w-3" />
                                      Edit
                                    </Link>
                                  </li>
                                  {user?.userType !== "technician" && (
                                  <li className="mt-2">
                                    <button
                                      onClick={() => {
                                        setSelectedIntervention(intervention);
                                        setShowDeleteModal(true);
                                        setOpenActionMenu(null);
                                      }}
                                      className="flex items-center gap-2 text-xs font-medium duration-300 ease-in-out hover:text-red-500 dark:hover:text-red-400 text-black dark:text-white w-full text-left"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </button>
                                  </li>)}
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

          <Pagination
            totalItems={filteredInterventions.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>

        <MonthlyReportModal
          isOpen={showMonthlyReport}
          onClose={() => setShowMonthlyReport(false)}
        />
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedIntervention(null); // reset pour éviter overlay bloquant
          }}
          onConfirm={handleDeleteIntervention}
          dataName={
            selectedIntervention
              ? `the intervention for ticket "${selectedIntervention.ticket.title}"`
              : undefined
          }
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default InterventionList;