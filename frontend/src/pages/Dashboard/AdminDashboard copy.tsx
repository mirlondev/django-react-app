import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";

import { techniciansAPI, ticketsAPI } from "../../services/api";
import DashboardStats from "../../components/Dashboard/DashboardStats";
import PerformanceChart from "../../components/Charts/PerformanceChart";
import RecentTicketsList from "../../components/Tickets/RecentTicketsList";
import SystemMetrics from "../../components/Dashboard/SystemMetrics";
import { Technician, Ticket } from "../../types";
import { performanceData, ticketStatusData } from "../../types/dataMocks";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";



const AdminDashboard: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [title, setTitle] = useState('Recents Tickets');
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch tickets
      const ticketsResponse = await ticketsAPI.getAll();
      setTickets(ticketsResponse.data);
      
      // Fetch technicians
      const techniciansResponse = await techniciansAPI.getAll();
      setTechnicians(techniciansResponse.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for the dashboard
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open').length;
  const resolvedTickets = tickets.filter(t => t.status == 'closed').length;
  console.log(tickets);
  const activeTechnicians = technicians.filter(t => t).length;

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner/>
      </AuthenticatedLayout>

    );
  }

  return (
    <AuthenticatedLayout>
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
          totalTickets={totalTickets}
          openTickets={openTickets}
          resolvedTickets={resolvedTickets}
          activeTechnicians={activeTechnicians}
        />

        {/* Charts Section */}
        <PerformanceChart 
          performanceData={performanceData}
          statusData={ticketStatusData}
        />

        {/* Recent Tickets and System Performance */}
        <div className="flex flex-col space-y-6">
          <RecentTicketsList tickets={tickets} title={title}/>
          <SystemMetrics />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminDashboard;