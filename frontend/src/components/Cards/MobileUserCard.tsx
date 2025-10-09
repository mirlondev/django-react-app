// components/Cards/MobileUserCard.tsx
import React from "react";
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User2,
  Mail,
  Shield,
  UserCheck,
  UserCog,
} from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "../../types";

interface MobileUserCardProps {
  user: User;
  openActionMenu: string | null;
  setOpenActionMenu: (id: string | null) => void;
  setSelectedUser: (user: User) => void;
  setShowDeleteModal: (show: boolean) => void;
  userType?: string;
}

const MobileUserCard: React.FC<MobileUserCardProps> = ({
  user,
  setOpenActionMenu,
  setSelectedUser,
  setShowDeleteModal,
  userType,
}) => {
  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case "admin":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "technician":
        return <UserCog className="w-4 h-4 text-blue-500" />;
      case "client":
        return <UserCheck className="w-4 h-4 text-green-500" />;
      default:
        return <User2 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getUserTypeBadge = (userType: string) => {
    const typeMap: Record<string, { text: string; class: string }> = {
      admin: {
        text: "Admin",
        class: "bg-purple-100 text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
      },
      technician: {
        text: "Technician",
        class: "bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      },
      client: {
        text: "Client",
        class: "bg-green-100 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      },
    };

    const typeInfo = typeMap[userType] || {
      text: userType,
      class: "bg-gray-100 text-gray-800 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${typeInfo.class}`}
      >
        {getUserTypeIcon(userType)}
        {typeInfo.text}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {user.profile_image ? (
            <img
              src={user.profile_image}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <User2 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-black dark:text-white">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{user.username}
            </p>
          </div>
        </div>
        
        {/* Action buttons in 2 groups */}
        <div className="flex flex-col gap-1">
          {/* First group */}
          <div className="flex items-center gap-1">
            <Link
              to={`/admin/users/${user.id}`}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded transition-colors"
              title="View Details"
            >
              <Eye className="h-4 w-4" />
            </Link>
            
            <Link
              to={`/admin/users/${user.id}/edit`}
              className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 rounded transition-colors"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </Link>
          </div>
          
          {/* Second group */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedUser(user);
                setShowDeleteModal(true);
                setOpenActionMenu(null);
              }}
              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            {/* Empty space for alignment */}
            <div className="w-7 h-7"></div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-black dark:text-white truncate">
            {user.email}
          </span>
        </div>
        <div className="flex justify-end">
          {getUserTypeBadge(user.userType)}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          ID: {user.id.substring(0, 8)}...
        </p>
      </div>
    </div>
  );
};

export default MobileUserCard;