import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  MessageSquare,
  User,
  AlertTriangle,
  Clock,
  FileText,
  Save,
  X,
  Upload,
  Trash2,
  Paperclip,
  UserCheck,
  Shield,
  Tag,
  Package,
  Calendar,
  Wrench,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api, {
  ticketsAPI,
  techniciansAPI,
  clientsAPI,
} from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import AuthenticatedLayout from "../../components/Auth/AuthenticatedLayout";
import LoadingSpinner from "../../components/Layout/LoadingSpinner";
import Button from "../../components/ui/Button";

// Extended Validation schema to match backend model
const ticketSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  client_id: z.union([z.string(), z.number()]).transform(String).optional(),
  technician_id: z.string().optional(),
  material_name: z.string().optional(),
  problem_start_date: z.string().optional(),
  problem_type: z.string().optional(),
  tags: z.string().optional(),
  images: z.any().optional(),
});

type TicketFormData = z.infer<typeof ticketSchema>;

interface TicketFormProps {
  ticket?: any;
  isEdit?: boolean;
}

const TicketForm: React.FC<TicketFormProps> = ({
  ticket: propTicket,
  isEdit = false,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [fetchingTicket, setFetchingTicket] = useState(isEdit);
  const [ticket, setTicket] = useState(propTicket);
  const [technicians, setTechnicians] = useState([]);
  const [clients, setClients] = useState([]);
  const [images, setImages] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "open",
      client_id: "",
      technician_id: "",
      material_name: "",
      problem_start_date: "",
      problem_type: "",
      tags: "",
    },
  });

  // Fetch ticket data when in edit mode
  useEffect(() => {
    const fetchTicketData = async () => {
      if (isEdit && id && !propTicket) {
        try {
          setFetchingTicket(true);
          const response = await ticketsAPI.getById(id);
          const ticketData = response.data;
          setTicket(ticketData);
        } catch (error) {
          console.error("Error fetching ticket:", error);
          toast.error("Failed to fetch ticket data");
          navigate("/tickets");
        } finally {
          setFetchingTicket(false);
        }
      } else if (propTicket) {
        setTicket(propTicket);
        setFetchingTicket(false);
      } else {
        setFetchingTicket(false);
      }
    };

    fetchTicketData();
  }, [isEdit, id, propTicket, navigate]);

  // Fetch technicians and clients
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        if (user?.userType === "admin") {
          const [techResponse, clientResponse] = await Promise.all([
            techniciansAPI.getAll(),
            clientsAPI.getAll(),
          ]);
          setTechnicians(techResponse.data || []);
          setClients(clientResponse.data || []);
        } else if (user?.userType === "client") {
          // For clients, set the current client as the only option
          setClients([
            {
              id: user.client_profile?.id || user.id,
              user: {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
              },
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
        toast.error("Failed to load form data");
      }
    };

    fetchDropdownData();
  }, [user]);

  // Populate form fields when ticket data is available
  useEffect(() => {
    if (ticket && !fetchingTicket) {
      // Set each field individually to avoid form reset flicker
      setValue("title", ticket.title || "");
      setValue("description", ticket.description || "");
      setValue("priority", ticket.priority || "medium");
      setValue("status", ticket.status || "open");
      setValue("client_id", ticket.client?.id?.toString() || "");
      setValue("technician_id", ticket.technician?.id?.toString() || "");
      setValue("material_name", ticket.material_name || "");
      setValue("problem_type", ticket.problem_type || "");
      setValue("tags", ticket.tags || "");

      // Format date for date input
      if (ticket.problem_start_date) {
        const date = new Date(ticket.problem_start_date);
        const formattedDate = date.toISOString().split("T")[0];
        setValue("problem_start_date", formattedDate);
      }
    } else if (!isEdit && user?.userType === "client") {
      // For client users creating a new ticket, set their client ID
      setValue("client_id", user.client_profile?.id || "");
    }
  }, [ticket, fetchingTicket, setValue, user, isEdit]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setUploadingImages(true);
      setImages((prev) => [...prev, ...files]);
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: TicketFormData) => {
    setLoading(true);

    try {
      const formData = new FormData();

      // Append all fields to formData
      Object.keys(data).forEach((key) => {
        if (key === "images") {
          // Skip images field, handle separately
          return;
        }

        const value = data[key as keyof TicketFormData];
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Append images
      images.forEach((file) => {
        formData.append("images", file);
      });

      let result;
      if (isEdit && id) {
        result = await ticketsAPI.update(id, formData);
        toast.success("Ticket updated successfully");
      } else {
        result = await ticketsAPI.create(formData);
        toast.success("Ticket created successfully");
      }

      navigate("/tickets");
    } catch (error: any) {
      console.error("Error saving ticket:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to save ticket";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isReadOnly = isEdit && user?.userType !== "admin";
  const onCancel = () => {
    navigate("/tickets");
  };

  // Show loading spinner while fetching ticket data
  if (fetchingTicket) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            {isEdit ? "Edit Ticket" : "Create New Ticket"}
          </h1>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {isEdit && user?.userType === "client"
              ? "Update ticket information remember you only send us images of the problem"
              : "Submit a new support request"}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Title *
              </label>
              <div className="relative">
                <input
                  disabled={user?.userType === "client" && isEdit}
                  type="text"
                  {...register("title")}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter ticket title"
                />
                <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Description *
              </label>
              <div className="relative">
                <textarea
                  disabled={user?.userType === "client" && isEdit}
                  {...register("description")}
                  rows={6}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary resize-vertical"
                  placeholder="Describe the issue in detail"
                />
                <FileText className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Material Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Material Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={user?.userType === "client" && isEdit}
                  {...register("material_name")}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Equipment or material name"
                />
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </div>

            {/* Problem Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Problem Type
              </label>
              <div className="relative">
                <input
                  disabled={user?.userType === "client" && isEdit}
                  type="text"
                  {...register("problem_type")}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Type of problem"
                />
                <Wrench className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </div>

            {/* Problem Start Date */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Problem Start Date
              </label>
              <div className="relative">
                <input
                  disabled={user?.userType === "client" && isEdit}
                  type="date"
                  {...register("problem_start_date")}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Tags
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register("tags")}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Comma-separated tags"
                />
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Priority *
              </label>
              <Controller
                disabled={user?.userType === "client" && isEdit}
                name="priority"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        value: "low",
                        label: "Low Priority",
                        icon: <Clock className="w-5 h-5" />,
                        color: "text-green-600",
                      },
                      {
                        value: "medium",
                        label: "Medium Priority",
                        icon: <Clock className="w-5 h-5" />,
                        color: "text-yellow-600",
                      },
                      {
                        value: "high",
                        label: "High Priority",
                        icon: <AlertTriangle className="w-5 h-5" />,
                        color: "text-orange-600",
                      },
                      {
                        value: "urgent",
                        label: "Urgent Priority",
                        icon: <AlertTriangle className="w-5 h-5" />,
                        color: "text-red-600",
                      },
                    ].map((priority) => (
                      <label
                        key={priority.value}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                          field.value === priority.value
                            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        <input
                          disabled={user?.userType === "client" && isEdit}
                          type="radio"
                          {...field}
                          value={priority.value}
                          checked={field.value === priority.value}
                          onChange={() => field.onChange(priority.value)}
                          className="hidden"
                        />
                        <span className={priority.color}>{priority.icon}</span>
                        {priority.label}
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.priority && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.priority.message}
                </p>
              )}
            </div>

            {/* Status (only for edit mode and admins/technicians) */}
            {isEdit && user?.userType !== "client" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Status
                </label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        {
                          value: "open",
                          label: "Open",
                          icon: <MessageSquare className="w-5 h-5" />,
                          color: "text-yellow-600",
                        },
                        {
                          value: "in_progress",
                          label: "In Progress",
                          icon: <Clock className="w-5 h-5" />,
                          color: "text-blue-600",
                        },
                        {
                          value: "resolved",
                          label: "Resolved",
                          icon: <Shield className="w-5 h-5" />,
                          color: "text-green-600",
                        },
                        {
                          value: "closed",
                          label: "Closed",
                          icon: <Shield className="w-5 h-5" />,
                          color: "text-gray-600",
                        },
                      ].map((status) => (
                        <label
                          key={status.value}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                            field.value === status.value
                              ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            {...field}
                            value={status.value}
                            checked={field.value === status.value}
                            onChange={() => field.onChange(status.value)}
                            className="hidden"
                          />
                          <span className={status.color}>{status.icon}</span>
                          {status.label}
                        </label>
                      ))}
                    </div>
                  )}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.status.message}
                  </p>
                )}
              </div>
            )}

            {/* Client Selection (only for admins) */}
            {user?.userType === "admin" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Client *
                </label>
                <div className="relative">
                  <select
                    {...register("client_id")}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select a client</option>
                    {clients.map((client: any) => (
                      <option key={client.id} value={client.id}>
                        {client.user.first_name} {client.user.last_name} (
                        {client.user.email})
                      </option>
                    ))}
                  </select>
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                </div>
                {errors.client_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.client_id.message}
                  </p>
                )}
              </div>
            )}

            {/* Technician Assignment (only for admins) */}
            {user?.userType === "admin" && (
              <div>
                <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                  Assign Technician
                </label>
                <div className="relative">
                  <select
                    {...register("technician_id")}
                    disabled={isReadOnly}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-stroke dark:bg-form-input dark:text-white dark:focus:border-primary dark:bg-gray-600 "
                  >
                    <option value="">Select a technician (optional)</option>
                    {technicians.map((tech: any) => (
                      <option key={tech.id} value={tech.id}>
                        {tech.user.first_name} {tech.user.last_name} (
                        {tech.specialty})
                      </option>
                    ))}
                  </select>
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                </div>
                {errors.technician_id && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.technician_id.message}
                  </p>
                )}
              </div>
            )}

            {/* images */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                images
              </label>
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingImages ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">
                              Click to upload
                            </span>{" "}
                            or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PNG, JPG, PDF, DOC up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      id="images"
                      type="file"
                      multiple
                      accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>

                {/* Display selected images */}
                {images.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-black dark:text-white">
                      Selected Files:
                    </h4>
                    {images.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-black dark:text-white">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col gap-2 max-w-full md:justify-end md:space-x-4 md:pt-6 md:border-gray-200 dark:border-gray-700">
            <Button type="button" onClick={onCancel} variant="secondary" className="max-w-full">
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading} variant="primary" className="w-full">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {isEdit ? "Update Ticket" : "Create Ticket"}
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};

export default TicketForm;
