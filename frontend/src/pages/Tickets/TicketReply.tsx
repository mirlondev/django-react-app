import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { useAuth } from "../../context/AuthContext";
import { interventionsAPI, ticketsAPI, whatsappAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Ticket, Intervention, WhatsAppMessage } from "../../types";
import { TicketReplyHeader } from "../../components/TicketReply/TicketReplyHeader";
import { TicketStatusCard } from "../../components/TicketReply/TicketStatusCard";
import  ClientCard   from "../../components/Cards/ClientCard";
import  TechnicianCard  from "../../components/Cards/TechnicianCard";
import { WhatsAppQuickActions } from "../../components/TicketReply/WhatAppQuickActions";
import { MessagesList, MessageType } from "../../components/TicketReply/MessageList";
import { MessageInput } from "../../components/TicketReply/MessageInput";
import { ImageModal } from "../../components/TicketReply/ImageModal";
import { LoadingState } from "../../components/TicketReply/LoadingState";
import { ErrorState } from "../../components/TicketReply/ErrorState";
import Button from "../../components/ui/Button";

const TicketReply=() => {
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
  const [sendingTo, setSendingTo] = useState<"client" | "technician" | null>(null);
  const [whatsappHistory, setWhatsappHistory] = useState<WhatsAppMessage[]>([]);
  const [messageFilter, setMessageFilter] = useState<"all" | "interventions" | "whatsapp">("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [whatsappTab, setWhatsappTab] = useState<"client" | "technician">("client");

  // UI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // WhatsApp functions
  const handleSendWhatsApp = async (recipientType: "client" | "technician") => {
    if (!newMessage.trim() || !ticket) return;

    setSendingWhatsApp(true);
    setSendingTo(recipientType);
    
    try {
      const apiMethod = recipientType === "client" 
        ? whatsappAPI.sendToClient 
        : whatsappAPI.sendToTechnician;

      const response = await apiMethod(ticket.id, newMessage.trim());
      
      toast.success(`Message envoyé ${recipientType === "client" ? "au client" : "au technicien"} avec succès`);
      setNewMessage("");
      loadWhatsappHistory();
      
    } catch (error: any) {
      console.error("Erreur lors de l'envoi WhatsApp:", error);
      const errorMessage = error.response?.data?.error || "Échec de l'envoi WhatsApp";
      toast.error(errorMessage);
    } finally {
      setSendingWhatsApp(false);
      setSendingTo(null);
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

  // Check if recipient has phone number
  const canMessageClient = ticket?.client?.phone;
  const canMessageTechnician = ticket?.technician?.phone;

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
        <LoadingState />
      </AuthenticatedLayout>
    );
  }

  // Render ticket not found
  if (!ticket) {
    toast.error('ticket doesn.t exist')
    return (
      <AuthenticatedLayout>
        <ErrorState onBack={() => navigate("/tickets")} />
      </AuthenticatedLayout>
    );
  }

  const filteredMessages = getFilteredMessages();

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <TicketReplyHeader 
              ticketCode={ticket.code}
              onBack={() => navigate("/tickets")}>
             {
              user.userType=="admin" || user.userType=="technician" ?
              (<p> Gérer et répondre aux demandes clients</p>):(<p> Vous pouvez contacter les techniciens ici</p>)
             }
            </TicketReplyHeader>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Left Sidebar - Ticket Information */}
            <div className="xl:col-span-1 space-y-6">
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80">
                <TicketStatusCard
                  status={ticket.status}
                  priority={ticket.priority}
                  createdAt={ticket.created_at}
                  updatedAt={ticket.updated_at}
                />
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80 overflow-hidden">
                <ClientCard client={ticket.client} />
              </div>

              {ticket.technician && (
                <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80 overflow-hidden">
                  <TechnicianCard technician={ticket.technician} />
                </div>
              )}

              <div className="rounded-2xl border border-green-200/60 bg-gradient-to-br from-green-50/80 to-emerald-50/60 backdrop-blur-sm shadow-sm dark:border-green-700/60 dark:from-green-900/20 dark:to-emerald-900/10">
                <WhatsAppQuickActions
                  whatsappEnabled={whatsappEnabled}
                  canMessageClient={!!canMessageClient}
                  canMessageTechnician={!!canMessageTechnician}
                  newMessage={newMessage}
                  sendingWhatsApp={sendingWhatsApp}
                  sendingTo={sendingTo}
                  onSendWhatsApp={handleSendWhatsApp}
                />
              </div>
            </div>

            {/* Main Content - Messages */}
            <div className="xl:col-span-3 space-y-6">
              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80 overflow-hidden">
                <MessagesList
                  messages={filteredMessages}
                  messageFilter={messageFilter}
                  showFilterDropdown={showFilterDropdown}
                  messagesEndRef={messagesEndRef}
                  onFilterChange={(filter) => {
                    setMessageFilter(filter);
                    setShowFilterDropdown(false);
                  }}
                  onToggleFilterDropdown={() => setShowFilterDropdown(!showFilterDropdown)}
                />
              </div>

              <div className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80 overflow-hidden">
                <MessageInput
                  newMessage={newMessage}
                  attachments={attachments}
                  submitting={submitting}
                  whatsappEnabled={whatsappEnabled}
                  canMessageClient={!!canMessageClient}
                  canMessageTechnician={!!canMessageTechnician}
                  messageInputRef={messageInputRef}
                  fileInputRef={fileInputRef}
                  onMessageChange={setNewMessage}
                  onSubmit={handleSubmit}
                  onAttachment={handleAttachment}
                  onRemoveAttachment={removeAttachment}
                />
              </div>
            </div>
          </div>

          <ImageModal 
            selectedImage={selectedImage}
            onClose={() => setSelectedImage(null)}
          />

          {/* Filter Dropdown Overlay */}
          {showFilterDropdown && (
            <div 
              className="fixed inset-0 z-5 bg-slate-900/20 backdrop-blur-sm"
              onClick={() => setShowFilterDropdown(false)}
            />
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketReply;