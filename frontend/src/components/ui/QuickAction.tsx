import { Download, MessageSquare, Paperclip } from "lucide-react";
import React from "react";
import InterventionReportButton from "../Interventions/InterventionReportButton";
import { useNavigate } from "react-router-dom";


const QuickAction = ({data}) => {
  const navigate=useNavigate();
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-lg font-semibold text-black dark:text-white">
        Quick Actions
      </h2>
      <div className="space-y-3">
        <InterventionReportButton
          interventionId={data.id}
          intervention={data}
        />


        <button onClick={()=>navigate(`/tickets/${data.ticket.id}/chat`)} className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          <MessageSquare className="w-4 h-4" />
          Discuss about it
        </button>

       
      </div>
    </div>
  );
};

export default QuickAction;
