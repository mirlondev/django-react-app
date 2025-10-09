import React, { useState, useEffect } from "react";
import {
  Ticket,
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  ChevronRight,
  Eye,
  Users,
  BarChart3,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ticketsAPI, techniciansAPI, ratingsAPI, proceduresAPI } from "../../services/api";
import {
  Ticket as TicketType,
  Technician,
  Rating,
  PerformanceData,
  PriorityData,
  StatusData,
} from "../../types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import AdminLayout from "../../components/Layout/AdminLayout";
import PerformanceChart from "../../components/Charts/PerformanceChart";
import DashboardStats from "../../components/Dashboard/DashboardStats";
import SystemMetrics from "../../components/Dashboard/SystemMetrics";
import RecentTicketsList from "../../components/Tickets/RecentTicketsList";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";
import ProcedureListCard from "../Procedures/components/Cards/ProcedureListCard";
import toast from "react-hot-toast";

const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [priorityData, setPriorityData] = useState<PriorityData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [activeTechnicians, setActiveTechnicians] = useState(0);
  const  [proceduresData, setProceduresData]=  useState([]);


  useEffect(() => {
    fetchDashboardData();
    fetchProcedures();
    fetchStats();
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      processChartData();
    }
  }, [tickets]);

  const fetchProcedures=async ()=>{
    setLoading(true);
    try {
      const res= await proceduresAPI.getAll();
      setProceduresData(res.data);
    } catch (error) {
     toast.error('procedures not available');
    }
    finally{
      setLoading(false);
    }
  }
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch tickets
      const ticketsResponse = await ticketsAPI.getAll();
      setTickets(ticketsResponse.data);

      // Fetch technicians
      const techniciansResponse = await techniciansAPI.getAll();
      setTechnicians(techniciansResponse.data);

      // Fetch ratings
      const ratingsResponse = await ratingsAPI.getUserRatings();
      setRatings(ratingsResponse.data.technician_ratings || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };



  const fetchStats = async () => {
    try {
      const techRes = await techniciansAPI.getActiveTechniciansCount();

      const techData = techRes.data;

      setActiveTechnicians(techData.active_technicians);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };


  const processChartData = () => {
    // Process performance data (resolution rate by month)
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
      tickets: 0,
      resolved: 0,
    }));

    tickets.forEach((ticket) => {
      const createdDate = new Date(ticket.created_at);
      if (createdDate.getFullYear() === currentYear) {
        const monthIndex = createdDate.getMonth();
        performanceByMonth[monthIndex].tickets += 1; // total tickets
        if (ticket.status === "closed") {
          performanceByMonth[monthIndex].resolved += 1; // tickets résolus
        }
      }
    });

    setPerformanceData(performanceByMonth);

    // Process priority data
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    tickets.forEach((ticket) => {
      const priority = ticket.priority.toLowerCase();
      if (priority in priorityCounts) {
        priorityCounts[priority as keyof typeof priorityCounts] += 1;
      }
    });

    const priorityData: PriorityData[] = [
      { name: "Low", value: priorityCounts.low, color: "#10b981" },
      { name: "Medium", value: priorityCounts.medium, color: "#f59e0b" },
      { name: "High", value: priorityCounts.high, color: "#ef4444" },
      { name: "Critical", value: priorityCounts.critical, color: "#7e22ce" },
    ];

    setPriorityData(priorityData);

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
      open: "#f59e0b", // Amber
      in_progress: "#3b82f6", // Blue
      closed: "#10b981", // Green
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
  const totalTickets = tickets.length;

  const openTickets = tickets.filter((t) => t.status === "open").length;
  const resolvedTickets = tickets.filter((t) => t.status === "closed").length;

  // Calculate average rating
  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        ).toFixed(1)
      : "0.0";

  // Calculate resolution rate
  const resolutionRate =
    totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  if (loading) {
    return (
      <AdminLayout>
        <LoadingSpinner/>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-lg">
            Welcome to your modern admin dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <DashboardStats
          openTickets={openTickets}
          totalTickets={totalTickets}
          resolvedTickets={resolvedTickets}
          activeTechnicians={activeTechnicians}
        />

        {/* Charts Section */}
        <PerformanceChart
          performanceData={performanceData}
          statusData={statusData}
        />

        {/* Recent Tickets and System Performance */}
        <div className="flex flex-col space-y-6">
          <RecentTicketsList tickets={tickets} title={"Recent Tickets"} />
         
        </div>

        <ProcedureListCard proceduresData={proceduresData}/>  {/* System Performance */}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
