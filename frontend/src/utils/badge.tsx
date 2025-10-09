// utils/badge.ts
import { Shield, UserCog, UserCheck, User } from "lucide-react";

export const getStatusBadge = (status: string) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border";

  switch (status) {
    case "open":
      return (
        <span className={`${base} bg-amber-50 text-amber-600 border-amber-200`}>
          Open
        </span>
      );
    case "in_progress":
      return (
        <span className={`${base} bg-sky-50 text-sky-600 border-sky-200`}>
          In Progress
        </span>
      );
    case "closed":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-600 border-emerald-200`}>
          Closed
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-50 text-slate-600 border-slate-200`}>
          {status}
        </span>
      );
  }
};

export const getPriorityBadge = (priority: string) => {
  const base =
    "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border";

  switch (priority) {
    case "critical":
      return (
        <span className={`${base} bg-rose-50 text-rose-600 border-rose-200`}>
          Critical
        </span>
      );
    case "high":
      return (
        <span className={`${base} bg-orange-50 text-orange-600 border-orange-200`}>
          High
        </span>
      );
    case "medium":
      return (
        <span className={`${base} bg-amber-50 text-amber-600 border-amber-200`}>
          Medium
        </span>
      );
    case "low":
      return (
        <span className={`${base} bg-teal-50 text-teal-600 border-teal-200`}>
          Low
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-50 text-slate-600 border-slate-200`}>
          {priority}
        </span>
      );
  }
};

const getUserTypeIcon = (userType: string) => {
  switch (userType) {
    case "admin":
      return <Shield className="w-4 h-4 text-indigo-500" />;
    case "technician":
      return <UserCog className="w-4 h-4 text-cyan-500" />;
    case "client":
      return <UserCheck className="w-4 h-4 text-emerald-500" />;
    default:
      return <User className="w-4 h-4 text-slate-500" />;
  }
};

export const getUserTypeBadge = (userType: string) => {
  const base =
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border";

  switch (userType) {
    case "admin":
      return (
        <span
          className={`${base} bg-indigo-50 text-indigo-600 border-indigo-200`}
        >
          {getUserTypeIcon("admin")} Admin
        </span>
      );
    case "technician":
      return (
        <span
          className={`${base} bg-cyan-50 text-cyan-600 border-cyan-200`}
        >
          {getUserTypeIcon("technician")} Technician
        </span>
      );
    case "client":
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-600 border-emerald-200`}
        >
          {getUserTypeIcon("client")} Client
        </span>
      );
    default:
      return (
        <span
          className={`${base} bg-slate-50 text-slate-600 border-slate-200`}
        >
          {getUserTypeIcon(userType)} {userType}
        </span>
      );
  }
};