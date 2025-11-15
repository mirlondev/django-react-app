import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Drill,
  Truck,
  Edit,
  Trash2,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { interventionsAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Intervention, Technician, Ticket } from "../../types";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import {
  formatCurrency,
  formatHours,
  formatDate,
  formatDateTime,
} from "../../utils/utils";
import TechnicianCard from "../../components/Cards/TechnicianCard";
import QuickAction from "../../components/ui/QuickAction";
import TicketCard from "../../components/Cards/TicketCard";
import ClientCard from "../../components/Cards/ClientCard";
import Button from "../../components/ui/Button";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";
import { getStatusBadge } from "../../utils/badge";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";

interface InterventionWithDetails extends Intervention {
  ticket?: Ticket;
  technician?: Technician;
}

const InterventionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [intervention, setIntervention] =
    useState<InterventionWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchIntervention();
    }
  }, [id]);

  const fetchIntervention = async () => {
    try {
      setLoading(true);
      const response = await interventionsAPI.getById(id!);
      setIntervention(response.data);
    } catch (error) {
      console.error("Error fetching intervention:", error);
      toast.error("Failed to load intervention details");
      navigate("/interventions");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!intervention) return;

    try {
      await interventionsAPI.delete(intervention.id);
      toast.success("Intervention deleted successfully");
      navigate("/interventions");
    } catch (error) {
      console.error("Error deleting intervention:", error);
      toast.error("Failed to delete intervention");
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  if (!intervention) {
    navigate("/interventions");
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate("/interventions")} variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-black dark:text-white sm:flex sm:flex-row hidden lg:block">
                <p>Intervention {intervention.code.substring(0, 8)}</p>
              </h1>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {intervention.ticket?.title}
              </p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-2 sm:flex sm:flex-row sm:gap-4 sm:justify-end">
            <Link to={`/interventions/${intervention.id}/edit`}>
              <Button variant="primary" className="w-full">
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            </Link>

            {user?.userType === "admin" && (
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                className="max-w-full"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status and Basic Info */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  {getStatusBadge(intervention.status)}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Created {formatDateTime(intervention.created_at)}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(intervention.intervention_date)}
                </div>
              </div>
            </div>

            {/* Time and Cost Details */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Time & Cost Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Hours Worked
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {formatHours(intervention.hours_worked)}h
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                    <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Travel Time
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {formatHours(intervention.travel_time)}h
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transport cost
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {formatCurrency(intervention.transport_cost)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                    <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Total Cost
                    </p>
                    <p className="text-lg font-semibold text-black dark:text-white">
                      {formatCurrency(intervention.total_cost)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Intervention Report */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
                Intervention Report
              </h2>
              <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {intervention.report || "No report available"}
                </p>
              </div>
            </div>

            {/* Work Description */}
            {intervention.work_description && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
                  Work Description
                </h2>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {intervention.work_description}
                  </p>
                </div>
              </div>
            )}

            {/* Materials Used */}
            {intervention.materials_used && (
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                  <Drill className="w-5 h-5" />
                  Materials Used
                </h2>
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {intervention.materials_used}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ticket Information */}
            {intervention.ticket && <TicketCard intervention={intervention} />}

            {/* Technician Information */}
            {intervention.technician && (
              <TechnicianCard technician={intervention.technician} />
            )}

            {/* Customer Information */}
            {intervention.ticket?.client && (
              <ClientCard client={intervention.ticket.client} />
            )}

            {/* Quick Actions */}
            <QuickAction data={intervention} />
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setIntervention(null); // reset pour éviter overlay bloquant
            }}
            onConfirm={handleDelete}
            dataName={
              intervention
                ? `the intervention for ticket "${intervention.title}"`
                : undefined
            }
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default InterventionDetail;
