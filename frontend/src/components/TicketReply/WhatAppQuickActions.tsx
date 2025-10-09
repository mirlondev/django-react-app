import React from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';

interface WhatsAppQuickActionsProps {
  whatsappEnabled: boolean;
  canMessageClient: boolean;
  canMessageTechnician: boolean;
  newMessage: string;
  sendingWhatsApp: boolean;
  sendingTo: "client" | "technician" | null;
  onSendWhatsApp: (recipientType: "client" | "technician") => void;
}

export const WhatsAppQuickActions: React.FC<WhatsAppQuickActionsProps> = ({
  whatsappEnabled,
  canMessageClient,
  canMessageTechnician,
  newMessage,
  sendingWhatsApp,
  sendingTo,
  onSendWhatsApp,
}) => {
  if (!whatsappEnabled) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
        <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp
      </h2>
      <div className="space-y-3">
        {canMessageClient && (
          <button
            onClick={() => onSendWhatsApp("client")}
            disabled={!newMessage.trim() || sendingWhatsApp}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
          >
            {sendingWhatsApp && sendingTo === "client" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MessageCircle className="w-4 h-4 mr-2" />
            )}
            Message Client
          </button>
        )}
        {canMessageTechnician && (
          <button
            onClick={() => onSendWhatsApp("technician")}
            disabled={!newMessage.trim() || sendingWhatsApp}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
          >
            {sendingWhatsApp && sendingTo === "technician" ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <MessageCircle className="w-4 h-4 mr-2" />
            )}
            Message Technicien
          </button>
        )}
      </div>
    </div>
  );
};