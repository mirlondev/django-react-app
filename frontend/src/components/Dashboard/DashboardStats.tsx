import React from "react";
import {
  Ticket,
  UserCheck,
  TrendingUp,
  Clock,
  CheckCircle,
  TrendingDown,
  Star,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ReactNode;
  gradient: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType,
  icon,
  gradient,
}) => (
  <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-white/20 dark:border-gray-700/20 transition-all duration-300 hover:shadow-lg hover:scale-105 group">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-600 dark:text-gray-400 mb-2">
          {title}
        </p>
        <p className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
          {value}
        </p>
        <div className="flex items-center">
          {changeType === "up" ? (
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-rose-500" />
          )}
          <span
            className={`text-sm ml-1 font-medium ${
              changeType === "up" ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {change}
          </span>
          <span className="text-sm text-slate-500 dark:text-gray-400 ml-1">
            vs last month
          </span>
        </div>
      </div>
      <div className={`p-4 rounded-2xl ${gradient} transform group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
    </div>
  </div>
);

interface DashboardStatsProps {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  activeTechnicians?: number;
  inProgressTickets?:number;
  averageRating?:number;
  
}

const DashboardStats=({
  totalTickets,
  openTickets,
  resolvedTickets,
  activeTechnicians,
  inProgressTickets,
  averageRating
}:DashboardStatsProps) => {
  const stats = [
    {
      title: "Total Tickets",
      value: totalTickets.toString(),
      change: "+12%",
      changeType: "up" as const,
      icon: <Ticket className="w-6 h-6 text-white" />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    {
      title: "Open Tickets",
      value: openTickets.toString(),
      change: "+8%",
      changeType: "up" as const,
      icon: <Clock className="w-6 h-6 text-white" />,
      gradient: "bg-gradient-to-br from-amber-500 to-orange-500",
    },
    {
      title: "Resolved Tickets",
      value: resolvedTickets.toString(),
      change: "+15%",
      changeType: "up" as const,
      icon: <CheckCircle className="w-6 h-6 text-white" />,
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-500",
    },
    activeTechnicians !== undefined  && {
      title: "Active Technicians",
      value:  activeTechnicians?.toString() ?? "0",
      change: "-2%",
      changeType: "down" as const,
      icon: <UserCheck className="w-6 h-6 text-white" />,
      gradient: "bg-gradient-to-br from-purple-500 to-indigo-500",
    },
    inProgressTickets !== undefined && {
      title: "In Progress",
      value: inProgressTickets.toString(),
      change: "-2%",
      changeType: "down" as const,
      icon: <Clock className="w-6 h-6 text-white" />,
      gradient: "bg-gradient-to-br from-purple-500 to-indigo-500",
    },

    averageRating !== undefined &&{
      title: "Average Rating",
      value: averageRating.toString(),
      change: "+0.2",
      changeType: "up" as const,
      icon: <Star className="w-6 h-6 text-white" />,
      gradient: "bg-gradient-to-br from-purple-500 to-indigo-500",
    },
  ].filter(Boolean) as StatCardProps[]; // <- filtre les entrées "false" (null/undefined)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;

