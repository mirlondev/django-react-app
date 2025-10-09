import React from 'react';
import { Paperclip, Send, Loader2, ImageIcon, X } from 'lucide-react';
import Button from '../ui/Button';

interface MessageInputProps {
  newMessage: string;
  attachments: File[];
  submitting: boolean;
  whatsappEnabled: boolean;
  canMessageClient: boolean;
  canMessageTechnician: boolean;
  messageInputRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onMessageChange: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  attachments,
  submitting,
  whatsappEnabled,
  canMessageClient,
  canMessageTechnician,
  messageInputRef,
  fileInputRef,
  onMessageChange,
  onSubmit,
  onAttachment,
  onRemoveAttachment,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div key={index} className="relative group">
                <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-32">
                    {file.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveAttachment(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <textarea
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Tapez votre message ici..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit(e);
                }
              }}
            />
          </div>

          <div className="flex items-center space-x-2">
            {/* File attachment button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Attacher une image"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={(!newMessage.trim() && attachments.length === 0) || submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {submitting ? "Envoi..." : "Envoyer"}
              </span>
            </button>
          </div>
        </div>

        {/* Helper text */}
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>
            Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
          </span>
          {whatsappEnabled && (canMessageClient || canMessageTechnician) && (
            <span className="text-green-600 dark:text-green-400">
              WhatsApp activé
            </span>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onAttachment}
          className="hidden"
        />
      </form>
  
    </div>
  );
};