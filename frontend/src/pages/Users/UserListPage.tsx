import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  UserCheck,
  UserCog,
  ChevronDown,
  X,
  ArrowUpDown,
  Shield,
  UserPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api, { usersAPI } from "../../services/api";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import Pagination from "../../components/Pagination/Pagination";
import Button from "../../components/ui/Button";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal";
import MobileUserCard from "../../components/Cards/MobileUserCard";
import { getUserTypeBadge } from "../../utils/badge";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";

const UserListPage = () => {
  const [users, setUsers] = useState< typeof User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<typeof User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("username");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [selectedUser, setSelectedUser] = useState<typeof User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Close action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort users
  useEffect(() => {
    let result = users;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(searchLower) ||
          user.first_name.toLowerCase().includes(searchLower) ||
          user.last_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.userType.toLowerCase().includes(searchLower)
      );
    }

    // Apply user type filter
    if (userTypeFilter !== "all") {
      result = result.filter((user) => user.userType === userTypeFilter);
    }

    // Apply sorting
    result = [...result].sort((a, b) => {
      const aValue = a[sortField as keyof User];
      const bValue = b[sortField as keyof User];

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredUsers(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [users, searchTerm, userTypeFilter, sortField, sortOrder]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await usersAPI.delete(selectedUser.id);
      toast.success("User deleted successfully");
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const UserTypeFilter = () => (
    <select
      value={userTypeFilter}
      onChange={(e) => setUserTypeFilter(e.target.value)}
      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-stroke dark:bg-form-input dark:text-white dark:focus:border-primary bo dark:bg-gray-600"
    >
      <option value="all" >All Types</option>
      <option value="admin">Admin</option>
      <option value="technician">Technician</option>
      <option value="client">Client</option>
    </select>
  );

  const SortHeader = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <th
      className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider cursor-pointer dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        <ArrowUpDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />
      </div>
    </th>
  );

  if (loading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            Users
          </h1>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Manage all system users
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {/* Header with actions */}
          <div className="border-b border-gray-200 py-4 px-6 dark:border-gray-700">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-gray-300 bg-transparent py-3 pl-12 pr-4 text-black outline-none transition focus:border-blue-500 active:border-blue-500 disabled:cursor-default disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-500 md:w-64"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center gap-2.5 rounded-md border border-gray-300 bg-gray-100 px-4 py-3 text-center font-medium text-black transition hover:bg-opacity-90 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {showFilters ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className="max-w-full flex flex-col md:flex-row md:gap-3">
                <Link to="/admin/users/add" className="w-full md:flex-1">
                  <Button variant="primary" className="w-full">
                    <UserPlus className="h-4 w-4" />
                    New User
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="border-b border-gray-200 bg-gray-50 px-6.5 py-4 dark:border-gray-700 dark:bg-gray-700">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    User Type
                  </label>
                  <UserTypeFilter />
                </div>
              </div>
            </div>
          )}

          <div className="block lg:hidden">
            {currentItems.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                No users found
              </div>
            ) : (
              <div className="p-3">
                {currentItems.map((userItem) => (
                  <MobileUserCard
                    key={userItem.id}
                    user={userItem}
                    openActionMenu={openActionMenu}
                    setOpenActionMenu={setOpenActionMenu}
                    setSelectedUser={setSelectedUser}
                    setShowDeleteModal={setShowDeleteModal}
                    userType={user?.userType}
                  />
                ))}
              </div>
            )}
          </div>


          <div className="hidden lg:block w-full overflow-x-auto">         
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50 text-left dark:bg-gray-700">
                    <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                      User
                    </th>
                    <SortHeader field="username">Username</SortHeader>
                    <SortHeader field="email">Email</SortHeader>
                    <SortHeader field="userType">Type</SortHeader>
                    <th className="px-4 py-4 text-left text-xs font-medium text-black uppercase tracking-wider dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((userItem, key) => (
                      <tr
                        key={userItem.id}
                        className={`${
                          key === currentItems.length - 1
                            ? ""
                            : "border-b border-gray-200 dark:border-gray-700"
                        } hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                      >
                        <td className="px-4 py-5 pl-9 xl:pl-11">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {userItem.profile_image ? (
                                <img
                                  src={userItem.profile_image}
                                  alt={userItem.username}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                                  <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="text-black dark:text-white font-medium">
                                {userItem.first_name} {userItem.last_name}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {userItem.id.substring(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <p className="text-black dark:text-white">
                            {userItem.username}
                          </p>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            <span className="text-black dark:text-white">
                              {userItem.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          {getUserTypeBadge(userItem.userType)}
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center space-x-3.5">
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenActionMenu(
                                    openActionMenu === userItem.id
                                      ? null
                                      : userItem.id
                                  );
                                }}
                                className="hover:text-blue-500 dark:hover:text-blue-400"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {openActionMenu === userItem.id && (
                                <div
                                  ref={actionMenuRef}
                                  className="absolute right-0 z-40 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
                                >
                                  <ul className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                                    <li>
                                      <Link
                                        to={`/admin/users/${userItem.id}`}
                                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400 lg:text-base text-black dark:text-white"
                                      >
                                        <Eye className="h-4 w-4" />
                                        View Details
                                      </Link>
                                    </li>
                                    <li className="mt-2">
                                      <Link
                                        to={`/admin/users/${userItem.id}/edit`}
                                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-blue-500 dark:hover:text-blue-400 lg:text-base text-black dark:text-white"
                                      >
                                        <Edit className="h-4 w-4" />
                                        Edit
                                      </Link>
                                    </li>
                                    <li className="mt-2">
                                      <button
                                        onClick={() => {
                                          setSelectedUser(userItem);
                                          setShowDeleteModal(true);
                                          setOpenActionMenu(null);
                                        }}
                                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-red-500 dark:hover:text-red-400 lg:text-base text-black dark:text-white w-full text-left"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            totalItems={filteredUsers.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            setItemsPerPage={setItemsPerPage}
          />
        </div>

        {/* Modals */}
        {showDeleteModal && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedUser(null); // reset pour éviter overlay bloquant
            }}
            onConfirm={handleDeleteUser}
            dataName={
              selectedUser ? `the user : "${selectedUser.username}"` : undefined
            }
          />
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default UserListPage;
