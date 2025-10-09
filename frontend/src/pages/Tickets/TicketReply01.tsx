import React, { useEffect, useState } from "react";
import { MessageCircle, Users, Phone, Settings } from "lucide-react";
import WhatsAppMessageForm from "../../components/WhatsApp/WhatsAppMessageForm";
import MessageHistory from "../../components/WhatsApp/MessageHistory";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import { interventionsAPI, ticketsAPI, whatsappAPI } from "../../services/api";
import { Ticket } from "../../types";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";

const TicketReply = ( ) => {
  const [activeTab, setActiveTab] = useState("client");
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [loading, setLoading] = useState(false);

  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const handleMessageSent = () => {
    setRefreshHistory((prev) => prev + 1);
  };

  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);
console.log(ticket);
  const canMessageTechnician = ticket?.technician && ticket?.technician.user.phone;


  const fetchTicketData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const [ticketResponse, interventionsResponse] = await Promise.all([
        ticketsAPI.getById(id),
      ]);

      setTicket(ticketResponse.data);
      
      // Load WhatsApp data after ticket is loaded
    
    } catch (error) {
      console.error("❌ Error fetching ticket data:", error);
      toast.error("Failed to load ticket details");
    } finally {
      setLoading(false);
    }
  };

    if(!loading){
      <LoadingSpinner/>
    }
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* En-tête WhatsApp */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Messagerie WhatsApp</h2>
          </div>
          <p className="opacity-90">
            Communiquez directement avec vos clients et techniciens via WhatsApp
          </p>
        </div>

        {/* Onglets de navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("client")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "client"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Message au Client
          </button>

          {canMessageTechnician && (
            <button
              onClick={() => setActiveTab("technician")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "technician"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Message au Technicien
            </button>
          )}

          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-green-600 text-green-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <MessageCircle className="w-4 h-4 inline mr-2" />
            Historique
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="pt-4">
          {activeTab === "client" && (
            <WhatsAppMessageForm
              ticket={ticket}
              user={user}
              recipientType="client"
              onMessageSent={handleMessageSent}
            />
          )}

          {activeTab === "technician" && canMessageTechnician && (
            <WhatsAppMessageForm
              ticket={ticket}
              user={user}
              recipientType="technician"
              onMessageSent={handleMessageSent}
            />
          )}

          {activeTab === "history" && (
            <MessageHistory ticketId={ticket} key={refreshHistory} />
          )}
        </div>

        {/* Informations de contact */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Phone className="w-4 h-4" />
            Informations de contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Client:</strong> {ticket?.client?.username}
              <br />
              <strong>Téléphone:</strong>{" "}
              {ticket?.user?.client?.phone || "Non renseigné"}
            </div>
            {ticket?.user?.technician && (
              <div>
                <strong>Technicien:</strong> {ticket?.technician?.user.username}
                <br />
                <strong>Téléphone:</strong>{" "}
                {ticket?.technician.phone || "Non renseigné"}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketReply;
