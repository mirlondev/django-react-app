import React from "react";
import { NavLink } from "react-router-dom";

interface LinkItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

interface SidebarProps {
  links: LinkItem[];
  user: any;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Sidebar({ links, user, sidebarOpen, setSidebarOpen }: SidebarProps) {
  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition duration-200 ease-in-out lg:static lg:inset-0 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">R</span>
          </div>
          <span className="text-xl font-semibold dark:text-white">Repair Regal</span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden"
        >
          ✕
        </button>
      </div>

      <nav className="p-4 overflow-y-auto" style={{ height: "calc(100vh - 80px)" }}>
        <div className="mb-6">
          <h3 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold pl-3 mb-3">Menu</h3>
          <ul>
            {links?.map((link, index) => (
              <li key={index} className="mb-1">
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  {link.icon}
                  <span className="ml-3 dark:text-white">{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center p-3">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={user?.avatar_url || "/images/user/avatar.png"}
              alt="User"
            />
            <div className="ml-3">
              <p className="text-sm font-medium dark:text-white">{user?.username}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.userType}</p>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}