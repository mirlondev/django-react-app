import React, { useState, useRef, useEffect, Suspense, lazy } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Home, Clipboard, Users, ToolCase, BookOpen } from "lucide-react";
import Header from "./Header";
import { notificationsAPI } from "../../services/api";
import Sidebar from "./SideBar";

const GlobalSearch = lazy(() => import("../Search/GlobalSearch"));

export default function AppLayout({
  children,
  roleProp,
}: {
  children: React.ReactNode;
  roleProp?: string;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = roleProp || user?.userType;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getUnread();
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const links = [
    {
      name: "Dashboard",
      icon: <Home className="w-5 h-5" />,
      path: `/${role}/dashboard`,
    },
    {
      name: "Tickets",
      icon: <Clipboard className="w-5 h-5" />,
      path: "/tickets",
    },
    {
      name: "Procedures",
      icon: <BookOpen className="w-5 h-5" />,
      path: "/procedures",
    },
  ];

  if (user?.userType === "admin") {
    links.push({
      name: "Users",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/users",
    });
    links.push({
      name: "Interventions",
      icon: <ToolCase className="w-5 h-5" />,
      path: "/interventions",
    });
  } else if (user?.userType === "technician") {
    links.push({
      name: "Interventions",
      icon: <ToolCase className="w-5 h-5" />,
      path: "/interventions",
    });
  }

  if (!role) return <p className="p-6">Chargement du rôle...</p>;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar
        links={links}
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col">
        <Header
          user={user}
          notifications={notifications}
          notificationsOpen={notificationsOpen}
          setNotificationsOpen={setNotificationsOpen}
          profileDropdownOpen={profileDropdownOpen}
          setProfileDropdownOpen={setProfileDropdownOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
          toggleGlobalSearch={() => setShowGlobalSearch(!showGlobalSearch)}
        />

        <main className="flex-1 w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl overflow-y-auto transition-colors duration-200">
          {children}
        </main>
      </div>
      <Suspense fallback={null}>
        <GlobalSearch
          isOpen={showGlobalSearch}
          onClose={() => setShowGlobalSearch(false)}
          onNavigate={(type, id) => {
            navigate(`/${type}/${id}`);
          }}
        />
      </Suspense>
    </div>
  );
}
