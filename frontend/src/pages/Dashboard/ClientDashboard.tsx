import React, { useState, useEffect, useRef } from "react";
import {
  Ticket,
  Plus,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  Calendar,
  ChevronRight,
  Eye,
  Star,
  FileText,
  Wrench,
  Settings,
  Zap,
  Monitor
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import ClientLayout from "../../components/Layout/ClientLayout";
import { proceduresAPI, ratingsAPI, ticketsAPI } from "../../services/api";
import { Procedure, Ticket as TicketType } from "../../types";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";
import toast from "react-hot-toast";
import RatingCard from "../../components/Rating/RatingCard";
import RatingForm from "../../components/Rating/RatingForm";
import RatingStars from "../../components/Rating/RatingStars";
import DashboardStats from "../../components/Dashboard/DashboardStats";
import { getPriorityBadge, getStatusBadge } from "../../utils/badge";
import RecentTicketsList from "../../components/Tickets/RecentTicketsList";
import ProcedureListCard from "../Procedures/components/Cards/ProcedureListCard";

// Données des procédures



const ClientDashboard = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [title, setTitle] = useState('Recents Tickets');
  const  [proceduresData, setProceduresData]=  useState([]);

  useEffect(() => {
    fetchTickets();
    fetchUserRatings();
    fetchProcedures();
  }, []);

  const fetchUserRatings = async () => {
    try {
      const response = await ratingsAPI.getUserRatings();
      setUserRatings(response.data.client_ratings || []);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };
console.log(user.name);
  const fetchProcedures=async ()=>{
    setLoading(true);
    try {
      const response= await proceduresAPI.getAll();
      setProceduresData(response.data);
    } catch (error) {
     toast.error('procedures not available');
    }
    finally{
      setLoading(false);
    }
  }
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketsAPI.getAll();
      // Filter tickets for the current client
      const clientTickets = response.data.filter(
        (ticket: TicketType) => ticket.client.user.id === user?.id
      );
      setTickets(clientTickets);

      // Check which technicians can be rated
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };



  




  // Calculate stats for the dashboard
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "in_progress"
  ).length;
  const closedTickets = tickets.filter((t) => t.status === "closed").length;

  if (loading) {
    return (
      <ClientLayout>
        <LoadingSpinner />
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="p-4 min-h-screen bg-gray-50 dark:bg-gray-900 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Client Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.first_name} {user?.last_name}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <DashboardStats 
          totalTickets={totalTickets}
          openTickets={openTickets}
          resolvedTickets={closedTickets}
          inProgressTickets={inProgressTickets} />

        {/* Tickets List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
          <RecentTicketsList tickets={tickets} title={title}/>
        </div>

        {/* Procédures de Réparation Section */}
        <ProcedureListCard proceduresData={proceduresData}/>


        
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;