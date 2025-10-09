import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  User,
  FileText,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  AlertCircle,
  XCircle,
  MapPin,
  Phone,
  Mail,
  Building,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Box,
  AlertTriangle,
  Hash,
  CalendarDays,
  RefreshCw,
  FileBox,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ticketsAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Ticket, Client, Technician } from "../../types";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { formatDate, formatDateTime } from "../../utils/utils";
import ClientCard from "../../components/Cards/ClientCard";
import TechnicianCard from "../../components/Cards/TechnicianCard";
import { TicketReplyHeader } from "../../components/TicketReply/TicketReplyHeader";
import { TicketStatusCard } from "../../components/TicketReply/TicketStatusCard";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";
import Button from "../../components/ui/Button";

interface TicketWithDetails extends Ticket {
  client?: Client;
  technician?: Technician;
}

const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<TicketWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getById(id!);
      setTicket(response.data);
    } catch (error) {
      console.error("Error fetching ticket:", error);
      toast.error("Failed to load ticket details");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!ticket) return;

    try {
      await ticketsAPI.delete(ticket.id);
      toast.success("Ticket deleted successfully");
      navigate("/tickets");
    } catch (error) {
      console.error("Error deleting ticket:", error);
      toast.error("Failed to delete ticket");
    }
  };

  const handleUpdate = async () => {
    if (!ticket) return;

    try {
      const response = await ticketsAPI.update(ticket.id, {
        status: ticket.status,
        description: ticket.description,
      });
      toast.success("Ticket updated successfully");
      setTicket((prev) => ({ ...prev!, ...response.data }));
    } catch (error) {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update ticket");
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
            <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-t-blue-500 animate-spin"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!ticket) {
    navigate("/tickets");
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10 w-full md:flex-col gap-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <TicketReplyHeader
              ticketCode={ticket.code}
              onBack={() => navigate("/tickets")}
            >
              Les details du ticket
            </TicketReplyHeader>
          </div>

          <div className="flex flex-col  gap-3 max-w-full sm:flex-row sm:gap-5  sm:justify-end">
            {user?.userType !== "technician" && (
              <Link to={`/tickets/${ticket.id}/edit`} >
                <Button variant="primary" className="w-full">
                  {" "}
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
            )}

            {user?.userType === "admin" && (
              <Button onClick={() => setShowDeleteModal(true)} variant="danger">
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ticket Title and Code */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50">
              <div className="flex items-start justify-between mb-6">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight pr-4">
                  {ticket.title}
                </h1>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-800 shadow-sm">
                  <Hash className=" hidden lg:block w-4 h-4" />
                  <span className=" hidden lg:block  font-mono font-semibold  ">
                    {ticket.code}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Ticket Details */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50">
              <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">
                Additional Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Material Name */}
                {ticket.material_name && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <Box className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Material
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {ticket.material_name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Problem Type */}
                {ticket.problem_type && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Problem Type
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {ticket.problem_type}
                      </p>
                    </div>
                  </div>
                )}

                {/* Problem Start Date */}
                {ticket.problem_start_date && (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        Problem Start Date
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {formatDateTime(ticket.problem_start_date)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {ticket.tags && (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 md:col-span-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                      <Tag className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">
                        Tags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ticket.tags.split(",").map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300 dark:border-blue-700/50"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Created At */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Created
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(ticket.created_at)}
                    </p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-900/30">
                    <RefreshCw className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Last Updated
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {formatDateTime(ticket.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Description */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50">
              <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                Ticket Description
              </h2>
              <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 border border-slate-200/50 dark:from-slate-700/50 dark:to-slate-800/50 dark:border-slate-600/50">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {ticket.description || "No description available"}
                </p>
              </div>
            </div>

            {/* Attachments */}
            {ticket.images && ticket.images.length > 0 && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50">
                <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Paperclip className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Attachments ({ticket.images.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {ticket.images.map((image) => (
                    <div key={image.id} className="group relative">
                      <div
                        className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-500/10 border border-slate-200/50 dark:border-slate-600/50"
                        onClick={() => window.open(image.image, "_blank")}
                      >
                        <img
                          src={image.image_url}
                          alt={`Attachment ${image.id}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolution Details */}
            {ticket.resolution && (
              <div className="rounded-2xl border border-green-200/60 bg-gradient-to-r from-green-50 to-emerald-50 p-8 shadow-sm dark:border-green-700/60 dark:from-green-900/10 dark:to-emerald-900/10">
                <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  Resolution Details
                </h2>
                <div className="rounded-xl bg-white/80 p-6 border border-green-200/50 dark:bg-slate-800/80 dark:border-green-700/50 backdrop-blur-sm">
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {ticket.resolution}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Client Information */}
            {ticket.client && <ClientCard client={ticket.client} />}

            {/* Technician Information */}
            {ticket.technician && (
              <TechnicianCard technician={ticket.technician} />
            )}

            <TicketStatusCard
              status={ticket.status}
              priority={ticket.priority}
              createdAt={ticket.created_at}
              updatedAt={ticket.updated_at}
            />

            {user?.userType === "technician" && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/50">
                <h2 className="mb-6 text-xl font-semibold text-slate-900 dark:text-white">
                  Update Ticket Status
                </h2>

                {/* Status */}
                {ticket && (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      Status
                    </label>
                    <select
                      value={ticket.status}
                      onChange={(e) =>
                        setTicket({ ...ticket, status: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}

                {/* Problem description update */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Problem Description
                  </label>
                  <textarea
                    value={ticket.description}
                    onChange={(e) =>
                      setTicket({ ...ticket, description: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-blue-400"
                    rows={4}
                    placeholder="Update problem description..."
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                >
                  Save Updates
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
            }}
            onConfirm={handleDelete}
            dataName={
              ticket
                ? `the intervention for ticket "${ticket.title}"`
                : undefined
            }
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketDetail;
