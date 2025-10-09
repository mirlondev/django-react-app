// components/InterventionReportButton.jsx
import React, { useState } from "react";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { reportAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const InterventionReportButton = ({ interventionId, intervention }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getInterventionPDF(interventionId);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `intervention_report_${interventionId}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF report downloaded successfully");
    } catch (error) {
      console.error("Error downloading report:", error);

      if (error.response?.status === 403) {
        toast.error("You do not have permission to download this report");
      } else if (error.response?.status === 404) {
        toast.error("Intervention report not found");
      } else {
        toast.error("Failed to download report");
      }
    } finally {
      setLoading(false);
    }
  };

  const canDownloadReport = () => {
    if (!intervention) return false;

    // Admin peut tout télécharger
    if (user.userType === "admin") return true;

    // Technicien peut télécharger son propre rapport
    if (user.userType === "technician" && intervention.technician?.user) {
      return user.id === intervention.technician.user.id;
    }

    // Client peut télécharger les rapports de ses tickets
    if (user.userType === "client" && intervention.ticket?.client) {
      return user.id === intervention.ticket.client.id;
    }

    return false; // <- obligatoire sinon la fonction retourne undefined
  };

  if (!canDownloadReport()) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-600 rounded-lg cursor-not-allowed">
        <AlertCircle className="w-4 h-4" />
        <span>No permission to download</span>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={loading}
        className="px-2 py-2 w-full flex items-center justify-center gap-2 rounded-lg border bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-gray-700"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>Download PDF Report</span>
      </button>
    </div>
  );
};

export default InterventionReportButton;
