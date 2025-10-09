import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  MessageSquare,
  UserCheck,
  Tag,
  Paperclip,
  Save,
  X,
  AlertCircle,
  Clock,
  MapPin,
  Award,
  Shield,
  Star,
} from "lucide-react";
import AuthenticatedLayout from "../components/Auth/AuthenticatedLayout";
import api, { clientsAPI, techniciansAPI, ticketsAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Client Form Component
export const ClientForm = ({
  clientData,
  onSuccess,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    ...clientData,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        await api.clientsAPI.update(formData.id, formData);
        toast.success("Client updated successfully");
      } else {
        await api.clientsAPI.create(formData);
        toast.success("Client created successfully");
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} client`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <User className="w-5 h-5 mr-2" />
        {isEdit ? "Edit Client" : "Create New Client"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Company *</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={2}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Client" : "Create Client"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Technician Form Component
export const TechnicianForm = ({
  technicianData,
  onSuccess,
  onCancel,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    specialty: "",
    experience: "",
    ...technicianData,
  });
  const [isLoading, setIsLoading] = useState(false);

  const specialtyOptions = [
    { value: "hardware", label: "Hardware" },
    { value: "software", label: "Software" },
    { value: "network", label: "Network" },
    { value: "security", label: "Security" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        await api.techniciansAPI.update(formData.id, formData);
        toast.success("Technician updated successfully");
      } else {
        await api.techniciansAPI.create(formData);
        toast.success("Technician created successfully");
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving technician:", error);
      toast.error(`Failed to ${isEdit ? "update" : "create"} technician`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <UserCheck className="w-5 h-5 mr-2" />
        {isEdit ? "Edit Technician" : "Create New Technician"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Specialty *</label>
          <div className="relative">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Select a specialty</option>
              {specialtyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Experience (years)
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              min="0"
              max="50"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Technician" : "Create Technician"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Intervention Form Component
export const InterventionForm = ({ ticketId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    report: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.interventionsAPI.create({
        ticket: ticketId,
        report: formData.report,
      });

      toast.success("Intervention report submitted successfully");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating intervention:", error);
      toast.error("Failed to submit intervention report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <Shield className="w-5 h-5 mr-2" />
        Add Intervention Report
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Report *</label>
          <textarea
            name="report"
            value={formData.report}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
            placeholder="Describe the intervention details, findings, and actions taken..."
            required
          ></textarea>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export const TicketForm = ({
  ticketData,
  onSuccess,
  onCancel,
  isEdit = false,
}) => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
    client: user.id, // fixé automatiquement
    technician: ticketData?.technician?.id || "",
    ...ticketData,
  });
  useEffect(() => {
    console.log("Current user:", user);
    if (user?.userType === "admin" || user?.userType === "technician") {
      fetchClients();
      fetchTechnicians();
    }
  }, [user]);

  const fetchClients = async () => {
    try {
      const response = await clientsAPI.getAll();
      console.log("Fetched clients:", response.data);
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await techniciansAPI.getAll();
      console.log("Fetched technicians:", response.data);
      setTechnicians(response.data);
    } catch (error) {
      console.error("Error fetching technicians:", error);
      toast.error("Failed to load technicians");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        // Pour les modifications
        const updateData = { ...formData };
        delete updateData.images;
        delete updateData.client; // On ne modifie pas le client

        console.log("Updating ticket with data:", updateData);
        await api.ticketsAPI.update(formData.id, updateData);
        toast.success("Ticket updated successfully");
      } else {
        // Pour la création
        if (images.length > 0) {
          // Utiliser FormData quand on a des images
          const submitFormData = new FormData();
          submitFormData.append("title", formData.title);
          submitFormData.append("description", formData.description);
          submitFormData.append("priority", formData.priority);

          // Ajouter les images
          images.forEach((file, index) => {
            submitFormData.append("images", file);
          });

          await ticketsAPI.create(submitFormData);
        } else {
          // Utiliser JSON quand pas d'images
          const submitData = {
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
          };

          await ticketsAPI.create(submitData);
        }

        toast.success("Ticket created successfully");
      }

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error saving ticket:", error);
      console.error("Error response:", error.response?.data);
      toast.error(`Failed to ${isEdit ? "update" : "create"} ticket`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log(
      "Selected images:",
      files.map((f) => ({ name: f.name, size: f.size, type: f.type }))
    );
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    console.log("Removing image at index:", index);
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2" />
        {isEdit ? "Edit Ticket" : "Create New Ticket"}
      </h2>

      {/* Debug info */}
      <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
        <strong>Debug Info:</strong>
        <br />
        User Type: {user?.userType}
        <br />
        User ID: {user?.id}
        <br />
        Current Client Value: {formData.client}
        <br />
        Images Selected: {images.length}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {isEdit && (
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        {user?.userType === "admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Assign Technician
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="technician"
                  value={formData.technician}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.user?.first_name} {tech.user?.last_name} (
                      {tech.specialty})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Attachments</label>
          {images.length > 0 && (
            <div className="mb-3 space-y-2">
              {images.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <Paperclip className="w-4 h-4 mr-2" />
                    {file.name} ({Math.round(file.size / 1024)}KB)
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <label className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm font-medium cursor-pointer w-max">
            <Paperclip className="w-4 h-4 mr-2" />
            Add Images
            <input
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
            />
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Supported formats: JPG, PNG, GIF
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Ticket" : "Create Ticket"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
// Main component that uses all forms
const ModelForms = () => {
  const [activeForm, setActiveForm] = useState("ticket");
  const { user } = useAuth();

  const renderForm = () => {
    switch (activeForm) {
      case "client":
        return (
          <ClientForm
            onSuccess={() => setActiveForm("")}
            onCancel={() => setActiveForm("")}
            clientData={undefined}
          />
        );
      case "technician":
        return (
          <TechnicianForm
            onSuccess={() => setActiveForm("")}
            onCancel={() => setActiveForm("")}
            technicianData={undefined}
          />
        );
      case "intervention":
        return (
          <InterventionForm
            onSuccess={() => setActiveForm("")}
            onCancel={() => setActiveForm("")}
            ticketId={undefined}
          />
        );
      case "ticket":
      default:
        return (
          <TicketForm
            onSuccess={() => setActiveForm("")}
            onCancel={() => setActiveForm("")}
            ticketData={undefined}
          />
        );
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 dark:text-gray-50 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Manage Data</h1>

          {!activeForm ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(user?.userType === "client" || user?.userType === "admin") && (
                <div
                  className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveForm("ticket")}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mb-4">
                    <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Tickets</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Create and manage support tickets
                  </p>
                </div>
              )}

              {(user?.userType === "technician" ||
              user?.userType === "admin") && (
                <div
                  className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setActiveForm("intervention")}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mb-4">
                    <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h3 className="font-semibold mb-2">Interventions</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Create intervention reports
                  </p>
                </div>
              )}

              {user?.userType === "admin" && (
                <>
                  <div
                    className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveForm("client")}
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mb-4">
                      <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Clients</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Manage client accounts
                    </p>
                  </div>

                  <div
                    className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setActiveForm("technician")}
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mb-4">
                      <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="font-semibold mb-2">Technicians</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Manage technician accounts
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <button
                onClick={() => setActiveForm("")}
                className="flex items-center text-blue-600 dark:text-blue-400 mb-6"
              >
                <X className="w-4 h-4 mr-1" />
                Back to menu
              </button>
              {renderForm()}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ModelForms;
