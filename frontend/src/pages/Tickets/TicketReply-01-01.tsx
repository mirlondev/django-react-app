import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  User,
  Clock,
  Tag,
  ArrowLeft,
  Paperclip,
  Send,
  AlertCircle,
  CheckCircle,
  Clock as ClockIcon,
  XCircle,
  Eye,
  Trash2,
  Users,
  Loader2,
  Image as ImageIcon,
  File,
  X,
  Settings,
  Phone,
  Mail,
  Building,
  Calendar,
  MessageCircle,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { useAuth } from "../../context/AuthContext";
import { interventionsAPI, ticketsAPI, whatsappAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Ticket, Intervention, WhatsAppMessage } from "../../types";

// Message type definition
type MessageType = {
  type: "original" | "intervention" | "whatsapp";
  id: string;
  message: string;
  user_id: string;
  user_type: "client" | "technician" | "whatsapp" | "admin";
  timestamp: string;
  user_name: string;
  direction?: "inbound" | "outbound";
  status?: string;
};

const TicketReply: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Core state
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // WhatsApp state
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [whatsappHistory, setWhatsappHistory] = useState<WhatsAppMessage[]>([]);
  const [messageFilter, setMessageFilter] = useState<"all" | "interventions" | "whatsapp">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp functions
  const handleSendWhatsApp = async () => {
    if (!newMessage.trim() || !ticket) return;

    setSendingWhatsApp(true);
    try {
      await whatsappAPI.sendMessage(ticket.id, newMessage);
      toast.success("Message envoyé via WhatsApp");
      setNewMessage("");
      loadWhatsappHistory();
    } catch (error) {
      console.error("Erreur lors de l'envoi WhatsApp:", error);
      toast.error("Échec de l'envoi WhatsApp");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const checkWhatsappConfig = async () => {
    try {
      const response = await whatsappAPI.checkConfig();
      setWhatsappEnabled(response.data.enabled);
    } catch (error) {
      console.log("WhatsApp non configuré");
      setWhatsappEnabled(false);
    }
  };

  const loadWhatsappHistory = async () => {
    if (!ticket) return;
    try {
      const response = await whatsappAPI.getMessageHistory(ticket.id);
      setWhatsappHistory(response.data);
    } catch (error) {
      console.log("Impossible de charger l'historique WhatsApp");
      setWhatsappHistory([]);
    }
  };

  // Fetch ticket data
  const fetchTicketData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [ticketResponse, interventionsResponse] = await Promise.all([
        ticketsAPI.getById(id),
        interventionsAPI.getByTicketId(id),
      ]);

      setTicket(ticketResponse.data);
      setInterventions(interventionsResponse.data.results || interventionsResponse.data);
      
      // Load WhatsApp data after ticket is loaded
      await checkWhatsappConfig();
      await loadWhatsappHistory();
    } catch (error) {
      console.error("❌ Error fetching ticket data:", error);
      toast.error("Failed to load ticket details");
      navigate("/tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && attachments.length === 0) {
      return;
    }

    try {
      setSubmitting(true);

      // If technician/admin, save as intervention
      if ((user?.userType === "technician" || user?.userType === "admin") && newMessage.trim()) {
        await interventionsAPI.create({
          ticket: ticket!.id,
          report: newMessage.trim(),
        });

        // Refresh interventions
        const interventionsResponse = await interventionsAPI.getByTicketId(ticket!.id);
        setInterventions(interventionsResponse.data.results || interventionsResponse.data);
        
        toast.success("Intervention créée");
      } else if (newMessage.trim()) {
        // For clients, just show success message
        toast.success("Message prêt à être envoyé");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Une erreur est survenue");
    } finally {
      setNewMessage("");
      setAttachments([]);
      setSubmitting(false);
      messageInputRef.current?.focus();
    }
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`Le fichier "${file.name}" n'est pas une image.`);
        return false;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`L'image "${file.name}" est trop grande. Maximum 5MB.`);
        return false;
      }

      return true;
    });

    if (validFiles.length > 0) {
      setAttachments([validFiles[0]]);
      toast.success("Image attachée");
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, { icon: React.ReactElement; color: string }> = {
      open: {
        icon: <AlertCircle className="w-4 h-4" />,
        color: "text-orange-500",
      },
      resolved: {
        icon: <CheckCircle className="w-4 h-4" />,
        color: "text-green-500",
      },
      in_progress: {
        icon: <ClockIcon className="w-4 h-4" />,
        color: "text-blue-500",
      },
      closed: { icon: <XCircle className="w-4 h-4" />, color: "text-gray-500" },
    };
    const statusInfo = icons[status] || icons.open;
    return <span className={statusInfo.color}>{statusInfo.icon}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const classes: Record<string, string> = {
      low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          classes[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
        }`}
      >
        {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Unknown"}
      </span>
    );
  };

  // Filter messages based on current filter
  const getFilteredMessages = (): MessageType[] => {
    const allMessages: MessageType[] = [
      // Original description as first message
      {
        type: "original",
        id: "original",
        message: ticket?.description || "",
        user_id: ticket?.client.user.id || "",
        user_type: "client",
        timestamp: ticket?.created_at || "",
        user_name: ticket ? `${ticket.client.user.first_name} ${ticket.client.user.last_name}` : "",
      },
      // Interventions
      ...interventions.map((intervention) => ({
        type: "intervention",
        id: intervention.id,
        message: intervention.report,
        user_id: intervention.technician?.user.id || ticket?.client.user.id || "",
        user_type: intervention.technician ? "technician" : "client",
        timestamp: intervention.created_at,
        user_name: intervention.technician
          ? `${intervention.technician.user.first_name} ${intervention.technician.user.last_name}`
          : ticket ? `${ticket.client.user.first_name} ${ticket.client.user.last_name}` : "",
      })),
      // WhatsApp messages
      ...whatsappHistory.map((message) => ({
        type: "whatsapp",
        id: message.id,
        message: message.body,
        user_id: "whatsapp",
        user_type: "whatsapp",
        timestamp: message.timestamp,
        user_name: "WhatsApp",
        direction: message.direction,
        status: message.status,
      })),
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    switch (messageFilter) {
      case "interventions":
        return allMessages.filter(msg => msg.type === "intervention" || msg.type === "original");
      case "whatsapp":
        return allMessages.filter(msg => msg.type === "whatsapp");
      default:
        return allMessages;
    }
  };

  // Effects
  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);

  // Render loading state
  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
            <h2 className="text-xl font-semibold mb-2">Chargement du ticket</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Veuillez patienter...
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  // Render ticket not found
  if (!ticket) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Ticket non trouvé</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Le ticket que vous recherchez n'existe pas ou vous n'avez pas la permission de le voir.
            </p>
            <button
              onClick={() => navigate("/tickets")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retour aux tickets
            </button>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const filteredMessages = getFilteredMessages();

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/tickets")}
                className="mr-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Retour aux tickets"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Ticket #{ticket.code}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Gérer et répondre aux demandes clients
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Sidebar - Ticket Information */}
            <div className="xl:col-span-1 space-y-6">
              {/* Ticket Status Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <Tag className="w-5 h-5 mr-2" /> Statut
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Statut actuel
                    </span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      <span className="font-medium capitalize text-gray-900 dark:text-white">
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Priorité
                    </span>
                    {getPriorityBadge(ticket.priority)}
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Créé: {formatDate(ticket.created_at)}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="w-3 h-3 mr-1" />
                      Modifié: {formatDate(ticket.updated_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <User className="w-5 h-5 mr-2" /> Client
                </h2>
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {ticket.client.user.first_name.charAt(0)}
                    {ticket.client.user.last_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {ticket.client.user.first_name} {ticket.client.user.last_name}
                    </h3>
                    <div className="space-y-1 mt-2">
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Mail className="w-3 h-3 mr-2" />
                        <span className="truncate">{ticket.client.user.email}</span>
                      </div>
                      {ticket.client.phone && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-3 h-3 mr-2" />
                          <span>{ticket.client.phone}</span>
                        </div>
                      )}
                      {ticket.client.company && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Building className="w-3 h-3 mr-2" />
                          <span>{ticket.client.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Status Card */}
              {whatsappEnabled && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                    <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Statut
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full dark:bg-green-900/30 dark:text-green-300">
                        Connecté
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {whatsappHistory.length} message(s) échangé(s)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Area */}
            <div className="xl:col-span-3 space-y-6">
              {/* Ticket Header Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white pr-4">
                      {ticket.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>Dernière mise à jour: {formatDate(ticket.updated_at)}</span>
                    </div>
                  </div>

                  {/* Attachments */}
                  {ticket.images && ticket.images.length > 0 && (
                    <div className="mt-4">
                      <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
                        <Paperclip className="w-4 h-4 mr-2" />
                        Pièces jointes ({ticket.images.length})
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ticket.images.map((image) => (
                          <div key={image.id} className="group relative">
                            <div
                              className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              onClick={() => setSelectedImage(image.image)}
                            >
                              <img
                                src={image.image}
                                alt={`Attachment ${image.id}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Messages Section */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Messages Header with Filter */}
                <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Communications
                  </h3>
                  
                  <div className="relative">
                    <button 
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      <span>
                        {messageFilter === "all" && "Tous les messages"}
                        {messageFilter === "interventions" && "Interventions seulement"}
                        {messageFilter === "whatsapp" && "WhatsApp seulement"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    
                    {showFilterDropdown && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <button
                          onClick={() => {
                            setMessageFilter("all");
                            setShowFilterDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Tous les messages
                        </button>
                        <button
                          onClick={() => {
                            setMessageFilter("interventions");
                            setShowFilterDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Interventions seulement
                        </button>
                        <button
                          onClick={() => {
                            setMessageFilter("whatsapp");
                            setShowFilterDropdown(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          WhatsApp seulement
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Messages Container */}
                <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                  {filteredMessages.length > 0 ? (
                    filteredMessages.map((message) => (
                      <div
                        key={`${message.type}-${message.id}`}
                        className={`p-4 rounded-lg ${
                          message.user_type === "technician" || message.user_type === "admin"
                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            : message.user_type === "whatsapp"
                            ? message.direction === "outbound"
                              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                              : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {message.user_name}
                            </span>
                            {message.type === "whatsapp" && (
                              <span className="px-1.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/30 dark:text-green-300">
                                WhatsApp
                              </span>
                            )}
                            {message.type === "intervention" && (
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                                Intervention
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun message à afficher</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
                  {/* Attachments Preview */}
                  {attachments.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <span className="max-w-xs truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(file.size)})
                          </span>
                          <button
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="flex gap-3">
                    <div className="flex-1">
                      <textarea
                        ref={messageInputRef}
                        rows={3}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-gray-700 dark:text-white"
                        placeholder={
                          user?.userType === "technician" || user?.userType === "admin"
                            ? "Rédiger un rapport d'intervention..."
                            : "Répondre au ticket..."
                        }
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAttachment}
                        accept="image/*"
                        className="hidden"
                        multiple
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors flex items-center justify-center"
                        title="Ajouter une pièce jointe"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button
                        type="submit"
                        disabled={(!newMessage.trim() && attachments.length === 0) || submitting}
                        className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl transition-colors flex items-center justify-center"
                      >
                        {submitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* WhatsApp Section */}
              {whatsappEnabled && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Conversation WhatsApp
                    </h3>
                  </div>

                  <div className="flex flex-col h-96">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                      {whatsappHistory.length > 0 ? (
                        whatsappHistory.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.direction === "outbound"
                                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 ml-8"
                                : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-8"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-sm font-medium">
                                {message.direction === "outbound" ? "Vous" : "Client"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{message.body}</p>
                            {message.status && (
                              <div className="text-xs mt-1 text-gray-500">
                                Statut: {message.status}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>Aucun message WhatsApp</p>
                        </div>
                      )}
                    </div>

                    {/* WhatsApp Input */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 flex gap-3">
                      <textarea
                        rows={2}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 resize-none dark:bg-gray-700 dark:text-white"
                        placeholder="Écrire un message WhatsApp..."
                      />
                      <button
                        type="button"
                        onClick={handleSendWhatsApp}
                        disabled={!newMessage.trim() || sendingWhatsApp}
                        className="p-3 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-xl transition-colors flex items-center justify-center"
                      >
                        {sendingWhatsApp ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl max-h-full">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="max-w-full max-h-screen object-contain"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketReply;