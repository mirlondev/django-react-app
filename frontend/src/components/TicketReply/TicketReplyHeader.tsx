import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../ui/Button';

interface TicketReplyHeaderProps {
  ticketCode: string;
  onBack: () => void;
  children: any
}

export const TicketReplyHeader= ({ticketCode,onBack,children,}:TicketReplyHeaderProps) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
      <div className="flex items-center">
        <Button
          onClick={onBack}
          variant='ghost'
          title="Retour aux tickets"
        >
          <ArrowLeft className="w-6 h-6 dark:text-white" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white hidden lg:block">
           Code du ticket : {ticketCode}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
           {children}
          </p>
        </div>
      </div>
    </div>
  );
};