import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import { proceduresAPI, ratingsAPI, ticketsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import DashboardStats from "../../components/Dashboard/DashboardStats";
import { Ticket, Rating, PerformanceData, PriorityData, StatusData, Procedure } from "../../types";
import { BarChart3, ChevronRight, Eye, Star, User, Users } from "lucide-react";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";
import RecentTicketsList from "../../components/Tickets/RecentTicketsList";
import PerformanceTechnicianChart from "../../components/Charts/TechnicianChart";
import RatingCard from "../../components/Rating/RatingCard";
import ProcedureListCard from "../Procedures/components/Cards/ProcedureListCard";



const TechnicianDashboard = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [procedures, setProcedures]=useState<Procedure[]>([]);

  const { user } = useAuth();
  const [userRatings, setUserRatings] = useState<Rating[]>([]);

  useEffect(() => {
    fetchTickets();
    fetchProcedures();
    }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      processChartData(tickets);
    }
  }, [tickets]);

 /* const fetchUserRatings = async () => {
    try {
      const response = await ratingsAPI.getUserRatings();
      setUserRatings(response.data.technician_ratings || []);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    }
  };*/
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketsAPI.getAll();
      const allTickets: Ticket[] = response.data;

      // Filtrer les tickets assignés au technicien actuel
      const technicianTickets = response.data.filter(
        (ticket: Ticket) => ticket.technician?.user?.id === user?.id
      );
      setTickets(technicianTickets);

      // Traiter les données pour le graphique de performance
      processChartData(technicianTickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProcedures = async () => {
    setLoading(true);
    try {
      const res = await proceduresAPI.getAll();

      // Filtrer les tickets assignés au technicien actuel    
      setProcedures(res.data);

      // Traiter les données pour le graphique de performanc
    } catch (error) {
      console.error("Error fetching procedures:", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (tickets: Ticket[]) => {
    if (!tickets || tickets.length === 0) {
      setPerformanceData([]);
      setPriorityData([]);
      return;
    }

    const currentYear = new Date().getFullYear();
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const performanceByMonth: PerformanceData[] = monthNames.map((month) => ({
      name: month,
      assigned: 0,
      completed: 0,
    }));

    tickets.forEach((ticket) => {
      const createdDate = new Date(ticket.created_at);
      if (createdDate.getFullYear() === currentYear) {
        const monthIndex = createdDate.getMonth();
        performanceByMonth[monthIndex].assigned += 1;

        if (
          ticket.status === "closed" ||
          ticket.status === "resolved"
        ) {
          performanceByMonth[monthIndex].completed += 1;
        }
      }
    });

    setPerformanceData(performanceByMonth);

    // ✅ Calcul des priorités
    const priorityCounts: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    tickets.forEach((ticket) => {
      if (ticket.priority && priorityCounts[ticket.priority] !== undefined) {
        priorityCounts[ticket.priority] += 1;
      }
    });

    const newPriorityData: PriorityData[] = [
      { name: "Low", value: priorityCounts.low, color: "#10b981" },
      { name: "Medium", value: priorityCounts.medium, color: "#f59e0b" },
      { name: "High", value: priorityCounts.high, color: "#ef4444" },
      { name: "Urgent", value: priorityCounts.urgent, color: "#7e22ce" },
    ];

    setPriorityData(newPriorityData);

    const statusCounts: Record<string, number> = {
      open: 0,
      in_progress: 0,
      closed: 0,
      // Add other statuses if needed
    };

    tickets.forEach((ticket) => {
      if (ticket.status in statusCounts) {
        statusCounts[ticket.status] += 1;
      }
    });

    const statusColors: Record<string, string> = {
      open: "#f59e0b",      // Amber
      in_progress: "#3b82f6", // Blue
      closed: "#10b981",    // Green
      // Add other status colors if needed
    };

    const statusLabels: Record<string, string> = {
      open: "Open",
      in_progress: "In Progress",
      closed: "Closed",
      // Add other status labels if needed
    };

    const statusData: StatusData[] = Object.entries(statusCounts).map(
      ([status, count]) => ({
        name: statusLabels[status] || status,
        value: count,
        color: statusColors[status] || "#6b7280", // Default to gray if status not found
      })
    );

    setStatusData(statusData);
  };

  // Calculate stats for the dashboard
  const totalAssignedTickets = tickets.length;
  const openTickets = tickets.filter((t) => t.status === "open").length;
  const inProgressTickets = tickets.filter(
    (t) => t.status === "in_progress"
  ).length;
  const completedTickets = tickets.filter(
    (t) => t.status === "closed" || t.status === "completed"
  ).length;

  const averageRating =
    userRatings.length > 0
      ? (
          userRatings.reduce((sum, r) => sum + r.rating, 0) / userRatings.length
        ).toFixed(1)
      : "0";

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Technician Dashboard
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg">
            Manage your assigned tickets and track your performance
          </p>
        </div>

        {/* Stats Grid */}
        <DashboardStats
          openTickets={openTickets}
          totalTickets={totalAssignedTickets}
          resolvedTickets={completedTickets}
          averageRating={averageRating}
        />

        {/* Charts */}

        <PerformanceTechnicianChart
          performanceData={performanceData}
          statusData={priorityData}
        />

        {/* Assigned Tickets and Recent Ratings */}
        <div className="flex flex-col space-y-6">
          {/* Assigned Tickets */}
          <RecentTicketsList
            tickets={tickets}
            title="Rencents and Assigned tickets"
          />

          <ProcedureListCard proceduresData={procedures}/>


        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default TechnicianDashboard;
